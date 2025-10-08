
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FriendsLeaderboard } from "@/components/friends-leaderboard";
import { FriendRequests } from "@/components/friend-requests";
import { AddFriend } from "@/components/add-friend";

export default function FriendsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Friends</h1>
      </div>

      <AddFriend />

      <Tabs defaultValue="leaderboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="requests">Friend Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle>Leaderboard</CardTitle>
              <CardDescription>
                See how you stack up against your friends.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FriendsLeaderboard />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Friend Requests</CardTitle>
              <CardDescription>
                Manage your incoming friend requests.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <FriendRequests />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
