'use server';
/**
 * @fileOverview An AI agent for generating test questions.
 *
 * - generateTestQuestions - A function that handles the question generation process.
 */

import {ai} from '@/ai/genkit';
import { GenerateTestQuestionsInputSchema, GenerateTestQuestionsOutputSchema, type GenerateTestQuestionsInput, type GenerateTestQuestionsOutput } from '@/ai/schemas';


export async function generateTestQuestions(
  input: GenerateTestQuestionsInput
): Promise<GenerateTestQuestionsOutput> {
  return generateTestQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTestQuestionsPrompt',
  input: {schema: GenerateTestQuestionsInputSchema},
  output: {schema: GenerateTestQuestionsOutputSchema},
  prompt: `You are an AI assistant that creates multiple-choice quizzes.
  
  Generate {{{count}}} multiple-choice questions about the following topic: {{{topic}}}.

  Each question should have 4 options, and you must indicate the correct answer.
  Ensure the questions are clear and relevant to the topic.
  `,
});

const generateTestQuestionsFlow = ai.defineFlow(
  {
    name: 'generateTestQuestionsFlow',
    inputSchema: GenerateTestQuestionsInputSchema,
    outputSchema: GenerateTestQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
