import React, { FC } from "react";

interface CustomPhoneInputProps {
  id?: string;
  name?: string;
  placeholder?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
  success?: boolean;
  error?: boolean;
  hint?: string;
  maxLength?: number; // default 11
}

const CustomPhoneInput: FC<CustomPhoneInputProps> = ({
  id,
  name,
  placeholder = "09xxxxxxxxx",
  defaultValue,
  onChange,
  className = "",
  disabled = false,
  success = false,
  error = false,
  hint,
  maxLength = 11,
}) => {
  let inputClasses = `h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${className}`;

  if (disabled) {
    inputClasses += ` text-gray-500 border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`;
  } else if (error) {
    inputClasses += ` text-error-800 border-error-500 focus:ring-3 focus:ring-error-500/10  dark:text-error-400 dark:border-error-500`;
  } else if (success) {
    inputClasses += ` text-success-500 border-success-400 focus:ring-success-500/10 focus:border-success-300  dark:text-success-400 dark:border-success-500`;
  } else {
    inputClasses += ` bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800`;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // keep only digits + limit to 11
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, maxLength);

    // set cleaned value back to input (uncontrolled-friendly)
    e.target.value = digitsOnly;

    onChange?.(e);
  };

  return (
    <div className="relative">
      <input
        type="tel"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="tel"
        id={id}
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        disabled={disabled}
        maxLength={maxLength}
        className={inputClasses}
        onChange={handleChange}
      />

      {hint && (
        <p
          className={`mt-1.5 text-xs ${
            error
              ? "text-error-500"
              : success
                ? "text-success-500"
                : "text-gray-500"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default CustomPhoneInput;
