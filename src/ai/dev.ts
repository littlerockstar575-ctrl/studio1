'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-daily-challenge.ts';
import '@/ai/flows/generate-test-questions.ts';
import '@/ai/flows/generate-python-fact.ts';
import '@/ai/flows/classify-goal.ts';
import '@/ai/flows/validate-code.ts';
import '@/ai/flows/generate-completion-thought.ts';
