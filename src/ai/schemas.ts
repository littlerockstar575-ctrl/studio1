import {z} from 'genkit';

export const GenerateDailyChallengeInputSchema = z.object({
  goal: z.string().describe('The user specified goal.'),
  completedChallenges: z.number().describe('The number of challenges the user has completed. Use this to adjust difficulty.'),
});
export type GenerateDailyChallengeInput = z.infer<
  typeof GenerateDailyChallengeInputSchema
>;

export const GenerateDailyChallengeOutputSchema = z.object({
  challenge: z.string().describe('The generated daily challenge. If the goal is about coding, this should be a simple problem statement, not just "write hello world".'),
});
export type GenerateDailyChallengeOutput = z.infer<
  typeof GenerateDailyChallengeOutputSchema
>;

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
