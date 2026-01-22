/**
 * Validation Utilities Tests
 * Unit tests for form validation functions
 */

import {
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
} from './validation';

// ============================================
// REQUIRED VALIDATOR
// ============================================

describe('required validator', () => {
  it('returns invalid for null', () => {
    const result = required(null);
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('returns invalid for undefined', () => {
    const result = required(undefined);
    expect(result.isValid).toBe(false);
  });

  it('returns invalid for empty string', () => {
    const result = required('');
    expect(result.isValid).toBe(false);
  });

  it('returns invalid for whitespace-only string', () => {
    const result = required('   ');
    expect(result.isValid).toBe(false);
  });

  it('returns invalid for empty array', () => {
    const result = required([]);
    expect(result.isValid).toBe(false);
  });

  it('returns valid for non-empty string', () => {
    const result = required('hello');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('returns valid for number 0', () => {
    const result = required(0);
    expect(result.isValid).toBe(true);
  });

  it('returns valid for false', () => {
    const result = required(false);
    expect(result.isValid).toBe(true);
  });

  it('uses custom field name in error message', () => {
    const result = required('', 'Email');
    expect(result.error).toContain('Email');
  });
});

// ============================================
// LENGTH VALIDATORS
// ============================================

describe('minLength validator', () => {
  it('returns invalid for string shorter than minimum', () => {
    const validator = minLength(5);
    const result = validator('abc');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('at least 5');
  });

  it('returns valid for string at minimum length', () => {
    const validator = minLength(5);
    const result = validator('abcde');
    expect(result.isValid).toBe(true);
  });

  it('returns valid for string longer than minimum', () => {
    const validator = minLength(5);
    const result = validator('abcdefgh');
    expect(result.isValid).toBe(true);
  });
});

describe('maxLength validator', () => {
  it('returns invalid for string longer than maximum', () => {
    const validator = maxLength(5);
    const result = validator('abcdefgh');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('no more than 5');
  });

  it('returns valid for string at maximum length', () => {
    const validator = maxLength(5);
    const result = validator('abcde');
    expect(result.isValid).toBe(true);
  });

  it('returns valid for string shorter than maximum', () => {
    const validator = maxLength(5);
    const result = validator('abc');
    expect(result.isValid).toBe(true);
  });
});

// ============================================
// EMAIL VALIDATOR
// ============================================

describe('email validator', () => {
  it('returns valid for correct email format', () => {
    expect(email('test@example.com').isValid).toBe(true);
    expect(email('user.name@domain.co.in').isValid).toBe(true);
    expect(email('user+tag@gmail.com').isValid).toBe(true);
  });

  it('returns invalid for incorrect email format', () => {
    expect(email('invalid').isValid).toBe(false);
    expect(email('invalid@').isValid).toBe(false);
    expect(email('@domain.com').isValid).toBe(false);
    expect(email('test@domain').isValid).toBe(false);
    expect(email('').isValid).toBe(false);
  });
});

// ============================================
// PHONE VALIDATOR (Indian format)
// ============================================

describe('phone validator', () => {
  it('returns valid for correct Indian phone numbers', () => {
    expect(phone('9876543210').isValid).toBe(true);
    expect(phone('6123456789').isValid).toBe(true);
    expect(phone('7000000000').isValid).toBe(true);
    expect(phone('8999999999').isValid).toBe(true);
  });

  it('returns invalid for incorrect phone numbers', () => {
    expect(phone('1234567890').isValid).toBe(false); // starts with 1
    expect(phone('5123456789').isValid).toBe(false); // starts with 5
    expect(phone('987654321').isValid).toBe(false);  // 9 digits
    expect(phone('98765432101').isValid).toBe(false); // 11 digits
    expect(phone('').isValid).toBe(false);
  });

  it('strips non-numeric characters before validation', () => {
    expect(phone('(987) 654-3210').isValid).toBe(true);
    expect(phone('987-654-3210').isValid).toBe(true);
  });
});

// ============================================
// PASSWORD VALIDATOR
// ============================================

describe('password validator', () => {
  it('returns valid for strong password', () => {
    expect(password('Password1').isValid).toBe(true);
    expect(password('MyP@ssw0rd').isValid).toBe(true);
    expect(password('Abcd1234').isValid).toBe(true);
  });

  it('returns invalid for password without uppercase', () => {
    expect(password('password1').isValid).toBe(false);
  });

  it('returns invalid for password without lowercase', () => {
    expect(password('PASSWORD1').isValid).toBe(false);
  });

  it('returns invalid for password without number', () => {
    expect(password('Password').isValid).toBe(false);
  });

  it('returns invalid for password shorter than 8 characters', () => {
    expect(password('Pass1').isValid).toBe(false);
  });
});

describe('passwordMatch validator', () => {
  it('returns valid when passwords match', () => {
    const validator = passwordMatch('Password123');
    expect(validator('Password123').isValid).toBe(true);
  });

  it('returns invalid when passwords do not match', () => {
    const validator = passwordMatch('Password123');
    expect(validator('Password456').isValid).toBe(false);
  });
});

// ============================================
// NUMERIC VALIDATORS
// ============================================

describe('numeric validator', () => {
  it('returns valid for numbers', () => {
    expect(numeric(123).isValid).toBe(true);
    expect(numeric('123').isValid).toBe(true);
    expect(numeric(0).isValid).toBe(true);
    expect(numeric(-5).isValid).toBe(true);
    expect(numeric(3.14).isValid).toBe(true);
  });

  it('returns invalid for non-numeric strings', () => {
    expect(numeric('abc').isValid).toBe(false);
    expect(numeric('12abc').isValid).toBe(false);
    expect(numeric('NaN').isValid).toBe(false);
  });

  it('returns valid for empty string (coerces to 0)', () => {
    // Note: Number('') === 0, so empty string is technically valid
    // Use required validator in combination to catch empty values
    expect(numeric('').isValid).toBe(true);
  });
});

describe('integer validator', () => {
  it('returns valid for integers', () => {
    expect(integer(123).isValid).toBe(true);
    expect(integer(-5).isValid).toBe(true);
    expect(integer(0).isValid).toBe(true);
  });

  it('returns invalid for decimals', () => {
    expect(integer(3.14).isValid).toBe(false);
    expect(integer(1.5).isValid).toBe(false);
  });
});

describe('positive validator', () => {
  it('returns valid for positive numbers', () => {
    expect(positive(1).isValid).toBe(true);
    expect(positive(100).isValid).toBe(true);
    expect(positive(0.5).isValid).toBe(true);
  });

  it('returns invalid for zero and negative numbers', () => {
    expect(positive(0).isValid).toBe(false);
    expect(positive(-1).isValid).toBe(false);
  });
});

describe('range validator', () => {
  it('returns valid for numbers within range', () => {
    const validator = range(1, 10);
    expect(validator(1).isValid).toBe(true);
    expect(validator(5).isValid).toBe(true);
    expect(validator(10).isValid).toBe(true);
  });

  it('returns invalid for numbers outside range', () => {
    const validator = range(1, 10);
    expect(validator(0).isValid).toBe(false);
    expect(validator(11).isValid).toBe(false);
    expect(validator(-5).isValid).toBe(false);
  });
});

// ============================================
// DATE VALIDATORS
// ============================================

describe('date validator', () => {
  it('returns valid for valid date objects', () => {
    expect(date(new Date()).isValid).toBe(true);
    expect(date(new Date('2024-01-15')).isValid).toBe(true);
  });

  it('returns valid for valid date strings', () => {
    expect(date('2024-01-15').isValid).toBe(true);
    expect(date('2024/01/15').isValid).toBe(true);
  });

  it('returns invalid for invalid dates', () => {
    expect(date('invalid').isValid).toBe(false);
    expect(date('').isValid).toBe(false);
  });
});

describe('futureDate validator', () => {
  it('returns valid for future dates', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(futureDate(tomorrow).isValid).toBe(true);
  });

  it('returns invalid for past dates', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(futureDate(yesterday).isValid).toBe(false);
  });
});

describe('pastDate validator', () => {
  it('returns valid for past dates', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(pastDate(yesterday).isValid).toBe(true);
  });

  it('returns invalid for future dates', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(pastDate(tomorrow).isValid).toBe(false);
  });
});

