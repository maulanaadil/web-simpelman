import { useFetcher } from '@remix-run/react';
import { UploadCloud } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { cn } from '~/lib/utils';

export type UploadValue = {
  name: string;
  url: string;
};

type MultipleUpload =
  | {
      isMultiple: true;
      value: UploadValue[];
      onChange: (value: UploadValue[]) => void;
    }
  | {
      isMultiple: false;
      value: UploadValue;
      onChange: (value: UploadValue) => void;
    };

type InputUploadProps<T> = {
  className?: string;
  label?: string | React.ReactNode;
  isRequired?: boolean;
  desc?: string;
  containerClassName?: string;
  error?: string;
  accept?: string;
} & MultipleUpload;

const defaultAccepts = 'application/pdf, image/jpeg, image/jpg, image/png';

export default function InputUpload<T>({
  onChange,
  value,
  className,
  label,
  isRequired,
  desc,
  containerClassName,
  error,
  isMultiple,
  accept = defaultAccepts,
}: InputUploadProps<T>) {
  const inputRef = useRef<HTMLInputElement>(null);

  const { submit, data, state, formData } = useFetcher<
    T & {
      files: { name: string; url: string }[];
    }
  >();
  const isUploading = state !== 'idle';

  const uploadingFiles = formData
    ?.getAll('file')
    ?.filter((value: unknown): value is File => value instanceof File)
    .map((file) => {
      const name = file.name;
      const url = URL.createObjectURL(file);
      return { name, url };
    });

  const files = (data?.files ?? []).concat(uploadingFiles ?? []);

  const isHasFiles = files.length > 0 || value;

  const handleSubmit = (files: FileList | null) => {
    if (!files) return;
    const formData = new FormData();
    for (const file of files) formData.append('file', file);
    submit(formData, { method: 'POST', encType: 'multipart/form-data' });
  };

  useEffect(() => {
    if (files.length > 0) {
      if (isMultiple) {
        const currentFiles = value as UploadValue[];
        const fileNames = files.map((file) => file.name);
        const currentFileNames = currentFiles?.map((file) => file.name) || [];
        if (JSON.stringify(fileNames) !== JSON.stringify(currentFileNames)) {
          onChange?.(files);
        }
      } else {
        const currentFile = value as UploadValue;
        if (files[0]?.name !== currentFile?.name) {
          onChange?.(files[0]);
        }
      }
    }
  }, [files, isMultiple, value, onChange, files[0]]);

  return (
    <div className={cn('flex flex-col gap-2 mb-2', containerClassName)}>
      <div className='flex flex-col'>
        <p className='text-base-700 font-medium text-sm'>
          {label} {isRequired && <span className='text-danger-500'>*</span>}
        </p>
        <p className='text-base-400 text-xs'>{desc}</p>
      </div>
      <div
        className={cn(
          'w-full p-4 flex items-center gap-3 rounded-lg border border-neutral-300',
          isUploading &&
            'bg-primary-50 items-center justify-center border-primary-50',
          className
        )}
      >
        {isUploading ? (
          <div className='w-4 h-4 border-t-2 border-b-2 rounded-full border-primary-500 animate-spin' />
        ) : (
          <div
            className='w-full cursor-pointer flex items-center gap-2'
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type='file'
              name='file'
              style={{ display: 'none' }}
              accept={accept}
              multiple={isMultiple}
              onChange={(event) => handleSubmit(event.target.files)}
            />
            {!isHasFiles && <UploadCloud color='#C4C4C4' size='24' />}
            {isMultiple ? (
              value && value.length > 0 ? (
                value.map((val, index) => (
                  <p key={index} className='text-sm text-base-900 font-light'>
                    {val.name}
                    {index < value.length - 1 ? ', ' : ''}
                  </p>
                ))
              ) : (
                <p className='text-sm text-base-400 font-light'>
                  No files selected
                </p>
              )
            ) : value ? (
              <p className='text-sm text-base-900 font-light'>{value.name}</p>
            ) : (
              <p className='text-sm text-base-400 font-light'>Upload file</p>
            )}
          </div>
        )}
      </div>
      <p className='text-danger-500 text-sm'>{error}</p>
    </div>
  );
}
