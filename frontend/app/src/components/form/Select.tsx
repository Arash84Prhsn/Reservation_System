import { cn } from "@/lib/utils";
import React, { useState, useRef, useEffect } from "react";

interface SelectProps {
  options: { value: string; label: string }[];
  defaultValue?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  defaultValue = "",
  placeholder = "انتخاب کنید...",
  onChange,
  disabled = false,
  className,
}) => {
  const [selected, setSelected] = useState<string>(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // بستن منو با کلیک خارج از کامپوننت
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (value: string) => {
    setSelected(value);
    setIsOpen(false);
    if (onChange) onChange(value);
  };

  const selectedOption = options.find((opt) => opt.value === selected);

  return (
    <div className={cn("w-full", className)} ref={containerRef}>
      {/* <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
        { }
      </label> */}

      <div className="relative z-20 w-full">
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`shadow-theme-xs focus:border-brand-300 flex h-11 w-full cursor-pointer items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-hidden transition dark:border-gray-700 dark:bg-gray-900 ${
            disabled ? "cursor-not-allowed opacity-50" : ""
          }`}
        >
          <span
            className={`text-sm ${selectedOption ? "text-gray-800 dark:text-white/90" : "text-gray-400"}`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <svg
            className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M4.79175 7.39551L10.0001 12.6038L15.2084 7.39551"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 z-40 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900">
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`cursor-pointer px-4 py-2.5 text-sm transition ${
                  selected === option.value
                    ? "bg-brand-500/10 text-brand-600 dark:text-brand-400"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Select;
