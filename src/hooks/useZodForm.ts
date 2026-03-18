import { useForm, UseFormReturn, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodType } from 'zod';

export interface UseZodFormOptions<T extends FieldValues> {
  schema: ZodType<T>;
  defaultValues?: Partial<T>;
}

export function useZodForm<T extends FieldValues>(
  options: UseZodFormOptions<T>
): UseFormReturn<T> {
  // @ts-expect-error - Type compatibility between zod and react-hook-form versions
  return useForm<T>({
    // @ts-expect-error - Resolver typing is narrower than react-hook-form expects here
    resolver: zodResolver(options.schema),
    // @ts-expect-error - Partial default values are valid for this hook wrapper
    defaultValues: options.defaultValues,
    mode: 'onBlur',
  });
}
