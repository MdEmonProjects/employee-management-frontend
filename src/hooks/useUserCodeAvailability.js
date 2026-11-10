import { useEffect, useState } from 'react';
import { useCheckUserCodeAvailabilityQuery } from '../features/user/userQuerySlice';

const USER_CODE_MAX = 2_147_483_647;

export default function useUserCodeAvailability(userCode, excludeUserID, originalUserCode) {
  const value = String(userCode ?? '').trim();
  const hasValue = value !== '';
  const isValid = /^[1-9]\d*$/.test(value) && Number(value) <= USER_CODE_MAX;
  const isUnchangedCode =
    Boolean(excludeUserID) &&
    originalUserCode != null &&
    value === String(originalUserCode);
  const [debouncedCode, setDebouncedCode] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedCode(value), 300);
    return () => clearTimeout(timer);
  }, [value]);

  const isCurrentCodeReady = !isUnchangedCode && isValid && debouncedCode === value;
  const { currentData, isFetching, isError } = useCheckUserCodeAvailabilityQuery(
    { userCode: debouncedCode, excludeUserID },
    { skip: !isCurrentCodeReady, refetchOnMountOrArgChange: true },
  );
  const available = isUnchangedCode || (isCurrentCodeReady && currentData?.available === true);
  const unavailable = !isUnchangedCode && isCurrentCodeReady && currentData?.available === false;
  const isChecking =
    hasValue && isValid && !isUnchangedCode && (!isCurrentCodeReady || isFetching);

  return {
    hasValue,
    isValid: !hasValue || isValid,
    available,
    unavailable,
    isChecking,
    isError: !isUnchangedCode && isCurrentCodeReady && isError,
    canSubmit: !hasValue || (isValid && available && !isFetching),
    message: !hasValue
      ? ''
      : !isValid
        ? 'ইউজার কোড অবশ্যই ১ থেকে ২১৪৭৪৮৩৬৪৭-এর মধ্যে পূর্ণসংখ্যা হতে হবে।'
        : isChecking
          ? 'ইউজার কোড যাচাই হচ্ছে…'
          : unavailable
            ? 'এই ইউজার কোডটি আগে থেকেই ব্যবহৃত হয়েছে।'
            : isError
              ? 'ইউজার কোড যাচাই করা যায়নি। আবার চেষ্টা করুন।'
              : available
                ? 'এই ইউজার কোডটি ব্যবহার করা যাবে।'
                : '',
  };
}
