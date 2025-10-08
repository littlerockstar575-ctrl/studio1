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
    if (goals.length > 0 && !activeGoal) {
      setActiveGoal(goals[0]);
    } else if (goals.length === 0) {
      setActiveGoal(null);
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
