
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Home, Wallet, Users, Settings, Target, Bot } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
  SheetHeader
} from "@/components/ui/sheet";
import { UserNav } from "@/components/user-nav";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/wallet", label: "Wallet & Badges", icon: Wallet },
    { href: "/friends", label: "Friends", icon: Users },
    { href: "/ask-ai", label: "Ask AI", icon: Bot },
    { href: "/settings", label: "Settings", icon: Settings },
];

export function Header() {
  const pathname = usePathname();
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
            <SheetHeader>
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">Main navigation links for the GoalForge app.</SheetDescription>
            </SheetHeader>
            <nav className="grid gap-2 text-lg font-medium">
                <Link
                href="#"
                className="flex items-center gap-2 text-lg font-semibold mb-4"
                >
                <span className="font-bold">GoalForge</span>
                </Link>
                {navItems.map((item) => (
                <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                    "mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground",
                    pathname === item.href && "bg-muted text-foreground"
                    )}
                >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                </Link>
                ))}
            </nav>
        </SheetContent>
      </Sheet>
      <div className="w-full flex-1">
        {/* Can add search or page title here if needed */}
      </div>
      <UserNav />
    </header>
  );
}
