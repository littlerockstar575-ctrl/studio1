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

  Your main priority is to ensure the user can build a successful habit. The challenges must be very easy at the beginning and gradually increase in difficulty.

  Generate a single, achievable daily challenge that helps the user progress towards their goal.
  
  The difficulty of the challenge MUST be based on the user's streak:
  - Streak 0-3: Absolute beginner tasks. These should be extremely simple, single-concept tasks that take less than 5 minutes.
  - Streak 4-10: Beginner-friendly tasks that might combine two simple concepts.
  - Streak 11-20: Intermediate tasks that are more involved and require problem-solving.
  - Streak 21+: Advanced tasks that require more effort and knowledge.

  For example, if the goal is 'Learn Python':
  - Streak 0: 'Declare a variable and assign it the value 10.'
  - Streak 1: 'Write a simple if/else statement that checks if a number is greater than 5.'
  - Streak 5: 'Write a Python function that takes two numbers and returns their sum.'
  - Streak 15: 'Write a Python script that reads a text file and counts the number of words.'
  - Streak 25: 'Build a small command-line tool in Python that fetches weather data from a free API.'

  A bad challenge is something trivial like 'Write "Hello, World!" in Python' (unless it's day 0). A bad challenge for a beginner is also something too complex like asking them to process a CSV file. Keep it simple at the start.
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
