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
  prompt: `You are a personal assistant designed to generate daily challenges for users based on their goals and progress.

  The user's current goal is: {{{goal}}}
  The user's current streak is: {{{streak}}} days.

  Generate a single, achievable daily challenge that helps the user progress towards their goal.
  
  The difficulty of the challenge should be based on the user's streak:
  - Streak 0-7: Beginner-friendly tasks.
  - Streak 8-20: Intermediate tasks that are more involved.
  - Streak 21+: Advanced tasks that require more effort and knowledge.

  For example, if the goal is 'Learn Python':
  - Low streak: 'Write a Python function that takes a list of numbers and returns the sum.'
  - High streak: 'Build a small command-line tool in Python that fetches weather data from a free API.'

  A bad challenge is something trivial like 'Write "Hello, World!" in Python'. Make the challenge meaningful.
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
