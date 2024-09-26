import { ZodError, ZodSchema } from 'zod';

export type ActionErrors<T> = Partial<Record<keyof T, string>>;

export async function validateAction<ActionInput>({
  request,
  schema,
}: {
  request: Request;
  schema: ZodSchema;
}) {
  const body = Object.fromEntries(await request.formData());

  try {
    const formData = schema.parse(body) as ActionInput;

    return { formData, errors: null };
  } catch (e) {
    const errors = e as ZodError<ActionInput>;

    return {
      formData: body,
      errors: errors.issues.reduce((acc: ActionErrors<ActionInput>, curr) => {
        const key = curr.path[0] as keyof ActionInput;

        if (key) {
          acc[key] = curr.message;
        }

        return acc;
      }, {}),
    };
  }
}

export const validatePassword = (password: string) => {
  const hasUppercase = /[A-Z]/.test(password); // Check for at least one uppercase letter
  const hasLowercase = /[a-z]/.test(password); // Check for at least one lowercase letter
  const hasNumber = /[0-9]/.test(password); // Check for at least one number
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password); // Check for at least one special character
  const isLongEnough = password.length >= 8; // Check if password length is at least 8 characters
  const uniqueChars = new Set(password); // Set will automatically filter out duplicates
  const hasEnoughUniqueChars = uniqueChars.size >= 5; // Ensure there are at least 5 unique characters

  return (
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSpecialChar &&
    isLongEnough &&
    hasEnoughUniqueChars
  );
};

export const validatePhoneNumber = (phoneNumber: string) => {
  return !phoneNumber.startsWith('62');
};
