/**
 * useForm Hook
 * Comprehensive form state management with validation
 */

import { useState, useCallback, useMemo } from 'react';
import {
  ValidationSchema,
  validateForm,
  validateField,
  FormValidationResult,
  ValidatorFn,
} from '../utils/validation';

// ============================================
// TYPES
// ============================================

export interface UseFormOptions<T extends Record<string, unknown>> {
  /** Initial form values */
  initialValues: T;
  /** Validation schema */
  validationSchema?: ValidationSchema;
  /** Validate on change (default: false) */
  validateOnChange?: boolean;
  /** Validate on blur (default: true) */
  validateOnBlur?: boolean;
  /** Submit handler */
  onSubmit?: (values: T) => void | Promise<void>;
}

export interface FieldState {
  value: unknown;
  error?: string;
  touched: boolean;
  dirty: boolean;
}

export interface FormState<T extends Record<string, unknown>> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  dirty: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
  submitCount: number;
}

export interface FieldProps {
  value: unknown;
  onChangeText: (text: string) => void;
  onBlur: () => void;
  error?: string;
}

export interface UseFormReturn<T extends Record<string, unknown>> {
  /** Current form state */
  formState: FormState<T>;
  /** Get props for a field */
  getFieldProps: (name: keyof T) => FieldProps;
  /** Get field state */
  getFieldState: (name: keyof T) => FieldState;
  /** Set field value */
  setFieldValue: (name: keyof T, value: unknown) => void;
  /** Set field error */
  setFieldError: (name: keyof T, error: string) => void;
  /** Set field touched */
  setFieldTouched: (name: keyof T, touched?: boolean) => void;
  /** Set multiple values */
  setValues: (values: Partial<T>) => void;
  /** Set multiple errors */
  setErrors: (errors: Record<string, string>) => void;
  /** Validate single field */
  validateSingleField: (name: keyof T) => string | undefined;
  /** Validate entire form */
  validate: () => FormValidationResult;
  /** Handle form submission */
  handleSubmit: () => Promise<void>;
  /** Reset form to initial values */
  reset: (newValues?: T) => void;
  /** Reset specific field */
  resetField: (name: keyof T) => void;
  /** Clear all errors */
  clearErrors: () => void;
}

// ============================================
// HOOK IMPLEMENTATION
// ============================================

export function useForm<T extends Record<string, unknown>>({
  initialValues,
  validationSchema,
  validateOnChange = false,
  validateOnBlur = true,
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
  // Form state
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrorsState] = useState<Record<string, string>>({});
  const [touched, setTouchedState] = useState<Record<string, boolean>>({});
  const [dirty, setDirtyState] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);

  // Computed state
  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);
  const isDirty = useMemo(() => Object.values(dirty).some(Boolean), [dirty]);

  // Validate single field
  const validateSingleField = useCallback(
    (name: keyof T): string | undefined => {
      if (!validationSchema || !validationSchema[name as string]) {
        return undefined;
      }

      const validators = validationSchema[name as string];
      const validatorArray = Array.isArray(validators) ? validators : [validators];
      const result = validateField(values[name], validatorArray as ValidatorFn[], String(name));
      return result.error;
    },
    [validationSchema, values]
  );

  // Validate entire form
  const validate = useCallback((): FormValidationResult => {
    if (!validationSchema) {
      return { isValid: true, errors: {} };
    }

    const result = validateForm(values as Record<string, unknown>, validationSchema);
    setErrorsState(result.errors);
    return result;
  }, [validationSchema, values]);

  // Set single field value
  const setFieldValue = useCallback(
    (name: keyof T, value: unknown) => {
      setValuesState((prev) => ({ ...prev, [name]: value }));
      setDirtyState((prev) => ({ ...prev, [name]: value !== initialValues[name] }));

      if (validateOnChange && validationSchema) {
        const error = validateSingleField(name);
        setErrorsState((prev) => {
          if (error) {
            return { ...prev, [name]: error };
          }
          const newErrors = { ...prev };
          delete newErrors[name as string];
          return newErrors;
        });
      }
    },
    [initialValues, validateOnChange, validationSchema, validateSingleField]
  );

  // Set field error
  const setFieldError = useCallback((name: keyof T, error: string) => {
    setErrorsState((prev) => ({ ...prev, [name]: error }));
  }, []);

  // Set field touched
  const setFieldTouched = useCallback(
    (name: keyof T, isTouched = true) => {
      setTouchedState((prev) => ({ ...prev, [name]: isTouched }));

      if (validateOnBlur && isTouched && validationSchema) {
        const error = validateSingleField(name);
        setErrorsState((prev) => {
          if (error) {
            return { ...prev, [name]: error };
          }
          const newErrors = { ...prev };
          delete newErrors[name as string];
          return newErrors;
        });
      }
    },
    [validateOnBlur, validationSchema, validateSingleField]
  );

  // Set multiple values
  const setValues = useCallback(
    (newValues: Partial<T>) => {
      setValuesState((prev) => ({ ...prev, ...newValues }));
      setDirtyState((prev) => {
        const newDirty = { ...prev };
        for (const key of Object.keys(newValues)) {
          newDirty[key] = newValues[key as keyof T] !== initialValues[key as keyof T];
        }
        return newDirty;
      });
    },
    [initialValues]
  );

  // Set multiple errors
  const setErrors = useCallback((newErrors: Record<string, string>) => {
    setErrorsState(newErrors);
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrorsState({});
  }, []);

  // Reset form
  const reset = useCallback(
    (newValues?: T) => {
      const resetValues = newValues || initialValues;
      setValuesState(resetValues);
      setErrorsState({});
      setTouchedState({});
      setDirtyState({});
      setSubmitCount(0);
    },
    [initialValues]
  );

  // Reset specific field
  const resetField = useCallback(
    (name: keyof T) => {
      setValuesState((prev) => ({ ...prev, [name]: initialValues[name] }));
      setErrorsState((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as string];
        return newErrors;
      });
      setTouchedState((prev) => ({ ...prev, [name]: false }));
      setDirtyState((prev) => ({ ...prev, [name]: false }));
    },
    [initialValues]
  );

  // Handle submit
  const handleSubmit = useCallback(async () => {
    setSubmitCount((prev) => prev + 1);

    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouchedState(allTouched);

    // Validate
    const result = validate();
    if (!result.isValid) {
      return;
    }

    // Submit
    if (onSubmit) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [values, validate, onSubmit]);

  // Get field props for easy binding
  const getFieldProps = useCallback(
    (name: keyof T): FieldProps => ({
      value: values[name],
      onChangeText: (text: string) => setFieldValue(name, text),
      onBlur: () => setFieldTouched(name, true),
      error: touched[name as string] ? errors[name as string] : undefined,
    }),
    [values, errors, touched, setFieldValue, setFieldTouched]
  );

  // Get field state
  const getFieldState = useCallback(
    (name: keyof T): FieldState => ({
      value: values[name],
      error: errors[name as string],
      touched: touched[name as string] || false,
      dirty: dirty[name as string] || false,
    }),
    [values, errors, touched, dirty]
  );

  // Form state object
  const formState: FormState<T> = useMemo(
    () => ({
      values,
      errors,
      touched,
      dirty,
      isValid,
      isSubmitting,
      isDirty,
      submitCount,
    }),
    [values, errors, touched, dirty, isValid, isSubmitting, isDirty, submitCount]
  );

  return {
    formState,
    getFieldProps,
    getFieldState,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    setValues,
    setErrors,
    validateSingleField,
    validate,
    handleSubmit,
    reset,
    resetField,
    clearErrors,
  };
}

export default useForm;
