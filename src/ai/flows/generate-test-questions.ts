'use server';
/**
 * @fileOverview An AI agent for generating test questions.
 *
 * - generateTestQuestions - A function that handles the question generation process.
 * - GenerateTestQuestionsInput - The input type for the generateTestQuestions function.
 * - GenerateTestQuestionsOutput - The return type for the generateTestQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GenerateTestQuestionsInputSchema = z.object({
  topic: z.string().describe('The topic to generate questions for.'),
  count: z.number().default(3).describe('The number of questions to generate.'),
});
export type GenerateTestQuestionsInput = z.infer<typeof GenerateTestQuestionsInputSchema>;

const QuestionSchema = z.object({
    question: z.string().describe('The question text.'),
    options: z.array(z.string()).describe('A list of 4 multiple-choice options.'),
    correctAnswer: z.string().describe('The correct answer from the options.'),
});

export const GenerateTestQuestionsOutputSchema = z.object({
  questions: z.array(QuestionSchema).describe('An array of generated questions.'),
});
export type GenerateTestQuestionsOutput = z.infer<typeof GenerateTestQuestionsOutputSchema>;


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
