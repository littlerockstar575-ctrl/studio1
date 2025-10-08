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
    prompt: `You are a helpful teaching assistant. The user is working on a challenge related to their goal and needs a hint.
    
    Goal: {{{goal}}}
    Challenge: {{{challenge}}}
    Language (if applicable): {{{language}}}
    
    Your task is to provide one short, useful hint to nudge the user in the right direction. 
    
    - DO NOT give the full solution or write any code.
    - Keep the hint to a single sentence.
    - If the challenge is about coding, suggest a specific function, concept, or logic to consider. For example, "Think about using a for loop" or "Look into the 'split()' method for strings."
    - If the challenge is about studying, suggest a topic to focus on or a way to approach the material.
    
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
