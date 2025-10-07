"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface AppContextType {
  goal: string | null;
  setGoal: (goal: string | null) => void;
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
  streak: number;
  setStreak: React.Dispatch<React.SetStateAction<number>>;
  completedChallenges: number;
  setCompletedChallenges: React.Dispatch<React.SetStateAction<number>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [goal, setGoal] = useState<string | null>(null);
  const [coins, setCoins] = useState(3500);
  const [streak, setStreak] = useState(35);
  const [completedChallenges, setCompletedChallenges] = useState(0);


  return (
    <AppContext.Provider value={{ goal, setGoal, coins, setCoins, streak, setStreak, completedChallenges, setCompletedChallenges }}>
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
