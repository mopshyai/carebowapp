/**
 * Form Validation Utilities
 * Comprehensive validation system with error messages
 */

// ============================================
// TYPES
// ============================================

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FieldValidation {
  field: string;
  value: unknown;
  result: ValidationResult;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  firstError?: string;
}

export type ValidatorFn = (value: unknown, fieldName?: string) => ValidationResult;

// ============================================
// VALIDATION MESSAGES
// ============================================

export const ValidationMessages = {
  required: (field: string) => `${field} is required`,
  minLength: (field: string, min: number) => `${field} must be at least ${min} characters`,
  maxLength: (field: string, max: number) => `${field} must be no more than ${max} characters`,
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number',
  password: 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number',
  passwordMatch: 'Passwords do not match',
  numeric: (field: string) => `${field} must be a number`,
  integer: (field: string) => `${field} must be a whole number`,
  positive: (field: string) => `${field} must be greater than 0`,
  date: 'Please enter a valid date',
  futureDate: 'Date must be in the future',
  pastDate: 'Date must be in the past',
  age: (min: number, max: number) => `Age must be between ${min} and ${max}`,
  url: 'Please enter a valid URL',
  pincode: 'Please enter a valid 6-digit pincode',
  aadhaar: 'Please enter a valid 12-digit Aadhaar number',
  pan: 'Please enter a valid PAN number',
  otp: 'Please enter a valid 6-digit OTP',
};

// ============================================
// BASIC VALIDATORS
// ============================================

/**
 * Check if value is not empty
 */
export function required(value: unknown, fieldName = 'This field'): ValidationResult {
  const isEmpty =
    value === null ||
    value === undefined ||
    value === '' ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'string' && value.trim() === '');

  return {
    isValid: !isEmpty,
    error: isEmpty ? ValidationMessages.required(fieldName) : undefined,
  };
}

/**
 * Check minimum length
 */
export function minLength(min: number): ValidatorFn {
  return (value: unknown, fieldName = 'This field'): ValidationResult => {
    const str = String(value || '');
    const isValid = str.length >= min;
    return {
      isValid,
      error: isValid ? undefined : ValidationMessages.minLength(fieldName, min),
    };
  };
}

/**
 * Check maximum length
 */
export function maxLength(max: number): ValidatorFn {
  return (value: unknown, fieldName = 'This field'): ValidationResult => {
    const str = String(value || '');
    const isValid = str.length <= max;
    return {
      isValid,
      error: isValid ? undefined : ValidationMessages.maxLength(fieldName, max),
    };
  };
}

/**
 * Validate email format
 */
export function email(value: unknown): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const str = String(value || '');
  const isValid = emailRegex.test(str);
  return {
    isValid,
    error: isValid ? undefined : ValidationMessages.email,
  };
}

/**
 * Validate phone number (Indian format)
 */
export function phone(value: unknown): ValidationResult {
  const phoneRegex = /^[6-9]\d{9}$/;
  const str = String(value || '').replace(/\D/g, '');
  const isValid = phoneRegex.test(str);
  return {
    isValid,
    error: isValid ? undefined : ValidationMessages.phone,
  };
}

/**
 * Validate strong password
 */
export function password(value: unknown): ValidationResult {
  const str = String(value || '');
  const hasMinLength = str.length >= 8;
  const hasUppercase = /[A-Z]/.test(str);
  const hasLowercase = /[a-z]/.test(str);
  const hasNumber = /\d/.test(str);
  const isValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;
  return {
    isValid,
    error: isValid ? undefined : ValidationMessages.password,
  };
}

/**
 * Validate passwords match
 */
export function passwordMatch(password: string): ValidatorFn {
  return (value: unknown): ValidationResult => {
    const isValid = String(value || '') === password;
    return {
      isValid,
      error: isValid ? undefined : ValidationMessages.passwordMatch,
    };
  };
}

/**
 * Validate numeric value
 */
export function numeric(value: unknown, fieldName = 'This field'): ValidationResult {
  const num = Number(value);
  const isValid = !isNaN(num);
  return {
    isValid,
    error: isValid ? undefined : ValidationMessages.numeric(fieldName),
  };
}

/**
 * Validate integer
 */
export function integer(value: unknown, fieldName = 'This field'): ValidationResult {
  const num = Number(value);
  const isValid = Number.isInteger(num);
  return {
    isValid,
    error: isValid ? undefined : ValidationMessages.integer(fieldName),
  };
}

