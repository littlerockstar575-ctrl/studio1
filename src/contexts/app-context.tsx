
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from "react";
import { useUser } from "@/firebase/provider";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useFirestore } from "@/firebase/provider";
import { useDoc } from "@/firebase/firestore/use-doc";
import { User as FirebaseUser } from "firebase/auth";

export interface Goal {
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Hacker' | 'Godly';
  completedChallenges: number;
}

export interface UserProfile {
  name: string;
  email: string;
  coins: number;
  streak: number;
  lastChallengeDate: string | null; // ISO date string
  goals: Goal[];
  activeGoalDescription: string | null;
}

interface AppContextType {
  user: FirebaseUser | null;
  isUserLoading: boolean;
  userProfile: UserProfile | null;
  isProfileLoading: boolean;
  activeGoal: Goal | null;
  setActiveGoal: (goal: Goal | null) => void;
  goals: Goal[];
  setGoals: (goals: Goal[]) => void;
  updateGoal: (updatedGoal: Goal) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  
  const userDocRef = useMemo(() => {
    if (!user) return undefined;
    return doc(firestore, "users", user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    const createUserProfile = async () => {
      if (user && !isProfileLoading && !userProfile) {
        console.log("Creating user profile for new user:", user.uid);
        const newUserProfile: UserProfile = {
          name: user.displayName || "Anonymous User",
          email: user.email || "",
          coins: 0,
          streak: 0,
          lastChallengeDate: null,
          goals: [],
          activeGoalDescription: null,
        };
        await setDoc(userDocRef!, newUserProfile);
      }
    };
    createUserProfile();
  }, [user, userProfile, isProfileLoading, userDocRef]);
  
  const goals = userProfile?.goals || [];
  const activeGoal = userProfile?.activeGoalDescription
    ? goals.find(g => g.description === userProfile.activeGoalDescription) || null
    : goals.length > 0 ? goals[0] : null;

  const updateFirestore = async (updates: Partial<UserProfile>) => {
    if (userDocRef) {
      await setDoc(userDocRef, updates, { merge: true });
    }
  };

  const setGoals = (newGoals: Goal[]) => {
    updateFirestore({ goals: newGoals });
  };

  const setActiveGoal = (goal: Goal | null) => {
    updateFirestore({ activeGoalDescription: goal?.description || null });
  };

  const updateGoal = (updatedGoal: Goal) => {
    const newGoals = goals.map(g =>
      g.description === updatedGoal.description ? updatedGoal : g
    );
    let newActiveGoalDesc = activeGoal?.description;
    if (activeGoal?.description === updatedGoal.description) {
        newActiveGoalDesc = updatedGoal.description;
    }
    updateFirestore({ goals: newGoals, activeGoalDescription: newActiveGoalDesc });
  };

  const value: AppContextType = {
    user,
    isUserLoading,
    userProfile,
    isProfileLoading,
    activeGoal,
    setActiveGoal,
    goals,
    setGoals,
    updateGoal,
  };


  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
