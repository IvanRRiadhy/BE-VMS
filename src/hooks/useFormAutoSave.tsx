import { useEffect } from 'react';

type Props = {
  watch: any;
  reset: any;
  storageKey: string;
  onDirtyChange?: (dirty: boolean) => void;
};

export const useFormAutoSave = ({ watch, reset, storageKey, onDirtyChange }: Props) => {
  // save + detect dirty
  useEffect(() => {
    const subscription = watch((value: any) => {
      const isDirty = !!value.name || !!value.code || !!value.host;

      onDirtyChange?.(isDirty);

      localStorage.setItem(storageKey, JSON.stringify(value));
    });

    return () => subscription.unsubscribe();
  }, [watch, onDirtyChange, storageKey]);

  // detect existing draft
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const hasValue = parsed?.name || parsed?.code || parsed?.host;

        if (hasValue) {
          onDirtyChange?.(true);
        }
      } catch {}
    }
  }, [onDirtyChange, storageKey]);

  // restore form
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        reset(parsed);
      } catch {
        console.error('Failed parse localStorage');
      }
    }
  }, [reset, storageKey]);
};
