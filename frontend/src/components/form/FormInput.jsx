/**
 * FormInput - Reusable accessible input component
 * Supports error state, required indicator, and aria attributes
 */

const FormInput = ({
    id,
    label,
    name,
    type = 'text',
    value,
    onChange,
    onBlur,
    error,
    required = false,
    placeholder = '',
    disabled = false,
    autoComplete,
}) => {
    const errorId = `${id}-error`;

    return (
        <div className="mb-5">
            <label htmlFor={id} className="label">
                {label}
                {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
            </label>
            <input
                id={id}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                autoComplete={autoComplete}
                aria-invalid={!!error}
                aria-describedby={error ? errorId : undefined}
                className={`${error ? 'input-error' : 'input'} ${
                    disabled ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
            />
            {error && (
                <p id={errorId} className="mt-1.5 text-sm text-red-600 flex items-center gap-1" role="alert">
                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
};

export default FormInput;
