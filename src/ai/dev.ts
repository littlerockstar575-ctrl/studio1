'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-daily-challenge.ts';
import '@/ai/flows/generate-test-questions.ts';
import '@/ai/flows/generate-python-fact.ts';
