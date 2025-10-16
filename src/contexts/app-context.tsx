
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from "react";
import { useUser, useFirestore, useMemoFirebase, errorEmitter, FirestorePermissionError } from "@/firebase";
import { collection, doc, setDoc, query, where, DocumentData, collectionGroup, writeBatch, deleteDoc, arrayUnion } from "firebase/firestore";
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
          // Use non-blocking write with contextual error handling
          setDoc(userDocRef, newUserProfile)
            .catch(serverError => {
              const permissionError = new FirestorePermissionError({
                path: userDocRef.path,
                operation: 'create',
                requestResourceData: newUserProfile,
              });
              errorEmitter.emit('permission-error', permissionError);
            });
        }
      }
    };
    createUserProfile();
  }, [user, userProfile, isProfileLoading, userDocRef]);

  // Fetch incoming friend requests
  const friendRequestsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'users', user.uid, 'friendRequests');
  }, [user, firestore]);
  
  const { data: incomingFriendRequests, isLoading: isRequestsLoading } = useCollection<FriendRequest>(friendRequestsQuery);

  // This effect handles "accepted" notifications from other users
  useEffect(() => {
      if (!firestore || !user || !incomingFriendRequests) return;
  
      const acceptedRequests = incomingFriendRequests.filter(req => req.status === 'accepted');
  
      if (acceptedRequests.length > 0) {
        const batch = writeBatch(firestore);
        const currentUserRef = doc(firestore, 'users', user.uid);
        
        acceptedRequests.forEach(req => {
          // Add the new friend (who accepted the request) to the current user's friend list
          batch.update(currentUserRef, { friendIds: arrayUnion(req.senderId) });
          // Delete the "accepted" notification from our own subcollection
          const requestRef = doc(firestore, 'users', user.uid, 'friendRequests', req.id);
          batch.delete(requestRef);
        });
  
        batch.commit().catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: `BATCH WRITE on /users/${user.uid}/friendRequests`,
                operation: 'write',
                requestResourceData: { acceptedRequests }
            });
            errorEmitter.emit('permission-error', permissionError);
        });
      }
    }, [incomingFriendRequests, firestore, user]);


  // Fetch friends' profiles
  const friendsQuery = useMemoFirebase(() => {
    if (!userProfile || !userProfile.friendIds || userProfile.friendIds.length === 0) return null;
    // Important: Firestore 'in' queries are limited to 30 items. For a larger friends list,
    // this would need to be refactored (e.g., fetching documents one by one).
    return query(collection(firestore, 'users'), where('__name__', 'in', userProfile.friendIds.slice(0, 30)));
  }, [userProfile, firestore]);

  const { data: friends, isLoading: isFriendsLoading } = useCollection<UserProfile>(friendsQuery);

  
  const goals = userProfile?.goals || [];
  const activeGoal = userProfile?.activeGoalDescription
    ? goals.find(g => g.description === userProfile.activeGoalDescription) || null
    : goals.length > 0 ? goals[0] : null;

  const updateFirestore = (updates: Partial<UserProfile>) => {
    if (userDocRef) {
      // Use non-blocking write with contextual error handling
      setDoc(userDocRef, updates, { merge: true })
        .catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: userDocRef.path,
                operation: 'update',
                requestResourceData: updates,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
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
