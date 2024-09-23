import React, { useEffect, useState } from 'react';
import InputText, { InputTextProps } from './input-text';
import { FieldValues } from 'react-hook-form';

type InputDebounceProps<T extends FieldValues> = {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  debounce?: number;
} & InputTextProps<T>;

export default function InputDebounce<T extends FieldValues>({
  value: initialValue,
  onChange,
  debounce = 500,
  className = '',
  ref: omittedRef,
  ...props
}: InputDebounceProps<T>) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [debounce, onChange, value]);

  return (
    <InputText
      onChange={(e) => setValue(e.target.value)}
      value={value}
      placeholder='Search...'
      className={className}
      {...props}
    />
  );
}
