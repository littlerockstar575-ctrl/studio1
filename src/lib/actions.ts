
"use server";

import { generateDailyChallenge } from "@/ai/flows/generate-daily-challenge";
import { generateTestQuestions } from "@/ai/flows/generate-test-questions";
import { generatePythonFact } from "@/ai/flows/generate-python-fact";
import { classifyGoal } from "@/ai/flows/classify-goal";
import { validateCode as validateCodeFlow } from "@/ai/flows/validate-code";
import { generateCompletionThought as generateCompletionThoughtFlow } from "@/ai/flows/generate-completion-thought";
import { generateChallengeHint as generateChallengeHintFlow } from "@/ai/flows/generate-challenge-hint";
import { GenerateTestQuestionsInputSchema, type GenerateTestQuestionsOutput, GenerateDailyChallengeInputSchema, type GenerateDailyChallengeInput, ClassifyGoalInputSchema, type ClassifyGoalOutput, ValidateCodeInputSchema, type ValidateCodeInput, type ValidateCodeOutput, GenerateCompletionThoughtInputSchema, type GenerateCompletionThoughtInput, type GenerateCompletionThoughtOutput, GenerateChallengeHintInputSchema, type GenerateChallengeHintInput, type GenerateChallengeHintOutput } from "@/ai/schemas";

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

export async function getPythonFact(): Promise<{ success: string } | { failure: string }> {
    try {
        const result = await generatePythonFact();
        return { success: result.fact };
    } catch (error) {
        console.error(error);
        return { failure: "Failed to generate a fact. Please try again." };
    }
}

export async function getClassifiedGoal(goal: string): Promise<{ success: ClassifyGoalOutput } | { failure: string }> {
    const validatedInput = ClassifyGoalInputSchema.safeParse({ goal });

    if (!validatedInput.success) {
        return { failure: "Invalid input for classifying goal." };
    }

    try {
        const result = await classifyGoal(validatedInput.data);
        return { success: result };
    } catch (error) {
        console.error(error);
        return { failure: "Failed to classify goal." };
    }
}

export async function validateCode(input: ValidateCodeInput): Promise<{ success: ValidateCodeOutput } | { failure: string }> {
    const validatedInput = ValidateCodeInputSchema.safeParse(input);

    if (!validatedInput.success) {
        return { failure: "Invalid input for code validation." };
    }

    try {
        const result = await validateCodeFlow(validatedInput.data);
        return { success: result };
    } catch (error) {
        console.error(error);
        return { failure: "Failed to validate code." };
    }
}

export async function getCompletionThought(input: GenerateCompletionThoughtInput): Promise<{ success: string } | { failure: string }> {
    const validatedInput = GenerateCompletionThoughtInputSchema.safeParse(input);

    if (!validatedInput.success) {
        return { failure: "Invalid input for generating completion thought." };
    }

    try {
        const result = await generateCompletionThoughtFlow(validatedInput.data);
        return { success: result.thought };
    } catch (error) {
        console.error(error);
        return { failure: "Failed to generate completion thought." };
    }
}

export async function getChallengeHint(input: GenerateChallengeHintInput): Promise<{ success: string } | { failure: string }> {
    const validatedInput = GenerateChallengeHintInputSchema.safeParse(input);
  
    if (!validatedInput.success) {
      return { failure: "Invalid input for generating hint." };
    }
  
    try {
      const result = await generateChallengeHintFlow(validatedInput.data);
      return { success: result.hint };
    } catch (error) {
      console.error(error);
      return { failure: "Failed to generate hint." };
    }
  }
