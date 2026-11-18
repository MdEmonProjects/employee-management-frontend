import { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import { Controller, useFormContext } from "react-hook-form";
import "flatpickr/dist/flatpickr.min.css";

const parseTimeString = (timeValue) => {
  if (!timeValue) return null;
  if (timeValue instanceof Date) return timeValue;
  if (typeof timeValue === 'string') {
    const date = new Date(timeValue);
    if (!isNaN(date.getTime())) {
      return new Date(2000, 0, 1, date.getUTCHours(), date.getUTCMinutes());
    }
  }
  return null;
};

const toTimeOnly = (date) =>
  date ? new Date(2000, 0, 1, date.getHours(), date.getMinutes()) : null;

/*
 * flatpickr is driven directly (not through react-flatpickr): react-flatpickr v4
 * destroys and recreates the picker on every render, which closed the popup each
 * time the hour/minute changed. Here the instance is created once and only the
 * value is synced.
 */
const FlatpickrTimeInput = ({ id, value, onChange, onBlur, disabled, placeholder, timeFormat, className }) => {
  const inputRef = useRef(null);
  const pickerRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);
  onChangeRef.current = onChange;
  valueRef.current = value;

  const is24h = timeFormat === '24h';

  useEffect(() => {
    const picker = flatpickr(inputRef.current, {
      enableTime: true,
      noCalendar: true,
      allowInput: true,
      time_24hr: is24h,
      dateFormat: is24h ? "H:i" : "h:i K",
      minuteIncrement: 1,
      defaultHour: 0,
      defaultMinute: 0,
      onChange: (dates) => onChangeRef.current(toTimeOnly(dates[0])),
    });
    pickerRef.current = picker;
    if (valueRef.current) picker.setDate(valueRef.current, false);

    return () => {
      picker.destroy();
      pickerRef.current = null;
    };
  }, [is24h]);

  useEffect(() => {
    const picker = pickerRef.current;
    if (!picker) return;

    const next = value instanceof Date
      ? value
      : value ? picker.parseDate(value, picker.config.dateFormat) || parseTimeString(value) : null;
    const current = picker.selectedDates[0];

    if (!next) {
      if (current) picker.clear(false);
      return;
    }
    if (!current || current.getHours() !== next.getHours() || current.getMinutes() !== next.getMinutes()) {
      picker.setDate(next, false);
    }
  }, [value]);

  return (
    <input
      id={id}
      ref={inputRef}
      type="text"
      disabled={disabled}
      placeholder={placeholder}
      onBlur={onBlur}
      className={className}
    />
  );
};

const TimePicker = ({
  timeCalender,
  placeholder,
  registerKey,
  require,
  disable = false,
  defaultValue = null,
  timeFormat = '12h', // '12h' or '24h'
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const initialDate = defaultValue ? parseTimeString(defaultValue) : null;

  return (
    <div>
      {timeCalender ? (
        <label
          className="mb-1 block text-black font-bold text-sm"
          htmlFor={registerKey}
        >
          {timeCalender} :
        </label>
      ) : null}

      <Controller
        name={registerKey}
        control={control}
        defaultValue={initialDate}
        rules={{
          required: require ? require : false,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <FlatpickrTimeInput
            id={registerKey}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disable}
            placeholder={placeholder || "Select time"}
            timeFormat={timeFormat}
            className={`w-full font-default rounded-lg text-sm h-11 px-3 outline-none transition-all duration-200 ease-in-out bg-white text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 hover:border-gray-400`}
          />
        )}
      />

      {errors[registerKey] && (
        <span className="text-red-500 text-sm">
          {errors[registerKey].message}
        </span>
      )}
    </div>
  );
};

export default TimePicker;
