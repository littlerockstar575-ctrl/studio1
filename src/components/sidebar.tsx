
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, Users, Settings, Flame, Coins, Bot } from "lucide-react";

import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useAppContext } from "@/contexts/app-context";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/wallet", label: "Wallet & Badges", icon: Wallet },
  { href: "/friends", label: "Friends", icon: Users },
  { href: "/ask-ai", label: "Ask AI", icon: Bot },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { userProfile } = useAppContext();

  const coins = userProfile?.coins ?? 0;
  const streak = userProfile?.streak ?? 0;

  return (
    <div className="hidden border-r bg-card text-card-foreground md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Logo />
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  pathname === item.href && "bg-muted text-primary"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4">
          <Card>
            <CardHeader className="p-2 pt-0 md:p-4">
              <CardTitle>Your Progress</CardTitle>
            </CardHeader>
            <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-sm font-medium">
                        <div className="flex items-center gap-2">
                            <Flame className="h-5 w-5 text-primary" />
                            <span>Streak</span>
                        </div>
                        <span>{streak} Days</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-medium">
                        <div className="flex items-center gap-2">
                            <Coins className="h-5 w-5 text-primary" />
                            <span>Coins</span>
                        </div>
                        <span>{coins.toLocaleString()}</span>
                    </div>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
