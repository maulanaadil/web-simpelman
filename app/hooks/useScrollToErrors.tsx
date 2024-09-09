import { useEffect } from 'react';
import { FieldErrorsImpl, FieldValues } from 'react-hook-form';

export default function useScrollToError<T extends FieldValues>(
  errors: Partial<FieldErrorsImpl<T>>
) {
  useEffect(() => {
    const elements = Object.keys(errors)
      .map(
        (name) =>
          document.getElementsByName(name)[0] || document.getElementById(name)
      )
      .filter((el) => !!el);

    elements.sort((a, b) => b.scrollHeight - a.scrollHeight);
    elements[0]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [errors]);
}
