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
  const hasUppercase = /[A-Z]/.test(password);

  const uniqueChars = new Set(password);
  const hasUniqueChars = uniqueChars.size === password.length;

  return hasUppercase && hasUniqueChars;
};

export const validatePhoneNumber = (phoneNumber: string) => {
  return !phoneNumber.startsWith('62');
};
