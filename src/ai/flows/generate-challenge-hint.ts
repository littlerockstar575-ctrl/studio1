
'use server';
/**
 * @fileOverview An AI agent for generating hints for daily challenges.
 *
 * - generateChallengeHint - A function that returns a hint for a given challenge.
 */

import {ai} from '@/ai/genkit';
import { GenerateChallengeHintInputSchema, GenerateChallengeHintOutputSchema, type GenerateChallengeHintInput, type GenerateChallengeHintOutput } from '@/ai/schemas';

export async function generateChallengeHint(
    input: GenerateChallengeHintInput
): Promise<GenerateChallengeHintOutput> {
    return generateChallengeHintFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateChallengeHintPrompt',
    input: {schema: GenerateChallengeHintInputSchema},
    output: {schema: GenerateChallengeHintOutputSchema},
    prompt: `You are a helpful and clever teaching assistant. The user is working on a challenge and needs a hint.

    Goal: {{{goal}}}
    Challenge: {{{challenge}}}
    Language (if applicable): {{{language}}}
    
    Your task is to provide one short, useful, and non-obvious hint to nudge the user in the right direction. 
    
    - DO NOT give the full solution or write any code.
    - Keep the hint to a single sentence.
    - **AVOID STATING THE OBVIOUS.** For a 'hello world' challenge, do not suggest printing to the console. That's the challenge itself.
    - For coding challenges, suggest a *specific and relevant* function, class, or method that is key to the solution. For example, for a Java challenge about reading user input, a great hint is "Consider using the 'Scanner' class." For a Python string reversal challenge, suggest "Have you looked into slice notation like '[::-1]'?".
    - If the challenge is about studying, suggest a specific related concept or a practical way to approach the material.
    
    Generate only the hint.
    `,
});

const generateChallengeHintFlow = ai.defineFlow(
    {
        name: 'generateChallengeHintFlow',
        inputSchema: GenerateChallengeHintInputSchema,
        outputSchema: GenerateChallengeHintOutputSchema,
    },
    async input => {
        const {output} = await prompt(input);
        return output!;
    }
);