/**
 * Validate positive number
 */
export function positive(value: unknown, fieldName = 'This field'): ValidationResult {
  const num = Number(value);
  const isValid = !isNaN(num) && num > 0;
  return {
    isValid,
    error: isValid ? undefined : ValidationMessages.positive(fieldName),
  };
}

/**
 * Validate number in range
 */
export function range(min: number, max: number): ValidatorFn {
  return (value: unknown, fieldName = 'Value'): ValidationResult => {
    const num = Number(value);
    const isValid = !isNaN(num) && num >= min && num <= max;
    return {
      isValid,
      error: isValid ? undefined : `${fieldName} must be between ${min} and ${max}`,
    };
  };
}

// ============================================
// DATE VALIDATORS
// ============================================

/**
 * Validate date format
 */
export function date(value: unknown): ValidationResult {
  const d = value instanceof Date ? value : new Date(String(value));
  const isValid = !isNaN(d.getTime());
  return {
    isValid,
    error: isValid ? undefined : ValidationMessages.date,
  };
}

/**
 * Validate future date
 */
export function futureDate(value: unknown): ValidationResult {
  const d = value instanceof Date ? value : new Date(String(value));
  const isValid = !isNaN(d.getTime()) && d > new Date();
  return {
    isValid,
    error: isValid ? undefined : ValidationMessages.futureDate,
  };
}

/**
 * Validate past date
 */
export function pastDate(value: unknown): ValidationResult {
  const d = value instanceof Date ? value : new Date(String(value));
  const isValid = !isNaN(d.getTime()) && d < new Date();
  return {
    isValid,
    error: isValid ? undefined : ValidationMessages.pastDate,
  };
}

/**
 * Validate age range
 */
export function age(minAge: number, maxAge: number): ValidatorFn {
  return (value: unknown): ValidationResult => {
    const birthDate = value instanceof Date ? value : new Date(String(value));
    if (isNaN(birthDate.getTime())) {
      return { isValid: false, error: ValidationMessages.date };
    }

    const today = new Date();
    let ageYears = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      ageYears--;
    }

    const isValid = ageYears >= minAge && ageYears <= maxAge;
    return {
      isValid,
      error: isValid ? undefined : ValidationMessages.age(minAge, maxAge),
    };
  };
}

// ============================================
// INDIA-SPECIFIC VALIDATORS
// ============================================

/**
 * Validate Indian pincode
 */
export function pincode(value: unknown): ValidationResult {
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  const str = String(value || '').replace(/\D/g, '');
  const isValid = pincodeRegex.test(str);
  return {
    isValid,
    error: isValid ? undefined : ValidationMessages.pincode,
  };
}

/**
 * Validate Aadhaar number
 */
export function aadhaar(value: unknown): ValidationResult {
  const aadhaarRegex = /^[2-9]{1}[0-9]{11}$/;
  const str = String(value || '').replace(/\D/g, '');
  const isValid = aadhaarRegex.test(str);
  return {
    isValid,
    error: isValid ? undefined : ValidationMessages.aadhaar,
  };
}

/**
 * Validate PAN number
 */
export function pan(value: unknown): ValidationResult {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  const str = String(value || '').toUpperCase();
  const isValid = panRegex.test(str);
  return {
    isValid,
    error: isValid ? undefined : ValidationMessages.pan,
  };
}

/**
 * Validate OTP
 */
export function otp(value: unknown): ValidationResult {
  const otpRegex = /^\d{6}$/;
  const str = String(value || '').replace(/\D/g, '');
  const isValid = otpRegex.test(str);
  return {
    isValid,
    error: isValid ? undefined : ValidationMessages.otp,
  };
}

// ============================================
// URL VALIDATOR
// ============================================

/**
 * Validate URL format
 */
export function url(value: unknown): ValidationResult {
  try {
    const str = String(value || '');
    if (!str) return { isValid: false, error: ValidationMessages.url };
    new URL(str);
    return { isValid: true };
  } catch {
    return { isValid: false, error: ValidationMessages.url };
  }
}

// ============================================
// PATTERN VALIDATOR
// ============================================

/**
 * Validate against regex pattern
 */
export function pattern(regex: RegExp, errorMessage: string): ValidatorFn {
  return (value: unknown): ValidationResult => {
    const str = String(value || '');
    const isValid = regex.test(str);
    return {
      isValid,
      error: isValid ? undefined : errorMessage,
    };
  };
}

