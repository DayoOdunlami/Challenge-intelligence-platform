/**
 * Validation schemas for BaseEntity using Zod
 * 
 * These schemas ensure adapter functions produce valid BaseEntity objects
 * and catch mapping errors early in development.
 */

import { z } from 'zod';
import type { EntityType, TRLValue, Domain } from './base-entity';

// TRL value schema
const TRLValueSchema: z.ZodType<TRLValue> = z.union([
  z.number().min(1).max(9),
  z.object({
    current: z.number().min(1).max(9),
    target: z.number().min(1).max(9).optional(),
    min: z.number().min(1).max(9).optional(),
    max: z.number().min(1).max(9).optional(),
  }),
]);

// BaseEntity metadata schema
const BaseEntityMetadataSchema = z.object({
  sector: z.union([z.string(), z.array(z.string())]).optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  trl: TRLValueSchema.optional(),
  status: z.string().optional(),
  funding: z.object({
    amount: z.number().optional(),
    currency: z.string().optional(),
    source: z.string().optional(),
    type: z.string().optional(),
  }).optional(),
  dates: z.object({
    start: z.union([z.date(), z.string()]).optional(),
    end: z.union([z.date(), z.string()]).optional(),
    milestones: z.array(z.object({
      date: z.union([z.date(), z.string()]),
      label: z.string(),
    })).optional(),
  }).optional(),
  location: z.object({
    country: z.string().optional(),
    region: z.string().optional(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }).optional(),
  }).optional(),
  custom: z.record(z.unknown()).optional(),
});

// BaseEntity schema
export const BaseEntitySchema = z.object({
  _version: z.literal('1.0'),
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  entityType: z.enum([
    'challenge',
    'stakeholder',
    'technology',
    'project',
    'funding_event',
    'innovation',
    'rail_challenge',
    'rail_stakeholder',
  ]),
  domain: z.enum([
    'atlas',
    'navigate',
    'cpc-internal',
    'reference',
    'cross-domain',
  ]) as z.ZodType<Domain>,
  metadata: BaseEntityMetadataSchema,
  relationships: z.array(z.object({
    targetId: z.string(),
    type: z.string(),
    strength: z.number().min(0).max(1).optional(),
    metadata: z.record(z.unknown()).optional(),
  })).optional(),
  visualizationHints: z.object({
    color: z.string().optional(),
    size: z.number().optional(),
    icon: z.string().optional(),
    priority: z.number().optional(),
  }).optional(),
  _original: z.unknown().optional(),
});

// UniversalRelationship schema
export const UniversalRelationshipSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  sourceType: z.enum([
    'challenge',
    'stakeholder',
    'technology',
    'project',
    'funding_event',
    'innovation',
    'rail_challenge',
    'rail_stakeholder',
  ]),
  targetType: z.enum([
    'challenge',
    'stakeholder',
    'technology',
    'project',
    'funding_event',
    'innovation',
    'rail_challenge',
    'rail_stakeholder',
  ]),
  type: z.string().min(1),
  strength: z.number().min(0).max(1),
  derivation: z.enum(['explicit', 'computed', 'inferred']),
  metadata: z.record(z.unknown()).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

/**
 * Validate a BaseEntity and return typed result
 */
export function validateBaseEntity(entity: unknown): {
  success: true;
  data: z.infer<typeof BaseEntitySchema>;
} | {
  success: false;
  error: z.ZodError;
} {
  const result = BaseEntitySchema.safeParse(entity);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Validate a UniversalRelationship and return typed result
 */
export function validateUniversalRelationship(relationship: unknown): {
  success: true;
  data: z.infer<typeof UniversalRelationshipSchema>;
} | {
  success: false;
  error: z.ZodError;
} {
  const result = UniversalRelationshipSchema.safeParse(relationship);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

