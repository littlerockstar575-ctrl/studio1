'use server';
/**
 * @fileOverview An AI agent for generating a motivational thought upon challenge completion.
 *
 * - generateCompletionThought - A function that returns a motivational message.
 */

import {ai} from '@/ai/genkit';
import { GenerateCompletionThoughtInputSchema, GenerateCompletionThoughtOutputSchema, type GenerateCompletionThoughtInput, type GenerateCompletionThoughtOutput } from '@/ai/schemas';

export async function generateCompletionThought(
  input: GenerateCompletionThoughtInput
): Promise<GenerateCompletionThoughtOutput> {
  return generateCompletionThoughtFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCompletionThoughtPrompt',
  input: {schema: GenerateCompletionThoughtInputSchema},
  output: {schema: GenerateCompletionThoughtOutputSchema},
  prompt: `You are a motivational coach. The user just completed a daily challenge related to their main goal.
  
  User's Goal: {{{goal}}}
  Completed Challenge: {{{challenge}}}

  Generate a short, one-sentence motivational thought (less than 15 words) that acknowledges their effort on this specific challenge and encourages them to keep going. Frame it as a "Thought of the Day".
  
  Example for goal 'Learn Python' and challenge 'Print "Hello World"':
  "Every expert coder started with a single line of code. Well done."

  Example for goal 'Read more' and challenge 'Read for 15 minutes':
  "A few pages today can build a library of knowledge over time. Keep reading."

  Keep it encouraging and directly related to what they just did.
  `,
});

const generateCompletionThoughtFlow = ai.defineFlow(
  {
    name: 'generateCompletionThoughtFlow',
    inputSchema: GenerateCompletionThoughtInputSchema,
    outputSchema: GenerateCompletionThoughtOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