// ============================================
// COMPOSITE VALIDATORS
// ============================================

/**
 * Combine multiple validators (all must pass)
 */
export function compose(...validators: ValidatorFn[]): ValidatorFn {
  return (value: unknown, fieldName?: string): ValidationResult => {
    for (const validator of validators) {
      const result = validator(value, fieldName);
      if (!result.isValid) {
        return result;
      }
    }
    return { isValid: true };
  };
}

/**
 * Run validator only if value exists
 */
export function optional(validator: ValidatorFn): ValidatorFn {
  return (value: unknown, fieldName?: string): ValidationResult => {
    if (value === null || value === undefined || value === '') {
      return { isValid: true };
    }
    return validator(value, fieldName);
  };
}

// ============================================
// FORM VALIDATION
// ============================================

export interface ValidationSchema {
  [field: string]: ValidatorFn | ValidatorFn[];
}

/**
 * Validate entire form against schema
 */
export function validateForm(
  values: Record<string, unknown>,
  schema: ValidationSchema
): FormValidationResult {
  const errors: Record<string, string> = {};
  let firstError: string | undefined;

  for (const [field, validators] of Object.entries(schema)) {
    const value = values[field];
    const validatorArray = Array.isArray(validators) ? validators : [validators];

    for (const validator of validatorArray) {
      const result = validator(value, formatFieldName(field));
      if (!result.isValid && result.error) {
        errors[field] = result.error;
        if (!firstError) {
          firstError = result.error;
        }
        break; // Stop at first error for this field
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    firstError,
  };
}

/**
 * Format field name for display (camelCase to Title Case)
 */
function formatFieldName(field: string): string {
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

// ============================================
// REACT HOOK HELPERS
// ============================================

/**
 * Create a field validator for use in forms
 */
export function createFieldValidator(validators: ValidatorFn | ValidatorFn[]) {
  const validatorArray = Array.isArray(validators) ? validators : [validators];

  return (value: unknown, fieldName?: string): string | undefined => {
    for (const validator of validatorArray) {
      const result = validator(value, fieldName);
      if (!result.isValid) {
        return result.error;
      }
    }
    return undefined;
  };
}

/**
 * Validate a single field on change
 */
export function validateField(
  value: unknown,
  validators: ValidatorFn | ValidatorFn[],
  fieldName?: string
): ValidationResult {
  const validatorArray = Array.isArray(validators) ? validators : [validators];

  for (const validator of validatorArray) {
    const result = validator(value, fieldName);
    if (!result.isValid) {
      return result;
    }
  }

  return { isValid: true };
}

// ============================================
// COMMON VALIDATION SCHEMAS
// ============================================

export const CommonSchemas = {
  /**
   * Login form schema
   */
  login: {
    email: [required, email],
    password: [required, minLength(8)],
  },

  /**
   * Registration form schema
   */
  registration: {
    name: [required, minLength(2), maxLength(50)],
    email: [required, email],
    phone: [required, phone],
    password: [required, password],
  },

  /**
   * Profile form schema
   */
  profile: {
    name: [required, minLength(2), maxLength(50)],
    email: [required, email],
    phone: [required, phone],
    dateOfBirth: optional(pastDate),
  },

  /**
   * Address form schema
   */
  address: {
    addressLine1: [required, minLength(5)],
    city: [required, minLength(2)],
    state: [required, minLength(2)],
    pincode: [required, pincode],
  },

  /**
   * Payment form schema
   */
  payment: {
    cardNumber: [required, pattern(/^\d{16}$/, 'Please enter a valid 16-digit card number')],
    expiryMonth: [required, range(1, 12)],
    expiryYear: [required, range(new Date().getFullYear(), new Date().getFullYear() + 10)],
    cvv: [required, pattern(/^\d{3,4}$/, 'Please enter a valid CVV')],
  },
};

export default {
  required,
  minLength,
  maxLength,
  email,
  phone,
  password,
  passwordMatch,
  numeric,
  integer,
  positive,
  range,
  date,
  futureDate,
  pastDate,
  age,
  pincode,
  aadhaar,
  pan,
  otp,
  url,
  pattern,
  compose,
  optional,
  validateForm,
  validateField,
  createFieldValidator,
  CommonSchemas,
};
