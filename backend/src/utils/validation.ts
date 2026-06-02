import { z } from 'zod';

// Password rule (unchanged from the original hand-rolled regex):
// 8-20 chars, with at least one lowercase, one uppercase, one digit, one special char.
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
const PASSWORD_MESSAGE =
  'Password must be 8-20 characters and contain at least one uppercase, one lowercase, one number, and one special character';

export const signupSchema = z.object({
  username: z
    .string({ required_error: 'Username and password are required' })
    .min(3, 'Username must be 3-10 characters')
    .max(10, 'Username must be 3-10 characters'),
  password: z
    .string({ required_error: 'Username and password are required' })
    .regex(PASSWORD_REGEX, PASSWORD_MESSAGE),
});

export const signinSchema = z.object({
  username: z
    .string({ required_error: 'Username and password are required' })
    .min(1, 'Username and password are required'),
  password: z
    .string({ required_error: 'Username and password are required' })
    .min(1, 'Username and password are required'),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type SigninInput = z.infer<typeof signinSchema>;

/**
 * Returns the first human-readable validation message from a Zod result,
 * or null if the data is valid. Keeps route handlers tidy and preserves the
 * single-`message` response shape the frontend already expects.
 */
export function firstError(result: z.SafeParseReturnType<unknown, unknown>): string | null {
  if (result.success) return null;
  return result.error.issues[0]?.message ?? 'Invalid request';
}
