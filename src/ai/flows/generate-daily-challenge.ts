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
  - Streak 0-3: Absolute beginner tasks. Focus on the most basic building blocks. For a coding goal, this means challenges like printing output, declaring and manipulating variables, and defining simple functions. The tasks should be single-concept and take less than 5 minutes.
  - Streak 4-10: Beginner-friendly tasks that might combine two simple concepts, like using variables within a simple loop or conditional statement.
  - Streak 11-20: Intermediate tasks that are more involved and require problem-solving, like working with arrays/lists or basic data structures.
  - Streak 21+: Advanced tasks that require more effort and knowledge, like reading from files or interacting with simple data formats.

  For example, if the goal is 'Learn Python':
  - Streak 0: 'Print "Hello, GoalForge!" to the console.'
  - Streak 1: 'Declare a variable named "age" and assign your age to it. Then print the variable.'
  - Streak 2: 'Write a function called "greet" that takes a name as an argument and prints "Hello, [name]".'
  - Streak 5: 'Write a Python function that takes two numbers and returns their sum.'
  - Streak 15: 'Write a Python script that reads a text file and counts the number of words.'
  - Streak 25: 'Build a small command-line tool in Python that fetches weather data from a free API.'

  A bad challenge is something too complex for a beginner, like asking them to process a CSV file on day one. Keep it simple and foundational at the start.
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
