import { Eye, EyeSlash, Lock1 } from 'iconsax-react';
import React, { Ref, useState } from 'react';
import { FieldValues } from 'react-hook-form';
import InputText, { InputTextProps } from './input-text';

const InputPassword = <T extends FieldValues>(
  { ref: omittedRef, ...props }: InputTextProps<T>,
  ref: Ref<HTMLInputElement>
) => {
  const [show, setShow] = useState(false);

  return (
    <InputText
      {...props}
      ref={ref}
      type={show ? 'text' : 'password'}
      isFixed
      fixedLabel={<Lock1 />}
      isFixedSuffix
      fixedSuffixLabel={
        show ? (
          <EyeSlash
            className='cursor-pointer'
            onClick={() => setShow((prev) => !prev)}
          />
        ) : (
          <Eye
            className='cursor-pointer'
            onClick={() => setShow((prev) => !prev)}
          />
        )
      }
    />
  );
};

export default React.forwardRef(InputPassword) as <T extends FieldValues>(
  p: InputTextProps<T> & { ref?: Ref<HTMLInputElement> }
) => React.ReactElement;
