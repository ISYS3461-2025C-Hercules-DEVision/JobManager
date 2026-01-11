/**
 * Validation Utilities
 * Common validation functions for form inputs
 */

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @param {Object} options - Validation options
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumber = true,
    requireSpecialChar = false,
  } = options;

  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < minLength) {
    return { isValid: false, error: `Password must be at least ${minLength} characters` };
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }

  if (requireNumber && !/\d/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }

  if (requireSpecialChar && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one special character' };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate password confirmation
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate required field
 * @param {string} value - Value to validate
 * @param {string} fieldName - Name of the field for error message
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate phone number (Australian format)
 * @param {string} phone - Phone number to validate
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validatePhone = (phone) => {
  if (!phone || phone.trim() === '') {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Remove spaces, dashes, and parentheses
  const cleanedPhone = phone.replace(/[\s\-\(\)]/g, '');

  // Australian phone format: 04xx xxx xxx or +614xx xxx xxx or landline
  const phoneRegex = /^(\+?61|0)[2-478](?:[ -]?[0-9]){8}$/;

  if (!phoneRegex.test(cleanedPhone)) {
    return { isValid: false, error: 'Invalid Australian phone number' };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate ABN (Australian Business Number)
 * @param {string} abn - ABN to validate
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validateABN = (abn) => {
  if (!abn || abn.trim() === '') {
    return { isValid: false, error: 'ABN is required' };
  }

  // Remove spaces
  const cleanedABN = abn.replace(/\s/g, '');

  // ABN must be 11 digits
  if (!/^\d{11}$/.test(cleanedABN)) {
    return { isValid: false, error: 'ABN must be 11 digits' };
  }

  // ABN validation algorithm
  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  let sum = 0;

  for (let i = 0; i < 11; i++) {
    const digit = parseInt(cleanedABN[i]);
    const weight = weights[i];
    
    if (i === 0) {
      sum += (digit - 1) * weight;
    } else {
      sum += digit * weight;
    }
  }

  if (sum % 89 !== 0) {
    return { isValid: false, error: 'Invalid ABN' };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate ACN (Australian Company Number)
 * @param {string} acn - ACN to validate
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validateACN = (acn) => {
  if (!acn || acn.trim() === '') {
    return { isValid: false, error: 'ACN is required' };
  }

  // Remove spaces
  const cleanedACN = acn.replace(/\s/g, '');

  // ACN must be 9 digits
  if (!/^\d{9}$/.test(cleanedACN)) {
    return { isValid: false, error: 'ACN must be 9 digits' };
  }

  // ACN validation algorithm
  const weights = [8, 7, 6, 5, 4, 3, 2, 1];
  let sum = 0;

  for (let i = 0; i < 8; i++) {
    sum += parseInt(cleanedACN[i]) * weights[i];
  }

  const remainder = sum % 10;
  const checkDigit = remainder === 0 ? 0 : 10 - remainder;

  if (checkDigit !== parseInt(cleanedACN[8])) {
    return { isValid: false, error: 'Invalid ACN' };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validateURL = (url) => {
  if (!url || url.trim() === '') {
    return { isValid: false, error: 'URL is required' };
  }

  try {
    new URL(url);
    return { isValid: true, error: '' };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
};

/**
 * Validate minimum length
 * @param {string} value - Value to validate
 * @param {number} minLength - Minimum length
 * @param {string} fieldName - Field name for error message
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validateMinLength = (value, minLength, fieldName = 'This field') => {
  if (!value) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  if (value.length < minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate maximum length
 * @param {string} value - Value to validate
 * @param {number} maxLength - Maximum length
 * @param {string} fieldName - Field name for error message
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validateMaxLength = (value, maxLength, fieldName = 'This field') => {
  if (!value) {
    return { isValid: true, error: '' };
  }

  if (value.length > maxLength) {
    return { isValid: false, error: `${fieldName} must not exceed ${maxLength} characters` };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate number
 * @param {string|number} value - Value to validate
 * @param {Object} options - Validation options
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validateNumber = (value, options = {}) => {
  const { min, max, integer = false, fieldName = 'This field' } = options;

  if (value === '' || value === null || value === undefined) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  const num = Number(value);

  if (isNaN(num)) {
    return { isValid: false, error: `${fieldName} must be a number` };
  }

  if (integer && !Number.isInteger(num)) {
    return { isValid: false, error: `${fieldName} must be an integer` };
  }

  if (min !== undefined && num < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min}` };
  }

  if (max !== undefined && num > max) {
    return { isValid: false, error: `${fieldName} must not exceed ${max}` };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate date
 * @param {string} date - Date string to validate
 * @param {Object} options - Validation options
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validateDate = (date, options = {}) => {
  const { minDate, maxDate, futureOnly = false, pastOnly = false, fieldName = 'Date' } = options;

  if (!date) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  const dateObj = new Date(date);

  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: 'Invalid date format' };
  }

  const now = new Date();

  if (futureOnly && dateObj < now) {
    return { isValid: false, error: `${fieldName} must be in the future` };
  }

  if (pastOnly && dateObj > now) {
    return { isValid: false, error: `${fieldName} must be in the past` };
  }

  if (minDate && dateObj < new Date(minDate)) {
    return { isValid: false, error: `${fieldName} must be after ${new Date(minDate).toLocaleDateString()}` };
  }

  if (maxDate && dateObj > new Date(maxDate)) {
    return { isValid: false, error: `${fieldName} must be before ${new Date(maxDate).toLocaleDateString()}` };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate file upload
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = [],
    required = false,
  } = options;

  if (!file) {
    if (required) {
      return { isValid: false, error: 'File is required' };
    }
    return { isValid: true, error: '' };
  }

  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    return { isValid: false, error: `File size must not exceed ${maxSizeMB}MB` };
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { isValid: false, error: `File type must be one of: ${allowedTypes.join(', ')}` };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate select/dropdown
 * @param {string} value - Selected value
 * @param {string} fieldName - Field name for error message
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validateSelect = (value, fieldName = 'Selection') => {
  if (!value || value === '' || value === 'default' || value === 'select') {
    return { isValid: false, error: `Please select a ${fieldName.toLowerCase()}` };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate array (for multi-select, checkboxes)
 * @param {Array} array - Array to validate
 * @param {Object} options - Validation options
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validateArray = (array, options = {}) => {
  const { minLength = 1, maxLength, fieldName = 'Selection' } = options;

  if (!array || !Array.isArray(array)) {
    return { isValid: false, error: `${fieldName} must be an array` };
  }

  if (array.length < minLength) {
    return { isValid: false, error: `Please select at least ${minLength} ${fieldName.toLowerCase()}` };
  }

  if (maxLength && array.length > maxLength) {
    return { isValid: false, error: `Please select no more than ${maxLength} ${fieldName.toLowerCase()}` };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate multiple fields at once
 * @param {Object} fields - Object with field values and validators
 * @returns {Object} { isValid: boolean, errors: Object }
 * 
 * Example:
 * const result = validateFields({
 *   email: { value: 'test@example.com', validator: validateEmail },
 *   password: { value: 'password123', validator: (val) => validatePassword(val, { minLength: 8 }) }
 * });
 */
export const validateFields = (fields) => {
  const errors = {};
  let isValid = true;

  Object.keys(fields).forEach((fieldName) => {
    const { value, validator } = fields[fieldName];
    const result = validator(value);
    
    if (!result.isValid) {
      errors[fieldName] = result.error;
      isValid = false;
    }
  });

  return { isValid, errors };
};

/**
 * Check if value matches regex pattern
 * @param {string} value - Value to validate
 * @param {RegExp} pattern - Regex pattern
 * @param {string} errorMessage - Error message
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validatePattern = (value, pattern, errorMessage = 'Invalid format') => {
  if (!value) {
    return { isValid: false, error: 'This field is required' };
  }

  if (!pattern.test(value)) {
    return { isValid: false, error: errorMessage };
  }

  return { isValid: true, error: '' };
};

// Export all validators as default object
export default {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateRequired,
  validatePhone,
  validateABN,
  validateACN,
  validateURL,
  validateMinLength,
  validateMaxLength,
  validateNumber,
  validateDate,
  validateFile,
  validateSelect,
  validateArray,
  validateFields,
  validatePattern,
};