describe('age validator', () => {
  it('returns valid for age within range', () => {
    const validator = age(18, 100);
    const birthDate = new Date();
    birthDate.setFullYear(birthDate.getFullYear() - 25);
    expect(validator(birthDate).isValid).toBe(true);
  });

  it('returns invalid for age below minimum', () => {
    const validator = age(18, 100);
    const birthDate = new Date();
    birthDate.setFullYear(birthDate.getFullYear() - 10);
    expect(validator(birthDate).isValid).toBe(false);
  });

  it('returns invalid for age above maximum', () => {
    const validator = age(18, 100);
    const birthDate = new Date();
    birthDate.setFullYear(birthDate.getFullYear() - 110);
    expect(validator(birthDate).isValid).toBe(false);
  });
});

// ============================================
// INDIA-SPECIFIC VALIDATORS
// ============================================

describe('pincode validator', () => {
  it('returns valid for correct Indian pincodes', () => {
    expect(pincode('110001').isValid).toBe(true);
    expect(pincode('400001').isValid).toBe(true);
    expect(pincode('560001').isValid).toBe(true);
  });

  it('returns invalid for incorrect pincodes', () => {
    expect(pincode('000001').isValid).toBe(false); // starts with 0
    expect(pincode('11000').isValid).toBe(false);  // 5 digits
    expect(pincode('1100001').isValid).toBe(false); // 7 digits
    expect(pincode('').isValid).toBe(false);
  });
});

