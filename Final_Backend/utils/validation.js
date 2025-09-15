// Professional SaaS Validation Utilities
// utils/validation.js

// Constants for validation
const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 1000,
  ADDRESS_MIN_LENGTH: 5,
  ADDRESS_MAX_LENGTH: 500
};

const USER_ROLES = ['customer', 'restaurant_manager', 'rider', 'admin'];
const RIDER_STATUS = ['available', 'busy', 'offline'];
const VEHICLE_TYPES = ['bicycle', 'motorcycle', 'car', 'scooter'];
const ORDER_STATUS = ['pending', 'confirmed', 'preparing', 'on_the_way', 'delivered', 'cancelled'];
const PAYMENT_STATUS = ['pending', 'paid', 'failed', 'refunded'];

// Professional validation functions
class ValidationError extends Error {
  constructor(message, field = null, code = 'VALIDATION_ERROR') {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.code = code;
    this.statusCode = 400;
  }
}

const validateEmail = (email, fieldName = 'email') => {
  if (!email) {
    throw new ValidationError(`${fieldName} is required`, fieldName);
  }
  if (typeof email !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`, fieldName);
  }
  if (!VALIDATION_RULES.EMAIL.test(email.trim())) {
    throw new ValidationError(`${fieldName} must be a valid email address`, fieldName);
  }
  return email.trim().toLowerCase();
};

const validatePassword = (password, fieldName = 'password') => {
  if (!password) {
    throw new ValidationError(`${fieldName} is required`, fieldName);
  }
  if (typeof password !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`, fieldName);
  }
  if (password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
    throw new ValidationError(
      `${fieldName} must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters long`,
      fieldName
    );
  }
  return password;
};

const validateName = (name, fieldName = 'name') => {
  if (!name) {
    throw new ValidationError(`${fieldName} is required`, fieldName);
  }
  if (typeof name !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`, fieldName);
  }
  const trimmedName = name.trim();
  if (trimmedName.length < VALIDATION_RULES.NAME_MIN_LENGTH) {
    throw new ValidationError(
      `${fieldName} must be at least ${VALIDATION_RULES.NAME_MIN_LENGTH} characters long`,
      fieldName
    );
  }
  if (trimmedName.length > VALIDATION_RULES.NAME_MAX_LENGTH) {
    throw new ValidationError(
      `${fieldName} must be less than ${VALIDATION_RULES.NAME_MAX_LENGTH} characters`,
      fieldName
    );
  }
  return trimmedName;
};

const validatePhone = (phone, fieldName = 'phone_number') => {
  if (!phone) {
    throw new ValidationError(`${fieldName} is required`, fieldName);
  }
  if (typeof phone !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`, fieldName);
  }
  const cleanPhone = phone.replace(/\s+/g, '').replace(/[()\-\.]/g, '');
  if (!VALIDATION_RULES.PHONE.test(cleanPhone)) {
    throw new ValidationError(`${fieldName} must be a valid phone number`, fieldName);
  }
  return cleanPhone;
};

const validateRole = (role, fieldName = 'role') => {
  if (!role) {
    throw new ValidationError(`${fieldName} is required`, fieldName);
  }
  if (typeof role !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`, fieldName);
  }
  const normalizedRole = role.toLowerCase().trim();
  if (!USER_ROLES.includes(normalizedRole)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${USER_ROLES.join(', ')}`,
      fieldName
    );
  }
  return normalizedRole;
};

const validateRiderStatus = (status, fieldName = 'status') => {
  if (!status) {
    throw new ValidationError(`${fieldName} is required`, fieldName);
  }
  if (typeof status !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`, fieldName);
  }
  const normalizedStatus = status.toLowerCase().trim();
  if (!RIDER_STATUS.includes(normalizedStatus)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${RIDER_STATUS.join(', ')}`,
      fieldName
    );
  }
  return normalizedStatus;
};

const validateVehicleType = (vehicleType, fieldName = 'vehicle_type') => {
  if (!vehicleType) {
    throw new ValidationError(`${fieldName} is required`, fieldName);
  }
  if (typeof vehicleType !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`, fieldName);
  }
  const normalizedType = vehicleType.toLowerCase().trim();
  if (!VEHICLE_TYPES.includes(normalizedType)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${VEHICLE_TYPES.join(', ')}`,
      fieldName
    );
  }
  return normalizedType;
};

const validateAddress = (address, fieldName = 'address') => {
  if (!address) {
    throw new ValidationError(`${fieldName} is required`, fieldName);
  }
  if (typeof address !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`, fieldName);
  }
  const trimmedAddress = address.trim();
  if (trimmedAddress.length < VALIDATION_RULES.ADDRESS_MIN_LENGTH) {
    throw new ValidationError(
      `${fieldName} must be at least ${VALIDATION_RULES.ADDRESS_MIN_LENGTH} characters long`,
      fieldName
    );
  }
  if (trimmedAddress.length > VALIDATION_RULES.ADDRESS_MAX_LENGTH) {
    throw new ValidationError(
      `${fieldName} must be less than ${VALIDATION_RULES.ADDRESS_MAX_LENGTH} characters`,
      fieldName
    );
  }
  return trimmedAddress;
};

const validatePositiveNumber = (value, fieldName) => {
  if (value === undefined || value === null) {
    throw new ValidationError(`${fieldName} is required`, fieldName);
  }
  const num = parseFloat(value);
  if (isNaN(num) || num < 0) {
    throw new ValidationError(`${fieldName} must be a positive number`, fieldName);
  }
  return num;
};

const validateInteger = (value, fieldName, min = 0) => {
  if (value === undefined || value === null) {
    throw new ValidationError(`${fieldName} is required`, fieldName);
  }
  const num = parseInt(value);
  if (isNaN(num) || num < min) {
    throw new ValidationError(`${fieldName} must be an integer >= ${min}`, fieldName);
  }
  return num;
};

// Professional validation middleware factory
const createValidationMiddleware = (schema) => {
  return (req, res, next) => {
    try {
      const errors = [];
      const validatedData = {};

      for (const [field, validator] of Object.entries(schema)) {
        try {
          const value = req.body[field];
          if (validator.required || value !== undefined) {
            validatedData[field] = validator.validate(value, field);
          }
        } catch (error) {
          errors.push({
            field: error.field || field,
            message: error.message,
            code: error.code || 'VALIDATION_ERROR'
          });
        }
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
          code: 'VALIDATION_ERROR'
        });
      }

      // Attach validated data to request
      req.validatedData = validatedData;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  ValidationError,
  VALIDATION_RULES,
  USER_ROLES,
  RIDER_STATUS,
  VEHICLE_TYPES,
  ORDER_STATUS,
  PAYMENT_STATUS,
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  validateRole,
  validateRiderStatus,
  validateVehicleType,
  validateAddress,
  validatePositiveNumber,
  validateInteger,
  createValidationMiddleware
};