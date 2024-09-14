import React, { Ref, useCallback, useMemo, useState } from 'react';
import {
  Control,
  Controller,
  ControllerRenderProps,
  FieldValues,
  Path,
  PathValue,
} from 'react-hook-form';
import { twMerge as cx } from 'tailwind-merge';
import useResponsive from '~/hooks/useResponsive';

const getFormattedUrl = (oldUrl: string) => {
  const urlRegx = new RegExp(/:\/?\/?/);
  const subScheme = oldUrl.match(urlRegx);
  const splittedURL = oldUrl.split(urlRegx);
  let baseScheme = `https`;
  const isProtocolDefined = splittedURL.length > 1;
  if (isProtocolDefined) {
    [baseScheme] = splittedURL;
  }
  return `${baseScheme}${subScheme || '://'}${
    isProtocolDefined ? splittedURL[1] : splittedURL[0]
  }`;
};

export type HookFormTextInput<T extends FieldValues> = {
  isHookForm: true;
  control: Control<T, unknown>;
  controlName: Path<T>;
};

export type NormalTextInput = {
  isHookForm?: false;
  control?: never;
  controlName?: never;
};

export type MaxCharType =
  | {
      hasMaxCharLabel?: true;
      maxChar: number;
    }
  | {
      hasMaxCharLabel?: false;
      maxChar?: never;
    };

export type FixedInputType =
  | {
      isFixed: true;
      fixedLabel: string | React.ReactNode;
      fixedLabelClassname?: string;
    }
  | {
      isFixed?: false;
      fixedLabel?: never;
      fixedLabelClassname?: never;
    };

export type FixedSuffixInputType = {
  isFixedSuffix?: boolean;
  fixedSuffixLabel?: string | React.ReactNode;
};

export type PrefixInputType = {
  isPrefix?: boolean;
  renderPrefix?: React.ReactNode;
};

export type InputTextProps<T extends FieldValues> = (
  | HookFormTextInput<T>
  | NormalTextInput
) &
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > &
  MaxCharType &
  FixedInputType &
  PrefixInputType &
  FixedSuffixInputType & {
    error?: string;
    label?: string | React.ReactNode;
    description?: string | React.ReactNode;
    labelClassname?: string;
    descriptionClassname?: string;
    containerClassname?: string;
    isUrl?: boolean;
    inputClassName?: string;
    isCurrency?: boolean;
  };

