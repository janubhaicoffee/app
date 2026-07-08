'use client';

function Input({
  label,
  error,
  type = 'text',
  placeholder,
  value,
  onChange,
  icon: Icon,
  helpText,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  const inputId = props.id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold text-[var(--text-secondary)] mb-1.5"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <Icon size={16} />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm font-inherit transition-all duration-200 ${
            Icon ? 'pl-10' : ''
          } ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
              : 'border-gray-300 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[rgba(62,39,35,0.1)]'
          } disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed outline-none`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {helpText && !error && <p className="mt-1 text-xs text-gray-400">{helpText}</p>}
    </div>
  );
}

Input.Select = function Select({
  label,
  error,
  value,
  onChange,
  icon: Icon,
  helpText,
  required = false,
  disabled = false,
  children,
  className = '',
  placeholder,
  ...props
}) {
  const selectId = props.id || `select-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-semibold text-[var(--text-secondary)] mb-1.5"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 z-10">
            <Icon size={16} />
          </div>
        )}
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm font-inherit transition-all duration-200 appearance-none ${
            Icon ? 'pl-10' : ''
          } ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
              : 'border-gray-300 focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[rgba(62,39,35,0.1)]'
          } disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed outline-none`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {children}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {helpText && !error && <p className="mt-1 text-xs text-gray-400">{helpText}</p>}
    </div>
  );
};

export default Input;
