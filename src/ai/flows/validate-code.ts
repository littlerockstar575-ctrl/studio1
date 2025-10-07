'use server';
/**
 * @fileOverview An AI agent for validating user-submitted code.
 *
 * - validateCode - A function that validates a user's code against a given challenge.
 */

import {ai} from '@/ai/genkit';
import { ValidateCodeInputSchema, ValidateCodeOutputSchema, type ValidateCodeInput, type ValidateCodeOutput } from '@/ai/schemas';

export async function validateCode(input: ValidateCodeInput): Promise<ValidateCodeOutput> {
  return validateCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'validateCodePrompt',
  input: {schema: ValidateCodeInputSchema},
  output: {schema: ValidateCodeOutputSchema},
  prompt: `You are an AI code reviewer. Your task is to determine if a user's code is a reasonable attempt to solve a given programming challenge. You are not a compiler; the code doesn't have to be perfect or even run. You are checking for genuine effort and logical correctness.

  - The code must be relevant to the challenge.
  - It should not be placeholder code (e.g., just comments or "hello world" for a complex task).
  - It should demonstrate a basic understanding of the concepts required by the challenge.

  Analyze the user's code for the following challenge and determine if it is a valid attempt. Provide a brief reason for your decision.

  Language: {{{language}}}
  Challenge: {{{challenge}}}
  User's Code:
  \`\`\`
  {{{code}}}
  \`\`\`
  `,
});

const validateCodeFlow = ai.defineFlow(
  {
    name: 'validateCodeFlow',
    inputSchema: ValidateCodeInputSchema,
    outputSchema: ValidateCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
