
"use server";

import { revalidatePath } from "next/cache";
import * as admin from 'firebase-admin';
import { FieldValue } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}
const firestore = admin.firestore();


export async function sendFriendRequest(senderId: string, senderName: string, senderEmail: string, receiverId: string) {
    if (senderId === receiverId) {
        return { failure: "You cannot send a friend request to yourself." };
    }

    try {
        const receiverRef = firestore.collection('users').doc(receiverId);
        const receiverDoc = await receiverRef.get();
        if (!receiverDoc.exists) {
            return { failure: "User not found." };
        }

        // Check if they are already friends
        const senderRef = firestore.collection('users').doc(senderId);
        const senderDoc = await senderRef.get();
        if(senderDoc.data()?.friendIds?.includes(receiverId)) {
            return { failure: "You are already friends with this user." };
        }

        // Check for existing pending request
        const existingRequestQuery = await firestore.collection('friendRequests')
            .where('senderId', '==', senderId)
            .where('receiverId', '==', receiverId)
            .where('status', '==', 'pending')
            .get();

        if (!existingRequestQuery.empty) {
            return { failure: "You have already sent a friend request to this user." };
        }


        const requestRef = firestore.collection("friendRequests").doc();
        await requestRef.set({
            senderId,
            senderName,
            senderEmail,
            receiverId,
            status: 'pending',
            createdAt: FieldValue.serverTimestamp(),
        });
        
        revalidatePath('/friends');
        return { success: "Friend request sent!" };
    } catch (error) {
        console.error("Error sending friend request:", error);
        return { failure: "An error occurred while sending the request." };
    }
}

export async function handleFriendRequest(requestId: string, acceptorId: string, senderId: string, action: "accept" | "decline") {
    const requestRef = firestore.collection('friendRequests').doc(requestId);
    
    try {
        if (action === "decline") {
            await requestRef.update({ status: 'declined' });
            revalidatePath('/friends');
            return { success: "Request declined." };
        }

        // Accept action
        const acceptorRef = firestore.collection('users').doc(acceptorId);
        const senderRef = firestore.collection('users').doc(senderId);

        const batch = firestore.batch();
        batch.update(acceptorRef, { friendIds: FieldValue.arrayUnion(senderId) });
        batch.update(senderRef, { friendIds: FieldValue.arrayUnion(acceptorId) });
        batch.update(requestRef, { status: 'accepted' });

        await batch.commit();

        revalidatePath('/friends');
        return { success: "Friend added!" };
    } catch(error) {
        console.error("Error handling friend request:", error);
        return { failure: "An error occurred." };
    }
}
