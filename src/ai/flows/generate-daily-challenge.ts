'use server';

/**
 * @fileOverview A daily challenge generation AI agent.
 *
 * - generateDailyChallenge - A function that handles the daily challenge generation process.
 * - GenerateDailyChallengeInput - The input type for the generateDailyChallenge function.
 * - GenerateDailyChallengeOutput - The return type for the generateDailyChallenge function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDailyChallengeInputSchema = z.object({
  goal: z.string().describe('The user specified goal.'),
});
export type GenerateDailyChallengeInput = z.infer<
  typeof GenerateDailyChallengeInputSchema
>;

const GenerateDailyChallengeOutputSchema = z.object({
  challenge: z.string().describe('The generated daily challenge. If the goal is about coding, this should be a simple problem statement, not just "write hello world".'),
});
export type GenerateDailyChallengeOutput = z.infer<
  typeof GenerateDailyChallengeOutputSchema
>;

export async function generateDailyChallenge(
  input: GenerateDailyChallengeInput
): Promise<GenerateDailyChallengeOutput> {
  return generateDailyChallengeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDailyChallengePrompt',
  input: {schema: GenerateDailyChallengeInputSchema},
  output: {schema: GenerateDailyChallengeOutputSchema},
  prompt: `You are a personal assistant designed to generate daily challenges for users based on their goals.

  Generate a single, achievable daily challenge that helps the user progress towards their goal. The challenge should be slightly more involved than a trivial task.

  For example, if the goal is 'Learn Python', a good challenge is 'Write a Python function that takes a list of numbers and returns the sum.' A bad challenge is 'Write "Hello, World!" in Python'.

  Goal: {{{goal}}}
  `,
});

const generateDailyChallengeFlow = ai.defineFlow(
  {
    name: 'generateDailyChallengeFlow',
    inputSchema: GenerateDailyChallengeInputSchema,
    outputSchema: GenerateDailyChallengeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
