'use server';

/**
 * @fileOverview A daily challenge generation AI agent.
 *
 * - generateDailyChallenge - A function that handles the daily challenge generation process.
 */

import {ai} from '@/ai/genkit';
import { GenerateDailyChallengeInputSchema, GenerateDailyChallengeOutputSchema, type GenerateDailyChallengeInput, type GenerateDailyChallengeOutput } from '@/ai/schemas';

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