describe('aadhaar validator', () => {
  it('returns valid for correct Aadhaar numbers', () => {
    expect(aadhaar('234567890123').isValid).toBe(true);
    expect(aadhaar('987654321098').isValid).toBe(true);
  });

  it('returns invalid for incorrect Aadhaar numbers', () => {
    expect(aadhaar('012345678901').isValid).toBe(false); // starts with 0
    expect(aadhaar('112345678901').isValid).toBe(false); // starts with 1
    expect(aadhaar('23456789012').isValid).toBe(false);  // 11 digits
    expect(aadhaar('2345678901234').isValid).toBe(false); // 13 digits
  });
});

describe('pan validator', () => {
  it('returns valid for correct PAN numbers', () => {
    expect(pan('ABCDE1234F').isValid).toBe(true);
    expect(pan('ZZZZZ9999Z').isValid).toBe(true);
  });

  it('returns invalid for incorrect PAN numbers', () => {
    expect(pan('ABCDE123F').isValid).toBe(false);  // 9 chars
    expect(pan('ABCDE12345').isValid).toBe(false); // ends with number
    expect(pan('1BCDE1234F').isValid).toBe(false); // starts with number
    expect(pan('').isValid).toBe(false);
  });

  it('handles lowercase input', () => {
    expect(pan('abcde1234f').isValid).toBe(true);
  });
});

describe('otp validator', () => {
  it('returns valid for 6-digit OTP', () => {
    expect(otp('123456').isValid).toBe(true);
    expect(otp('000000').isValid).toBe(true);
  });

  it('returns invalid for incorrect OTP', () => {
    expect(otp('12345').isValid).toBe(false);  // 5 digits
    expect(otp('1234567').isValid).toBe(false); // 7 digits
    expect(otp('abcdef').isValid).toBe(false);
    expect(otp('').isValid).toBe(false);
  });
});

// ============================================
// URL VALIDATOR
// ============================================

describe('url validator', () => {
  it('returns valid for correct URLs', () => {
    expect(url('https://example.com').isValid).toBe(true);
    expect(url('http://localhost:3000').isValid).toBe(true);
    expect(url('https://example.com/path?query=1').isValid).toBe(true);
  });

  it('returns invalid for incorrect URLs', () => {
    expect(url('not-a-url').isValid).toBe(false);
    expect(url('example.com').isValid).toBe(false);
    expect(url('').isValid).toBe(false);
  });
});

// ============================================
// PATTERN VALIDATOR
// ============================================

