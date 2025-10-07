'use server';
/**
 * @fileOverview An AI agent for generating Python facts.
 *
 * - generatePythonFact - A function that returns a fun fact about Python.
 */

import {ai} from '@/ai/genkit';
import { GeneratePythonFactOutputSchema, type GeneratePythonFactOutput } from '@/ai/schemas';

export async function generatePythonFact(): Promise<GeneratePythonFactOutput> {
  return generatePythonFactFlow();
}

const prompt = ai.definePrompt({
  name: 'generatePythonFactPrompt',
  output: {schema: GeneratePythonFactOutputSchema},
  prompt: `Generate a single, interesting, and fun fact about the Python programming language.
  
  Ensure it's a different fact each time you are called.
  Keep the fact concise and easy to understand for a beginner.
  Example: "Python is named after the British comedy group Monty Python, not the snake!"
  `,
});

const generatePythonFactFlow = ai.defineFlow(
  {
    name: 'generatePythonFactFlow',
    outputSchema: GeneratePythonFactOutputSchema,
  },
  async () => {
    const {output} = await prompt();
    return output!;
  }
);
