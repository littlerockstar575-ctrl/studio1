
"use client";

import { useAppContext, FriendRequest } from "@/contexts/app-context";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { Check, X } from "lucide-react";
import { revalidateFriendsPage } from "@/lib/friends-actions";
import { useFirestore } from "@/firebase/provider";
import { doc, writeBatch, arrayUnion } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export function FriendRequests() {
    const { incomingFriendRequests, isRequestsLoading, user } = useAppContext();
    const firestore = useFirestore();

    const onHandleRequest = async (request: FriendRequest & { id: string }, action: "accept" | "decline") => {
        if (!user || !firestore) return;

        const batch = writeBatch(firestore);
        
        // Reference to the friend request document in the current user's subcollection
        const requestRef = doc(firestore, 'users', user.uid, 'friendRequests', request.id);
        
        // Reference to the current user's (receiver's) profile document
        const currentUserRef = doc(firestore, 'users', user.uid);

        if (action === "accept") {
            // 1. Update the current user's (receiver's) friend list
            batch.update(currentUserRef, { friendIds: arrayUnion(request.senderId) });
            // 2. Update the sender's friend list
            const senderUserRef = doc(firestore, 'users', request.senderId);
            batch.update(senderUserRef, { friendIds: arrayUnion(user.uid) });
            // 3. Update the status of the friend request to 'accepted'
            batch.update(requestRef, { status: 'accepted' });
        } else {
            // Just update the status to 'declined'
            batch.update(requestRef, { status: 'declined' });
        }
        
        batch.commit()
            .then(async () => {
                await revalidateFriendsPage();
                toast({ title: "Success", description: action === 'accept' ? "Friend added!" : "Request declined.", duration: 2000 });
            })
            .catch(serverError => {
                // This is the required contextual error handling.
                const permissionError = new FirestorePermissionError({
                    path: `BATCH WRITE on /users/${user.uid} and /users/${request.senderId}`, 
                    operation: 'update',
                    requestResourceData: {
                        friendRequestUpdate: { status: action },
                        ...(action === 'accept' && { 
                            userProfileUpdate: { friendIds: arrayUnion(request.senderId) },
                            friendProfileUpdate: { friendIds: arrayUnion(user.uid) }
                        })
                    }
                });
                errorEmitter.emit('permission-error', permissionError);
            });
    }

    if (isRequestsLoading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                </div>
            </div>
        )
    }

    if (!incomingFriendRequests || incomingFriendRequests.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-8">
                <p>You have no new friend requests.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {incomingFriendRequests.map(request => (
                 <div key={request.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarFallback>{request.senderName.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-sm">{request.senderName}</p>
                            <p className="text-xs text-muted-foreground">{request.senderEmail}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button size="icon" className="h-8 w-8 bg-green-500 hover:bg-green-600" onClick={() => onHandleRequest(request, "accept")}>
                            <Check className="h-4 w-4" />
                        </Button>
                         <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => onHandleRequest(request, "decline")}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                 </div>
            ))}
        </div>
    );
}
