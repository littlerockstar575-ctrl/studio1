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
  The user has completed: {{{completedChallenges}}} challenges.

  Your main priority is to ensure the user can build a successful habit. The challenges must be very easy at the beginning and gradually increase in difficulty.

  The difficulty of the challenge MUST be based on the number of completed challenges:
  - Completed 0-3: Absolute beginner tasks. Focus on the most basic building blocks. For a coding goal, this means challenges like printing output, declaring and manipulating variables, and defining simple functions. The tasks should be single-concept and take less than 5 minutes. DO NOT give challenges involving loops, file access, or complex data structures like lists/arrays or objects/dictionaries.
  - Completed 4-10: Beginner-friendly tasks that might combine two simple concepts, like using variables within a simple loop or conditional statement.
  - Completed 11-20: Intermediate tasks that are more involved and require problem-solving, like working with arrays/lists or basic data structures.
  - Completed 21-29: Advanced tasks that require more effort and knowledge, like reading from files or interacting with simple data formats.
  - Completed 30+: Library-focused tasks. Once a user has a solid grasp of the fundamentals, start introducing popular libraries relevant to their goal. For a 'Learn Python' goal, introduce libraries like 'requests' for API calls, 'pandas' for data manipulation, or 'os' for file system interaction. For a 'Learn JavaScript' goal, you could introduce 'axios' for API calls, 'lodash' for utility functions, or how to use the built-in 'fs' module in Node.js. The challenges should be about using these libraries for simple tasks.

  Example for 'Learn Python':
  - Completed 0: 'Print "Hello, GoalForge!" to the console.'
  - Completed 1: 'Declare a variable named "age" and assign your age to it. Then print the variable.'
  - Completed 2: 'Write a function called "greet" that takes a name as an argument and prints "Hello, [name]".'
  - Completed 5: 'Write a Python function that takes two numbers and returns their sum.'
  - Completed 15: 'Write a Python script that reads a text file and counts the number of words.'
  - Completed 30: 'Use the Python 'requests' library to make a GET request to 'https://api.publicapis.org/entries' and print the total number of entries.'

  Example for 'Learn JavaScript':
  - Completed 0: 'Use console.log() to print "Hello, GoalForge!"'
  - Completed 1: 'Declare a const variable named "favoriteFood" and assign your favorite food to it. Then print it.'
  - Completed 2: 'Write a function called "sayHello" that takes a name and logs "Hello, [name]" to the console.'
  - Completed 5: 'Write a JavaScript function that uses a for loop to print numbers from 1 to 5.'
  - Completed 15: 'Write a function that accepts an array of numbers and returns a new array with only the even numbers.'
  - Completed 30: 'Using Node.js, use the built-in 'fs' module to read the contents of a text file and print it to the console.'

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
