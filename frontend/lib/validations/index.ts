// Re-export all validation schemas
export * from './transaction';

// Common validation utilities
import { z } from 'zod';

// Common field validations
export const IdSchema = z.string().cuid('Invalid ID format');
export const EmailSchema = z.string().email('Invalid email format');
export const PasswordSchema = z.string().min(8, 'Password must be at least 8 characters');
export const PhoneSchema = z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format');
export const UrlSchema = z.string().url('Invalid URL format');

// Date validation helpers
export const DateRangeSchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
}).refine(
  (data) => data.from <= data.to,
  {
    message: 'From date must be before to date',
    path: ['to'],
  }
);

// Currency validation (EUR format)
export const CurrencySchema = z.coerce.number().transform((val) => {
  return Math.round(val * 100) / 100; // Round to 2 decimal places
});

// File upload validation
export const FileUploadSchema = z.object({
  file: z.instanceof(File),
  maxSize: z.number().default(5 * 1024 * 1024), // 5MB default
  allowedTypes: z.array(z.string()).default(['text/csv', 'application/json']),
}).refine(
  (data) => data.file.size <= data.maxSize,
  {
    message: 'File size exceeds limit',
    path: ['file'],
  }
).refine(
  (data) => data.allowedTypes.includes(data.file.type),
  {
    message: 'File type not allowed',
    path: ['file'],
  }
);

// API response validation
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) => z.object({
  success: z.boolean(),
  data: dataSchema.optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

// Pagination response validation
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) => z.object({
  data: z.array(itemSchema),
  pagination: z.object({
    page: z.number().int().min(1),
    limit: z.number().int().min(1),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(0),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
});

// Environment variables validation
export const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  NEXTAUTH_SECRET: z.string().min(32),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  GOCARDLESS_SECRET_ID: z.string().optional(),
  GOCARDLESS_SECRET_KEY: z.string().optional(),
  WHATSAPP_TOKEN: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
});

// Validation helper functions
export const validateEnv = () => {
  try {
    return EnvSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid environment variables:', error);
    throw new Error('Invalid environment configuration');
  }
};

export const safeParseJson = <T>(json: string, schema: z.ZodSchema<T>) => {
  try {
    const parsed = JSON.parse(json);
    return schema.safeParse(parsed);
  } catch {
    return { success: false, error: { message: 'Invalid JSON' } } as const;
  }
};

export const validateRequest = <T>(data: unknown, schema: z.ZodSchema<T>) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`Validation failed: ${result.error.message}`);
  }
  return result.data;
};