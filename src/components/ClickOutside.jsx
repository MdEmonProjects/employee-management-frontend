import React, { useRef, useEffect } from 'react';

const ClickOutside = ({ children, onClick, className, }) => {
  const wrapperRef = useRef(null);
  const excludeClasses = [
    "flatpickr-calendar",
    "Toastify"
  ]
  useEffect(() => {
    const handleClickListener = (event) => {
      let clickedInside = false;

      // Check if the click is inside the wrapper
      if (wrapperRef.current && wrapperRef.current.contains(event.target)) {
        clickedInside = true;
      } else {
        // Check if the click is inside any element with the excluded classes
        clickedInside = excludeClasses.some((className) => {
          return event.target.closest(`.${className}`) !== null;
        });
      }

      // If the click is outside, trigger the onClick handler
      if (!clickedInside) {
        onClick();
      }
    };

    document.addEventListener('mousedown', handleClickListener);

    return () => {
      document.removeEventListener('mousedown', handleClickListener);
    };
  }, [excludeClasses, onClick]);

  return (
    <div ref={wrapperRef} className={`${className || ''}`}>
      {children}
    </div>
  );
};

export default ClickOutside;
