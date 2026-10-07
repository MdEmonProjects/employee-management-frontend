import Flatpickr from "react-flatpickr";
import { Controller, useFormContext } from "react-hook-form";
import "flatpickr/dist/flatpickr.min.css";

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
  const parseTimeString = (timeValue) => {
    if (!timeValue) return null;
    if (typeof timeValue === 'string') {
      const date = new Date(timeValue);
      if (!isNaN(date.getTime())) {
        const hours = date.getUTCHours();
        const minutes = date.getUTCMinutes();
        return new Date(2000, 0, 1, hours, minutes);
      }
    }

    return timeValue instanceof Date ? timeValue : null;
  };



  const initialDate = defaultValue ? parseTimeString(defaultValue) : null;
  const getDateFormat = () => {
    return timeFormat === '24h' ? "H:i" : "h:i K";
  };

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
        render={({ field: { onChange, value } }) => (
          <Flatpickr
            disabled={disable}
            placeholder={placeholder || "Select time"}
            value={value}
            onChange={(dates) => {
              const selectedDate = dates[0];
              if (selectedDate) {
                const hours = selectedDate.getHours();
                const minutes = selectedDate.getMinutes();
                const timeOnly = new Date(2000, 0, 1, hours, minutes);
                onChange(timeOnly);
              } else {
                onChange(null);
              }
            }}
            options={{
              enableTime: true,
              noCalendar: true,
              time_24hr: timeFormat === '24h',
              dateFormat: getDateFormat(),
              minuteIncrement: 1,
              defaultHour: 0,
              defaultMinute: 0,
              formatDate: (date) => {
                if (!date) return '';
                const hours = date.getHours();
                const minutes = String(date.getMinutes()).padStart(2, '0');

                if (timeFormat === '24h') {
                  const h = String(hours).padStart(2, '0');
                  return `${h}:${minutes}`;
                } else {
                  const h = hours % 12 || 12;
                  const ampm = hours >= 12 ? 'PM' : 'AM';
                  return `${h}:${minutes} ${ampm}`;
                }
              }
            }}
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