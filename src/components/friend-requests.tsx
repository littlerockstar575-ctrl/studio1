
"use client";

import { useAppContext, FriendRequest } from "@/contexts/app-context";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { Check, X } from "lucide-react";
import { handleFriendRequest } from "@/lib/friends-actions";
import { toast } from "@/hooks/use-toast";

export function FriendRequests() {
    const { incomingFriendRequests, isRequestsLoading, user } = useAppContext();

    const onHandleRequest = async (request: FriendRequest & { id: string }, action: "accept" | "decline") => {
        if (!user) return;
        const result = await handleFriendRequest(request.id, user.uid, request.senderId, action);
        if (result.success) {
            toast({ title: "Success", description: result.success, duration: 2000 });
        } else {
            toast({ variant: 'destructive', title: "Error", description: result.failure, duration: 2000 });
        }
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
