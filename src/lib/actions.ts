"use server";

import { generateDailyChallenge } from "@/ai/flows/generate-daily-challenge";
import { generateTestQuestions } from "@/ai/flows/generate-test-questions";
import { GenerateTestQuestionsInputSchema, type GenerateTestQuestionsOutput, GenerateDailyChallengeInputSchema, type GenerateDailyChallengeInput } from "@/ai/schemas";

export async function getDailyChallenge(input: GenerateDailyChallengeInput) {
  const validatedInput = GenerateDailyChallengeInputSchema.safeParse(input);

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
