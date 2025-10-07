"use server";

import { generateDailyChallenge } from "@/ai/flows/generate-daily-challenge";
import { generateTestQuestions, GenerateTestQuestionsInputSchema, GenerateTestQuestionsOutput } from "@/ai/flows/generate-test-questions";
import { z } from "zod";

const dailyChallengeInputSchema = z.object({
  goal: z.string(),
});

export async function getDailyChallenge(input: { goal: string }) {
  const validatedInput = dailyChallengeInputSchema.safeParse(input);

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

export async function getTestQuestions(input: { topic: string }): Promise<{ success: GenerateTestQuestionsOutput } | { failure: string }> {
    const validatedInput = GenerateTestQuestionsInputSchema.safeParse(input);

    if (!validatedInput.success) {
        return { failure: "Invalid input for generating test questions." };
    }

    try {
        const result = await generateTestQuestions(validatedInput.data);
        return { success: result };
    } catch (error) {
        console.error(error);
        return { failure: "Failed to generate test questions. Please try again." };
    }
}
