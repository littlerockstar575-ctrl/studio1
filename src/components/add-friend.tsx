
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
import { revalidateFriendsPage } from "@/lib/friends-actions";
import { useAppContext } from "@/contexts/app-context";
import { useFirestore } from "@/firebase/provider";
import { collection, addDoc, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export function AddFriend() {
    const { user, userProfile } = useAppContext();
    const firestore = useFirestore();
    const [friendId, setFriendId] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSendRequest = async () => {
        if (!user || !userProfile || !friendId.trim() || !firestore) return;
        const receiverId = friendId.trim();

        if (user.uid === receiverId) {
            toast({ variant: "destructive", title: "Oops!", description: "You cannot send a friend request to yourself.", duration: 2000 });
            return;
        }

        setIsLoading(true);

        try {
            const receiverRef = doc(firestore, "users", receiverId);
            const receiverDoc = await getDoc(receiverRef);

            if (!receiverDoc.exists()) {
                toast({ variant: "destructive", title: "Error", description: "User not found.", duration: 2000 });
                setIsLoading(false);
                return;
            }

            if (userProfile.friendIds?.includes(receiverId)) {
                toast({ variant: "destructive", title: "Oops!", description: "You are already friends with this user.", duration: 2000 });
                setIsLoading(false);
                return;
            }

            const requestsRef = collection(firestore, 'friendRequests');
            const q = query(requestsRef, 
                where('senderId', '==', user.uid), 
                where('receiverId', '==', receiverId),
                where('status', '==', 'pending')
            );
            const existingRequestSnap = await getDocs(q);

            if (!existingRequestSnap.empty) {
                toast({ variant: "destructive", title: "Oops!", description: "You have already sent a request to this user.", duration: 2000 });
                setIsLoading(false);
                return;
            }

            await addDoc(requestsRef, {
                senderId: user.uid,
                senderName: userProfile.name,
                senderEmail: userProfile.email,
                receiverId: receiverId,
                status: 'pending',
            });

            await revalidateFriendsPage();
            toast({ title: "Success", description: "Friend request sent!", duration: 2000 });
            setFriendId("");

        } catch (error: any) {
            console.error("Error sending friend request:", error);
            toast({ variant: "destructive", title: "Error", description: "An error occurred while sending the request.", duration: 2000 });
        } finally {
            setIsLoading(false);
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
