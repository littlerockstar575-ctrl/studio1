
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface AppContextType {
  activeGoal: string | null;
  setActiveGoal: (goal: string | null) => void;
  goals: string[];
  setGoals: React.Dispatch<React.SetStateAction<string[]>>;
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
  streak: number;
  setStreak: React.Dispatch<React.SetStateAction<number>>;
  completedChallenges: number;
  setCompletedChallenges: React.Dispatch<React.SetStateAction<number>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [goals, setGoals] = useState<string[]>([]);
  const [activeGoal, setActiveGoal] = useState<string | null>(null);
  const [coins, setCoins] = useState(3500);
  const [streak, setStreak] = useState(35);
  const [completedChallenges, setCompletedChallenges] = useState(0);

  useEffect(() => {
    // This effect ensures that if there's no active goal but there are goals in the list,
    // the first one becomes active. If the active goal is removed, it also assigns a new one.
    if (!activeGoal && goals.length > 0) {
      setActiveGoal(goals[0]);
    } else if (goals.length === 0) {
      setActiveGoal(null);
    } else if (activeGoal && !goals.includes(activeGoal)) {
      // If the currently active goal is no longer in the list, pick the first one as the new active goal.
      setActiveGoal(goals[0] || null);
    }
  }, [goals, activeGoal]);


  return (
    <AppContext.Provider value={{ activeGoal, setActiveGoal, goals, setGoals, coins, setCoins, streak, setStreak, completedChallenges, setCompletedChallenges }}>
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
