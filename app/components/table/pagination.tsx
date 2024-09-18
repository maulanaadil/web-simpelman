import React, { useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

export default function Pagination({
  onChange,
  pageSize = '10',
  optionsNumber = ['5', '10', '25', '50', '100'],
}: {
  pageSize?: string;
  onChange?: (value?: string) => void;
  optionsNumber?: string[];
}) {
  const getMappedOptions = useMemo(
    () =>
      optionsNumber.map((opt) => ({
        label: `${opt} baris`,
        value: opt,
      })),
    [optionsNumber]
  );

  const handleOnValueChange = (value: string) => {
    onChange?.(value);
  };

  return (
    <div className='flex gap-3 items-center'>
      <p className='text-base-400 font-semibold'>Tampilkan:</p>
      <Select
        value={pageSize}
        onValueChange={(value) => handleOnValueChange?.(value)}
      >
        <SelectTrigger>
          <SelectValue placeholder='Pilih baris' />
        </SelectTrigger>
        <SelectContent>
          {getMappedOptions?.map((option) => (
            <SelectItem value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
