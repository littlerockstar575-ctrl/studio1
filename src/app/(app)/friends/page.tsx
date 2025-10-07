"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { friendsData } from "@/lib/data";
import { Flame, Coins } from "lucide-react";
import { useAppContext } from "@/contexts/app-context";
import { cn } from "@/lib/utils";

export default function FriendsPage() {
  const { streak, coins } = useAppContext();
  
  // Update "You" in the data
  const leaderboardData = friendsData.map(friend => 
    friend.name === "You" ? { ...friend, streak, coins } : friend
  ).sort((a, b) => b.coins - a.coins).map((friend, index) => ({...friend, rank: index + 1}));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Friends Leaderboard</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>
            See how you stack up against your friends.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                <TableRow key={friend.rank} className={cn(friend.name === "You" && "bg-primary/10")}>
                  <TableCell className="font-medium">{friend.rank}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={friend.avatar}
                          alt={friend.name}
                        />
                        <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{friend.name}</span>
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
                      {friend.coins.toLocaleString()}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
