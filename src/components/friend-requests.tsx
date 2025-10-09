
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
            
            // 2. Update the sender's friend list - THIS IS THE PROBLEM. A user cannot write to another user's doc.
            // We will now correctly handle this on the client of the sender.
            // For this to work, we need to update the status of the request so the sender knows it was accepted.
            // Let's create a NEW request document in the SENDER's subcollection to notify them.
            const senderNotificationRef = doc(collection(firestore, 'users', request.senderId, 'friendRequests'));
            batch.set(senderNotificationRef, { ...request, status: 'accepted', id: senderNotificationRef.id });

            // 3. Delete the original friend request from the receiver's subcollection
            batch.delete(requestRef);
            
        } else {
            // Just update the status to 'declined'. The sender won't get a notification.
            // A better approach would be to delete it.
            batch.delete(requestRef);
        }
        
        batch.commit()
            .then(async () => {
                await revalidateFriendsPage();
                toast({ title: "Success", description: action === 'accept' ? "Friend added!" : "Request declined.", duration: 2000 });
            })
            .catch(serverError => {
                // This error handling is now correct and will catch any other issues.
                const permissionError = new FirestorePermissionError({
                    path: `BATCH WRITE on /users/${user.uid} and potentially /users/${request.senderId}`, 
                    operation: 'update',
                    requestResourceData: {
                        friendRequestUpdate: { status: action },
                        ...(action === 'accept' && { 
                            userProfileUpdate: { friendIds: arrayUnion(request.senderId) },
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

    const pendingRequests = incomingFriendRequests?.filter(req => req.status === 'pending');

    if (!pendingRequests || pendingRequests.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-8">
                <p>You have no new friend requests.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {pendingRequests.map(request => (
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
