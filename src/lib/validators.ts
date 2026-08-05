/**
 * Lightweight validators for frontend forms
 * Mirrors backend Zod validation where applicable
 */

export type ValidationResult = {
  valid: boolean;
  errors: Record<string, string>;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(\+?\d{1,3}[- ]?)?\d{8,15}$/;

export function validateEmail(email: string): string | null {
  if (!email) return 'Email is required';
  if (!EMAIL_REGEX.test(email)) return 'Please enter a valid email address';
  if (email.length > 255) return 'Email is too long';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  if (password.length > 128) return 'Password is too long';
  return null;
}

export function validateName(name: string): string | null {
  if (!name) return 'Name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  if (name.length > 100) return 'Name is too long';
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!phone) return 'Phone number is required';
  const cleaned = phone.replace(/\s/g, '');
  if (!PHONE_REGEX.test(cleaned)) return 'Please enter a valid phone number';
  return null;
}

export function validateAddress(address: string): string | null {
  if (!address) return 'Address is required';
  if (address.trim().length < 5) return 'Address is too short';
  return null;
}

export function validateRequired(value: string, field: string): string | null {
  if (!value || !value.trim()) return `${field} is required`;
  return null;
}

export function validateLogin(data: { email: string; password: string }): ValidationResult {
  const errors: Record<string, string> = {};
  const emailErr = validateEmail(data.email);
  if (emailErr) errors.email = emailErr;
  const passErr = validatePassword(data.password);
  if (passErr) errors.password = passErr;
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateSignUp(data: { name: string; email: string; password: string; confirmPassword?: string }): ValidationResult {
  const errors: Record<string, string> = {};
  const nameErr = validateName(data.name);
  if (nameErr) errors.name = nameErr;
  const emailErr = validateEmail(data.email);
  if (emailErr) errors.email = emailErr;
  const passErr = validatePassword(data.password);
  if (passErr) errors.password = passErr;
  if (data.confirmPassword !== undefined && data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateCheckout(data: {
  fullName: string;
  email: string;
  phone: string;
  wilaya: string;
  city: string;
  address: string;
}): ValidationResult {
  const errors: Record<string, string> = {};
  const checks: Array<[string, string | null]> = [
    ['fullName', validateName(data.fullName)],
    ['email', validateEmail(data.email)],
    ['phone', validatePhone(data.phone)],
    ['wilaya', validateRequired(data.wilaya, 'Wilaya')],
    ['city', validateRequired(data.city, 'City')],
    ['address', validateAddress(data.address)],
  ];
  checks.forEach(([k, v]) => {
    if (v) errors[k] = v;
  });
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateProduct(data: {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image: string;
}): ValidationResult {
  const errors: Record<string, string> = {};
  if (!data.name || data.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
  if (!data.description || data.description.trim().length < 10) errors.description = 'Description must be at least 10 characters';
  if (!data.price || data.price <= 0) errors.price = 'Price must be greater than 0';
  if (!data.category) errors.category = 'Category is required';
  if (data.stock < 0) errors.stock = 'Stock cannot be negative';
  if (!data.image) errors.image = 'Image is required';
  return { valid: Object.keys(errors).length === 0, errors };
}