describe('pattern validator', () => {
  it('returns valid when pattern matches', () => {
    const validator = pattern(/^[A-Z]{3}$/, 'Must be 3 uppercase letters');
    expect(validator('ABC').isValid).toBe(true);
  });

  it('returns invalid with custom error when pattern does not match', () => {
    const errorMsg = 'Must be 3 uppercase letters';
    const validator = pattern(/^[A-Z]{3}$/, errorMsg);
    const result = validator('abc');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe(errorMsg);
  });
});

// ============================================
// COMPOSITE VALIDATORS
// ============================================

describe('compose validator', () => {
  it('returns valid when all validators pass', () => {
    const validator = compose(required, minLength(3), maxLength(10));
    expect(validator('hello').isValid).toBe(true);
  });

  it('returns first error when validation fails', () => {
    const validator = compose(required, minLength(5));
    const result = validator('abc', 'Name');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('at least 5');
  });

  it('stops at first failure', () => {
    const validator = compose(required, minLength(5), maxLength(3)); // contradictory
    const result = validator('', 'Field');
    expect(result.error).toContain('required');
  });
});

describe('optional validator', () => {
  it('returns valid for empty values', () => {
    const validator = optional(email);
    expect(validator('').isValid).toBe(true);
    expect(validator(null).isValid).toBe(true);
    expect(validator(undefined).isValid).toBe(true);
  });

  it('runs inner validator for non-empty values', () => {
    const validator = optional(email);
    expect(validator('test@example.com').isValid).toBe(true);
    expect(validator('invalid').isValid).toBe(false);
  });
});

// ============================================
// FORM VALIDATION
// ============================================

describe('validateForm', () => {
  it('returns valid result when all fields pass', () => {
    const schema = {
      email: [required, email],
      password: [required, minLength(8)],
    };
    const values = {
      email: 'test@example.com',
      password: 'password123',
    };
    const result = validateForm(values, schema);
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it('returns errors for invalid fields', () => {
    const schema = {
      email: [required, email],
      password: [required, minLength(8)],
    };
    const values = {
      email: 'invalid',
      password: '123',
    };
    const result = validateForm(values, schema);
    expect(result.isValid).toBe(false);
    expect(result.errors.email).toBeDefined();
    expect(result.errors.password).toBeDefined();
    expect(result.firstError).toBeDefined();
  });

  it('formats field names in error messages', () => {
    const schema = {
      firstName: required,
    };
    const result = validateForm({ firstName: '' }, schema);
    expect(result.errors.firstName).toContain('First Name');
  });
});

describe('validateField', () => {
  it('returns valid for passing validators', () => {
    const result = validateField('test@example.com', [required, email]);
    expect(result.isValid).toBe(true);
  });

  it('returns first error for failing validators', () => {
    const result = validateField('', [required, email], 'Email');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('required');
  });
});

describe('createFieldValidator', () => {
  it('returns undefined for valid values', () => {
    const validator = createFieldValidator([required, email]);
    expect(validator('test@example.com')).toBeUndefined();
  });

  it('returns error message for invalid values', () => {
    const validator = createFieldValidator([required, email]);
    expect(validator('')).toBeDefined();
  });
});

// ============================================
// COMMON SCHEMAS
// ============================================

describe('CommonSchemas', () => {
  describe('login schema', () => {
    it('validates correct login data', () => {
      const result = validateForm(
        { email: 'test@example.com', password: 'password123' },
        CommonSchemas.login
      );
      expect(result.isValid).toBe(true);
    });
  });

  describe('registration schema', () => {
    it('validates correct registration data', () => {
      const result = validateForm(
        {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '9876543210',
          password: 'Password1',
        },
        CommonSchemas.registration
      );
      expect(result.isValid).toBe(true);
    });
  });

  describe('address schema', () => {
    it('validates correct address data', () => {
      const result = validateForm(
        {
          addressLine1: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
        },
        CommonSchemas.address
      );
      expect(result.isValid).toBe(true);
    });

    it('fails for invalid pincode', () => {
      const result = validateForm(
        {
          addressLine1: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '00001',
        },
        CommonSchemas.address
      );
      expect(result.isValid).toBe(false);
      expect(result.errors.pincode).toBeDefined();
    });
  });
});
