
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
  prompt: `You are a personal assistant designed to generate daily challenges for users based on their goals, a chosen difficulty level, and their progress.

  The user's current goal is: {{{goal}}}
  The user has chosen the difficulty: {{{difficulty}}}
  The user has completed: {{{completedChallenges}}} challenges for this specific goal.

  Your main priority is to create a challenge that matches the user's chosen difficulty level. The number of completed challenges should be used for gradual progression *within* that difficulty tier.

  - **Beginner**: These are for absolute beginners. The very first challenges (0-3 completed) should be extremely simple "hello world" style tasks. For coding, this means printing output, declaring variables, or writing a basic function.
  - **Intermediate**: Assume the user knows the basics. Challenges should combine concepts, like loops with conditionals, or working with basic data structures like arrays/lists and objects/dictionaries.
  - **Advanced**: These users are comfortable with the core language. Give them challenges that involve more complex problem-solving, reading/writing files, or interacting with simple data formats like JSON.
  - **Hacker**: This level is for experienced users. Challenges should involve using popular libraries, making API calls, or solving algorithmic problems.
  - **Godly**: For experts looking for a serious test. Challenges could involve performance optimization, advanced data structures, concurrency, or architectural design patterns.

  Use the 'completedChallenges' number to create a smooth learning curve *within* the chosen difficulty. For example, an Intermediate user with 0 completed challenges should get an easier Intermediate task than one with 10 completed challenges.

  Example for 'Learn Python', Difficulty 'Intermediate':
  - Completed 0: 'Write a function that takes a list of numbers and returns a new list with only the even numbers.'
  - Completed 10: 'Write a script that reads a simple JSON file containing a list of users and prints their names.'

  Example for 'Learn JavaScript', Difficulty 'Beginner':
  - Completed 0: 'Use console.log() to print "Hello, GoalForge!"'
  - Completed 5: 'Write a function that uses a for loop to print numbers from 1 to 10.'

  A bad challenge is one that doesn't match the selected difficulty. Do not give a 'Beginner' an API challenge. Do not give a 'Hacker' a "declare a variable" challenge.
  Also, analyze the goal description itself. If the user says 'learn ADVANCED python', lean towards the harder end of their selected difficulty tier, even if their completed challenge count is low.
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
