/**
 * Contact form validation utilities
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[A-Za-z\s]+$/;
const PHONE_REGEX = /^[\d\s+]+$/;

/**
 * Validate a single form field
 * @param {string} name - Field name
 * @param {string} value - Field value
 * @returns {string} Error message or empty string
 */
export const validateField = (name, value) => {
    const trimmed = value.trim();

    switch (name) {
        case 'fullName':
            if (!trimmed) return 'Full name is required';
            if (trimmed.length < 2) return 'Name must be at least 2 characters';
            if (!NAME_REGEX.test(trimmed)) return 'Name can only contain letters and spaces';
            return '';

        case 'email':
            if (!trimmed) return 'Email is required';
            if (!EMAIL_REGEX.test(trimmed)) return 'Please enter a valid email address';
            return '';

        case 'subject':
            if (!trimmed) return 'Subject is required';
            if (trimmed.length < 3) return 'Subject must be at least 3 characters';
            return '';

        case 'message':
            if (!trimmed) return 'Message is required';
            if (trimmed.length < 20) return `Message must be at least 20 characters (${trimmed.length}/20)`;
            if (trimmed.length > 1000) return 'Message cannot exceed 1000 characters';
            return '';

        case 'phone':
            if (!trimmed) return ''; // phone is optional
            if (!PHONE_REGEX.test(trimmed)) return 'Phone can only contain digits, spaces, and +';
            const digitsOnly = trimmed.replace(/[\s+]/g, '');
            if (digitsOnly.length < 7 || digitsOnly.length > 15)
                return 'Phone number must be 7–15 digits';
            return '';

        default:
            return '';
    }
};

/**
 * Validate the entire contact form
 * @param {Object} formData - Form field values
 * @returns {Object} errors object keyed by field name
 */
export const validateContactForm = (formData) => {
    const errors = {};

    for (const field of ['fullName', 'email', 'subject', 'message', 'phone']) {
        const error = validateField(field, formData[field] || '');
        if (error) {
            errors[field] = error;
        }
    }

    return errors;
};
