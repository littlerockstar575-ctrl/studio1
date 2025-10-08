
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Flame, Coins } from "lucide-react";
import { useAppContext, UserProfile } from "@/contexts/app-context";
import { cn } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";

export function FriendsLeaderboard() {
  const { userProfile, friends, isFriendsLoading, user } = useAppContext();

  if (isFriendsLoading || !userProfile) {
    return (
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Rank</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Streak</TableHead>
                <TableHead className="text-right">Coins</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {[...Array(3)].map((_, i) => (
                     <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-8" /></TableCell>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-9 w-9 rounded-full" />
                                <Skeleton className="h-5 w-24" />
                            </div>
                        </TableCell>
                         <TableCell><Skeleton className="h-5 w-12 ml-auto" /></TableCell>
                         <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
  }

  const allUsers = [...(friends || []), userProfile as UserProfile & {id: string}];
  
  const leaderboardData = allUsers
    .filter((u, index, self) => u && index === self.findIndex((t) => t && t.id === u.id)) // Deduplicate
    .sort((a, b) => (b.coins ?? 0) - (a.coins ?? 0))
    .map((friend, index) => ({ ...friend, rank: index + 1 }));

  if (leaderboardData.length === 0) {
      return (
          <div className="text-center text-muted-foreground py-8">
                <p>Your leaderboard is empty.</p>
                <p className="text-sm">Add some friends to see how you compare!</p>
            </div>
      )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]">Rank</TableHead>
          <TableHead>User</TableHead>
          <TableHead className="text-right">Streak</TableHead>
          <TableHead className="text-right">Coins</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leaderboardData.map((friend) => (
          <TableRow key={friend.rank} className={cn(friend.id === user?.uid && "bg-primary/10")}>
            <TableCell className="font-medium">{friend.rank}</TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{friend.name?.charAt(0) ?? 'U'}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{friend.id === user?.uid ? 'You' : friend.name}</span>
              </div>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1 font-medium">
                <Flame className="h-4 w-4 text-orange-400" />
                {friend.streak}
              </div>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1 font-medium">
                <Coins className="h-4 w-4 text-yellow-400" />
                {(friend.coins ?? 0).toLocaleString()}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
