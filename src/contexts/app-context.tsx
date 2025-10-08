
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from "react";
import { useUser, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc, setDoc, query, where, DocumentData } from "firebase/firestore";
import { useDoc } from "@/firebase/firestore/use-doc";
import { useCollection } from "@/firebase/firestore/use-collection";
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
  friendIds: string[];
}

export interface FriendRequest {
    senderId: string;
    senderName: string;
    senderEmail: string;
    receiverId: string;
    status: 'pending' | 'accepted' | 'declined';
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
  incomingFriendRequests: (FriendRequest & {id: string})[] | null;
  isRequestsLoading: boolean;
  friends: (UserProfile & {id: string})[] | null;
  isFriendsLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  
  const userDocRef = useMemoFirebase(() => {
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
          friendIds: [],
        };
        if (userDocRef) {
          await setDoc(userDocRef, newUserProfile);
        }
      }
    };
    createUserProfile();
  }, [user, userProfile, isProfileLoading, userDocRef]);

  // Fetch incoming friend requests
  const friendRequestsQuery = useMemoFirebase(() => {
    if (!user) return null;
    // Simplified query to only filter by receiverId, which is allowed by the rules.
    // Filtering by status will happen on the client side.
    return query(collection(firestore, 'friendRequests'), where('receiverId', '==', user.uid));
  }, [user, firestore]);
  
  const { data: allRequests, isLoading: isRequestsLoading } = useCollection<FriendRequest>(friendRequestsQuery);

  const incomingFriendRequests = useMemo(() => {
    if (!allRequests) return null;
    // Filter for pending requests on the client
    return allRequests.filter(req => req.status === 'pending');
  }, [allRequests]);


  // Fetch friends' profiles
  const friendsQuery = useMemoFirebase(() => {
    if (!userProfile || !userProfile.friendIds || userProfile.friendIds.length === 0) return null;
    return query(collection(firestore, 'users'), where('__name__', 'in', userProfile.friendIds));
  }, [userProfile, firestore]);
  const { data: friends, isLoading: isFriendsLoading } = useCollection<UserProfile>(friendsQuery);

  
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
    incomingFriendRequests,
    isRequestsLoading,
    friends,
    isFriendsLoading,
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
