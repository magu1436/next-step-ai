// src/lib/schemas/advice.ts
import { z } from "zod";
import type { Action, ClassificationResult } from "@/src/types/agent";

export const concernCategorySchema = z.enum([
  "self_analysis",
  "application_documents",
  "interview",
  "company_research",
  "internship_selection",
  "schedule_priority",
  "career_choice",
  "other",
]);

export const classificationResultSchema = z.object({
  category: concernCategorySchema,
  subCategory: z.string().nullable(),
  confidence: z.number().min(0).max(1),
  reason: z.string(),
}) satisfies z.ZodType<ClassificationResult>;

export const actionSchema = z.object({
  title: z.string(),
  reason: z.string(),
  priority: z.enum(["high", "medium", "low"]),
  estimatedMinutes: z.number().nullable(),
}) satisfies z.ZodType<Action>;