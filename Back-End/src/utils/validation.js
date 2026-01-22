import { z } from 'zod';

export const AgentInputSchema = z.object({
  task: z.string().min(1, 'Task is required'),
  context: z.string().optional(),
  parameters: z.object({}).optional()
});

export const GraphStateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['idle', 'processing', 'completed', 'error']),
  data: z.any().optional(),
  error: z.string().optional()
});

export const validateInput = (schema, data) => {
  try {
    return { success: true, data: schema.parse(data) };
  } catch (error) {
    return { 
      success: false, 
      errors: error.errors 
    };
  }
};