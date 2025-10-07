"use server";

import { generateDailyChallenge } from "@/ai/flows/generate-daily-challenge";
import { z } from "zod";

const inputSchema = z.object({
  goal: z.string(),
});

export async function getDailyChallenge(input: { goal: string }) {
  const validatedInput = inputSchema.safeParse(input);

  if (!validatedInput.success) {
    return { failure: "Invalid input" };
  }

  try {
    const result = await generateDailyChallenge(validatedInput.data);
    return { success: result.challenge };
  } catch (error) {
    console.error(error);
    return { failure: "Failed to generate challenge. Please try again." };
  }
}
