'use server';
/**
 * @fileOverview An AI agent for classifying user goals.
 *
 * - classifyGoal - A function that classifies a user's goal.
 */

import {ai} from '@/ai/genkit';
import { ClassifyGoalInputSchema, ClassifyGoalOutputSchema, type ClassifyGoalInput, type ClassifyGoalOutput } from '@/ai/schemas';

export async function classifyGoal(input: ClassifyGoalInput): Promise<ClassifyGoalOutput> {
  return classifyGoalFlow(input);
}

const prompt = ai.definePrompt({
  name: 'classifyGoalPrompt',
  input: {schema: ClassifyGoalInputSchema},
  output: {schema: ClassifyGoalOutputSchema},
  prompt: `You are a goal classification expert. Analyze the user's goal and classify it into one of three categories: 'coding', 'study', or 'other'.

  - 'coding': Use this for any goal related to writing code, learning a programming language, solving algorithms, or anything related to software development. If you classify a goal as 'coding', you MUST also identify the programming language and return it in the 'language' field (e.g., 'python', 'javascript', 'java'). If the language is generic like 'code', default to 'javascript'.
  - 'study': Use this for goals related to reading, learning a new subject (that isn't coding), or academic pursuits.
  - 'other': Use this for any other type of goal, like fitness, habits, etc.

  User's goal: {{{goal}}}
  `,
});

const classifyGoalFlow = ai.defineFlow(
  {
    name: 'classifyGoalFlow',
    inputSchema: ClassifyGoalInputSchema,
    outputSchema: ClassifyGoalOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
