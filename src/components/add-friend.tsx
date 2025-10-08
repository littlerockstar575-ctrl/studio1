
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { sendFriendRequest } from "@/lib/friends-actions";
import { useAppContext } from "@/contexts/app-context";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export function AddFriend() {
    const { user, userProfile } = useAppContext();
    const [friendId, setFriendId] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSendRequest = async () => {
        if (!user || !userProfile || !friendId.trim()) return;

        setIsLoading(true);
        const result = await sendFriendRequest(user.uid, userProfile.name, userProfile.email, friendId.trim());
        setIsLoading(false);

        if (result.success) {
            toast({ title: "Success", description: result.success, duration: 2000 });
            setFriendId("");
        } else {
            toast({ variant: "destructive", title: "Oops!", description: result.failure, duration: 2000 });
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Add a Friend</CardTitle>
                <CardDescription>
                    Enter your friend's User ID to send them a friend request.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex w-full max-w-sm items-center space-x-2">
                    <div className="grid flex-1 gap-2">
                         <Label htmlFor="friendId" className="sr-only">Friend's User ID</Label>
                         <Input id="friendId" placeholder="Friend's User ID" value={friendId} onChange={(e) => setFriendId(e.target.value)} />
                    </div>
                    <Button type="button" onClick={handleSendRequest} disabled={isLoading || !friendId.trim()}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send Request
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
