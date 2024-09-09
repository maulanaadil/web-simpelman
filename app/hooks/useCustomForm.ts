import {
  FieldErrorsImpl,
  FieldValues,
  useForm,
  UseFormProps,
} from 'react-hook-form';
import useScrollToError from './useScrollToErrors';

const useCustomForm = <T extends FieldValues>(props: UseFormProps<T>) => {
  const data = useForm(props);
  useScrollToError(data.formState.errors as Partial<FieldErrorsImpl<T>>);
  return data;
};

export default useCustomForm;
