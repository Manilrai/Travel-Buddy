/**
 * FormTextArea - Reusable accessible textarea component
 * Includes character counter, error state, and aria attributes
 */

const FormTextArea = ({
    id,
    label,
    name,
    value,
    onChange,
    onBlur,
    error,
    required = false,
    placeholder = '',
    disabled = false,
    rows = 5,
    maxLength = 1000,
    showCounter = true,
}) => {
    const errorId = `${id}-error`;
    const charCount = (value || '').trim().length;

    return (
        <div className="mb-5">
            <div className="flex items-center justify-between mb-1">
                <label htmlFor={id} className="label mb-0">
                    {label}
                    {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
                </label>
                {showCounter && (
                    <span
                        className={`text-xs font-medium ${
                            charCount > maxLength ? 'text-red-500' : 'text-gray-400'
                        }`}
                        aria-live="polite"
                    >
                        {charCount}/{maxLength}
                    </span>
                )}
            </div>
            <textarea
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                rows={rows}
                aria-invalid={!!error}
                aria-describedby={error ? errorId : undefined}
                className={`${error ? 'input-error' : 'input'} resize-none ${
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

export default FormTextArea;
