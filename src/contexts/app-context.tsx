
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

export interface Goal {
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Hacker' | 'Godly';
  completedChallenges: number;
}

interface AppContextType {
  activeGoal: Goal | null;
  setActiveGoal: (goal: Goal | null) => void;
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
  streak: number;
  setStreak: React.Dispatch<React.SetStateAction<number>>;
  updateGoal: (updatedGoal: Goal) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [coins, setCoins] = useState(3500);
  const [streak, setStreak] = useState(35);

  useEffect(() => {
    if (!activeGoal && goals.length > 0) {
      setActiveGoal(goals[0]);
    } else if (goals.length === 0) {
      setActiveGoal(null);
    } else if (activeGoal && !goals.some(g => g.description === activeGoal.description)) {
      setActiveGoal(goals[0] || null);
    }
  }, [goals, activeGoal]);

  const updateGoal = (updatedGoal: Goal) => {
    setGoals(prevGoals => 
      prevGoals.map(g => 
        g.description === updatedGoal.description ? updatedGoal : g
      )
    );
    if (activeGoal?.description === updatedGoal.description) {
      setActiveGoal(updatedGoal);
    }
  };


  return (
    <AppContext.Provider value={{ activeGoal, setActiveGoal, goals, setGoals, coins, setCoins, streak, setStreak, updateGoal }}>
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
