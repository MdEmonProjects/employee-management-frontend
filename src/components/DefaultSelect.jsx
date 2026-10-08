import React, { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";

const DefaultSelect = ({
  label,
  type,
  options,
  registerKey,
  require,
  valueField,
  nameField,
  labelColor = "text-black",
  disabled,
  unicode = false,
  labelPosition = "top",
  onChange,
  defaultValue = "Select",
}) => {
  const {
    register,
    formState: { errors },
    setValue,
  } = useFormContext();

  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleChange = (e) => {
    const selectedValue =
      type === "number" ? parseInt(e.target.value) : e.target.value;

    setValue(registerKey, selectedValue);

    if (onChange) {
      const selectedOption = options.find(
        (opt) => String(opt[valueField]) === String(e.target.value)
      );
      onChange(selectedOption);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.getElementById(`${registerKey}-dropdown`);
      if (dropdown && !dropdown.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [registerKey]);

  const hasError = errors[registerKey];

  return (
    <div
      className={`min-w-0 w-full font-SolaimanLipi ${labelPosition === "left" ? "flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4" : ""
        }`}
    >
      {label && (
        <label
          htmlFor={registerKey}
          className={`font-bold text-sm ${labelPosition === "left"
            ? "w-full text-black sm:w-2/5 sm:text-end"
            : "mb-1 block text-black"
            }`}
        >
          <div className="flex items-center gap-1">
            <span className={labelColor}>{label}</span>
            {require && <span className="text-red-500">*</span>}
            <span>:</span>
          </div>
        </label>
      )}

      <div className={labelPosition === "left" ? "min-w-0 flex-1" : "min-w-0 w-full"}>
        <div
          id={`${registerKey}-dropdown`}
          className="relative z-20 bg-transparent"
        >
          <select
            name={registerKey}
            {...register(registerKey, {
              required: require,
              valueAsNumber: type === "number",
            })}
            onClick={toggleDropdown}
            onChange={handleChange}
            defaultValue=""
            disabled={disabled}
            className={`relative z-20 w-full appearance-none font-default rounded-lg border text-sm h-11 px-3 pr-10 outline-none transition-all duration-200 ease-in-out bg-white text-gray-900
              ${hasError
                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 hover:border-gray-400"
              }
              disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-gray-500
            `}
          >
            <option value="" className="text-body">
              {defaultValue}
            </option>
            {options &&
              options.map((option) => (
                <option
                  key={option[valueField]}
                  value={option[valueField]}
                  className="text-body"
                >
                  {option[nameField]}
                </option>
              ))}
          </select>

          <span
            className={`absolute pointer-events-none transform transition-transform duration-300 top-1/2 right-4 z-30 -translate-y-1/2 ${isOpen ? "rotate-180" : "rotate-0"
              }`}
          >
            {/* Chevron icon */}
          </span>
        </div>

        {hasError && (
          <p className="text-red-500 text-xs font-medium mt-1.5 font-default animate-fade-in">
            {errors[registerKey].message}
          </p>
        )}
      </div>
    </div>
  );
};

export default DefaultSelect;
