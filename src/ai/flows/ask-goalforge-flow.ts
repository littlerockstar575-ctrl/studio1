'use server';
/**
 * @fileOverview An AI agent that answers user questions.
 *
 * - askGoalForge - A function that returns an answer from the GoalForge AI.
 */

import {ai} from '@/ai/genkit';
import { AskGoalForgeInputSchema, AskGoalForgeOutputSchema, type AskGoalForgeInput, type AskGoalForgeOutput } from '@/ai/schemas';

export async function askGoalForge(input: AskGoalForgeInput): Promise<AskGoalForgeOutput> {
  return askGoalForgeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askGoalForgePrompt',
  input: {schema: AskGoalForgeInputSchema},
  output: {schema: AskGoalForgeOutputSchema},
  prompt: `You are GoalForge, a friendly and motivational AI assistant for the GoalForge application. Your purpose is to help users with their goals, answer questions about the app, and provide encouragement.

  User's question: {{{question}}}
  `,
});

const askGoalForgeFlow = ai.defineFlow(
  {
    name: 'askGoalForgeFlow',
    inputSchema: AskGoalForgeInputSchema,
    outputSchema: AskGoalForgeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
