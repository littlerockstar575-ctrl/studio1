
"use server";

import { revalidatePath } from "next/cache";

// This is now a lightweight server action. 
// The core logic is moved to the client and secured by Firestore rules.
// This action's primary role is to trigger revalidation.

export async function revalidateFriendsPage() {
    revalidatePath('/friends');
}
