import { useEffect, useRef, useState } from 'react';

type UseUnsavedFormOptions<T> = {
  key: string;
  initialValue: T;
  debounceMs?: number;
};

export function useUnsavedForm<T>({
  key,
  initialValue,
  debounceMs = 500,
}: UseUnsavedFormOptions<T>) {
  const [formData, setFormData] = useState<T>(() => {
    try {
      const saved = sessionStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const [isDirty, setIsDirty] = useState(false);
  const initialRef = useRef(initialValue);

  // detect dirty (compare dengan initial)
  useEffect(() => {
    const isChanged = JSON.stringify(formData) !== JSON.stringify(initialRef.current);
    setIsDirty(isChanged);
  }, [formData]);

  // auto save ke sessionStorage (debounce)
  useEffect(() => {
    if (!isDirty) return;

    const timeout = setTimeout(() => {
      sessionStorage.setItem(key, JSON.stringify(formData));
    }, debounceMs);

    return () => clearTimeout(timeout);
  }, [formData, isDirty, key, debounceMs]);

  // clear storage
  const clear = () => {
    sessionStorage.removeItem(key);
    setIsDirty(false);
    initialRef.current = initialValue;
  };

  // reset form ke initial
  const reset = () => {
    setFormData(initialValue);
    clear();
  };

  return {
    formData,
    setFormData,
    isDirty,
    clear,
    reset,
  };
}
