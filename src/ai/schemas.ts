
import {z} from 'genkit';

export const GenerateDailyChallengeInputSchema = z.object({
  goal: z.string().describe('The user specified goal.'),
  difficulty: z.string().describe("The user-selected difficulty: 'Beginner', 'Intermediate', 'Advanced', 'Hacker', or 'Godly'"),
  completedChallenges: z.number().describe('The number of challenges the user has completed. Use this to adjust difficulty within the selected difficulty tier.'),
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

export const GeneratePythonFactOutputSchema = z.object({
    fact: z.string().describe('An interesting fact about the Python programming language.'),
});
export type GeneratePythonFactOutput = z.infer<typeof GeneratePythonFactOutputSchema>;


export const ClassifyGoalInputSchema = z.object({
    goal: z.string().describe("The user's goal."),
});
export type ClassifyGoalInput = z.infer<typeof ClassifyGoalInputSchema>;

export const ClassifyGoalOutputSchema = z.object({
    type: z.enum(['coding', 'study', 'other']).describe("The classification of the user's goal."),
    language: z.string().optional().describe("If the goal is 'coding', the programming language (e.g., 'python', 'javascript'). Use lowercase."),
});
export type ClassifyGoalOutput = z.infer<typeof ClassifyGoalOutputSchema>;

export const ValidateCodeInputSchema = z.object({
    challenge: z.string().describe("The programming challenge that was given to the user."),
    code: z.string().describe("The code written by the user to solve the challenge."),
    language: z.string().describe("The programming language the code is written in (e.g., 'python', 'javascript')."),
});
export type ValidateCodeInput = z.infer<typeof ValidateCodeInputSchema>;

export const ValidateCodeOutputSchema = z.object({
    isValid: z.boolean().describe("Whether the code is a valid and reasonable attempt to solve the challenge."),
    reason: z.string().describe("A brief, one-sentence explanation for why the code is considered valid or invalid. This will be shown to the user."),
});
export type ValidateCodeOutput = z.infer<typeof ValidateCodeOutputSchema>;


export const GenerateCompletionThoughtInputSchema = z.object({
    goal: z.string().describe("The user's main goal."),
    challenge: z.string().describe("The specific challenge the user just completed."),
});
export type GenerateCompletionThoughtInput = z.infer<typeof GenerateCompletionThoughtInputSchema>;

export const GenerateCompletionThoughtOutputSchema = z.object({
    thought: z.string().describe("A short, motivational thought related to the completed challenge and goal."),
});
export type GenerateCompletionThoughtOutput = z.infer<typeof GenerateCompletionThoughtOutputSchema>;

export const GenerateChallengeHintInputSchema = z.object({
    goal: z.string().describe("The user's main goal."),
    challenge: z.string().describe("The specific challenge the user is working on."),
    language: z.string().optional().describe("The programming language for the challenge, if applicable."),
});
export type GenerateChallengeHintInput = z.infer<typeof GenerateChallengeHintInputSchema>;

export const GenerateChallengeHintOutputSchema = z.object({
    hint: z.string().describe("A short, helpful hint for the user."),
});
export type GenerateChallengeHintOutput = z.infer<typeof GenerateChallengeHintOutputSchema>;