const InputText = <T extends FieldValues>(
  {
    isHookForm = false,
    controlName,
    control,
    error,
    label,
    description,
    containerClassname,
    labelClassname,
    descriptionClassname,
    inputClassName,
    hasMaxCharLabel = false,
    maxChar,
    isUrl = false,
    isFixed,
    isFixedSuffix,
    fixedLabelClassname,
    fixedSuffixLabel,
    fixedLabel,
    isPrefix,
    renderPrefix,
    ...inputProps
  }: InputTextProps<T>,
  ref: Ref<HTMLInputElement>
) => {
  const {
    className,
    onChange,
    onBlur,
    disabled,
    placeholder,
    ...inputPropsExcluded
  } = inputProps;

  const [isFocus, setIsFocus] = useState(false);

  const getFixedInputWrapperClassName = cx(
    'transition-[outline] rounded-xl',
    (isFixed || isFixedSuffix || hasMaxCharLabel) &&
      'flex outline outline-[1px] outline-base-300 bg-base-50',
    isFocus && 'outline-primary-500',
    disabled && 'opacity-30 pointer-events-none',
    isPrefix && 'flex gap-3 items-center',
    className
  );

  const getInputClassName = cx(
    'py-4 px-3 outline outline-[1px] outline-neutral-300 rounded-lg w-full font-light text-sm focus:outline-primary-500 transition-[outline] flex-1',
    isFixed || isFixedSuffix || hasMaxCharLabel ? 'outline-0' : '',
    inputClassName
  );

  const isMobile = useResponsive('sm');

  const renderFixedLabel = useMemo(
    () => (
      <>
        {typeof fixedLabel === 'string' ? (
          <div
            className={cx(
              'px-4 py-4',
              isMobile ? 'flex-none w-[40%] truncate' : undefined,
              fixedLabelClassname
            )}
          >
            <span className='text-base-400 font-medium whitespace-nowrap'>
              {fixedLabel}
            </span>
          </div>
        ) : (
          <div
            className={cx(
              'pl-4 py-4 text-neutral-700 flex items-center',
              fixedLabelClassname
            )}
          >
            {fixedLabel}
          </div>
        )}
      </>
    ),
    [fixedLabel, fixedLabelClassname, isMobile]
  );

  const renderFixedSuffixLabel = useMemo(
    () => (
      <div className='px-4 py-4'>
        {typeof fixedSuffixLabel === 'string' ? (
          <span className='text-neutral-700 font-medium whitespace-nowrap'>
            {fixedSuffixLabel}
          </span>
        ) : (
          <span>{fixedSuffixLabel}</span>
        )}
      </div>
    ),
    [fixedSuffixLabel]
  );

  const renderUnControlledMaxCharSuffix = useCallback(
    () => (
      <div className='px-4 py-4'>
        <span className='text-neutral-700 font-medium whitespace-nowrap'>
          {(
            (
              inputPropsExcluded as React.DetailedHTMLProps<
                React.InputHTMLAttributes<HTMLInputElement>,
                HTMLInputElement
              >
            ).value as string
          )?.length || 0}
          /{maxChar}
        </span>
      </div>
    ),
    [inputPropsExcluded, maxChar]
  );

  const renderControlledMaxCharSuffix = useCallback(
    (value: PathValue<T, Path<T>>) => (
      <div className='px-4 py-4'>
        <span className='text-base-400 font-medium whitespace-nowrap'>
          {value?.length ?? 0}/{maxChar}
        </span>
      </div>
    ),
    [maxChar]
  );

  const handleFocus = () => setIsFocus(true);
  const handleBlur = () => setIsFocus(false);

  const memoizedUnControlledInput = useCallback(
    () => (
      <div
        className={cx(`relative`, getFixedInputWrapperClassName)}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {isPrefix && renderPrefix}
        {isFixed && renderFixedLabel}
        <input
          className={cx(getInputClassName)}
          maxLength={maxChar || undefined}
          {...inputPropsExcluded}
          onChange={onChange}
          placeholder={placeholder}
          onBlur={(prop) => {
            const {
              target: { value: targetValue, ...restTarget },
              ...restProp
            } = prop;
            if (isUrl) {
              const formattedUrl = getFormattedUrl(targetValue);
              onChange?.({
                ...restProp,
                target: {
                  ...restTarget,
                  value: formattedUrl,
                },
              });
            }
            onBlur?.(prop);
          }}
          ref={ref}
        />
        {isFixedSuffix && renderFixedSuffixLabel}
        {hasMaxCharLabel && renderUnControlledMaxCharSuffix()}
      </div>
    ),
    [
      getFixedInputWrapperClassName,
      getInputClassName,
      hasMaxCharLabel,
      inputPropsExcluded,
      isFixed,
      isFixedSuffix,
      isPrefix,
      isUrl,
      maxChar,
      onBlur,
      onChange,
      placeholder,
      ref,
      renderFixedLabel,
      renderFixedSuffixLabel,
      renderPrefix,
      renderUnControlledMaxCharSuffix,
    ]
  );

  const memoizedControlledInput = useCallback(
    ({
      onChange,
      onBlur,
      value,
      ...rest
    }: ControllerRenderProps<T, Path<T>>) => (
      <div
        className={(cx(`relative`), getFixedInputWrapperClassName)}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {isPrefix && renderPrefix}
        {isFixed && renderFixedLabel}
        <input
          className={cx(getInputClassName)}
          maxLength={maxChar || undefined}
          placeholder={placeholder}
          {...inputPropsExcluded}
          onChange={({ target: { value: targetValue } }) => {
            onChange(targetValue as PathValue<T, Path<T>>);
          }}
          onBlur={({ target: { value: targetValue } }) => {
            if (isUrl) {
              const formattedUrl = getFormattedUrl(targetValue);
              onChange(formattedUrl as PathValue<T, Path<T>>);
            }
            onBlur();
          }}
          value={value}
          {...rest}
          ref={ref}
        />
        {isFixedSuffix && renderFixedSuffixLabel}
        {hasMaxCharLabel && renderControlledMaxCharSuffix(value)}
      </div>
    ),
    [
      getFixedInputWrapperClassName,
      isPrefix,
      renderPrefix,
      isFixed,
      renderFixedLabel,
      getInputClassName,
      maxChar,
      placeholder,
      inputPropsExcluded,
      ref,
      isFixedSuffix,
      renderFixedSuffixLabel,
      hasMaxCharLabel,
      renderControlledMaxCharSuffix,
      isUrl,
    ]
  );

  const input = useMemo(() => {
    if (isHookForm) {
      return (
        <Controller
          name={controlName as Path<T>}
          control={control}
          render={({ field }) => memoizedControlledInput(field)}
        />
      );
    }
    return memoizedUnControlledInput();
  }, [
    control,
    controlName,
    isHookForm,
    memoizedControlledInput,
    memoizedUnControlledInput,
  ]);

  return (
    <div className={cx(`mb-3`, containerClassname)}>
      {label && (
        <div
          className={cx('text-base-700 font-medium text-sm', labelClassname)}
        >
          {label}
        </div>
      )}
      {description && (
        <div className={cx('text-base-400 text-xs mb-2', descriptionClassname)}>
          {description}
        </div>
      )}
      {input}
      {!!error && <div className='text-danger-500 text-sm mt-2'>{error}</div>}
    </div>
  );
};

export default React.forwardRef(InputText) as <T extends FieldValues>(
  p: InputTextProps<T> & { ref?: Ref<HTMLInputElement> }
) => React.ReactElement;
