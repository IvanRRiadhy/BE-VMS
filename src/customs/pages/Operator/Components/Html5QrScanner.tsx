import { Html5Qrcode } from 'html5-qrcode';
import { useEffect, useRef } from 'react';

type Html5QrScannerProps = {
  active: boolean;
  facingMode: 'user' | 'environment';
  onScan: (value: string) => Promise<void>;
  onError?: (err: any) => void;
};

export const Html5QrScanner = ({ active, facingMode, onScan, onError }: Html5QrScannerProps) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const qrInstance = useRef<Html5Qrcode | null>(null);
  const scanning = useRef(false);

  useEffect(() => {
    if (!active || !qrRef.current) return;

    const id = 'html5-qr-reader';
    qrRef.current.id = id;

    const qr = new Html5Qrcode(id);
    qrInstance.current = qr;

    qr.start(
      { facingMode },
      {
        fps: 10,
        qrbox: { width: 300, height: 280 },
        disableFlip: true,
      },
      async (decodedText) => {
        if (scanning.current) return;
        scanning.current = true;

        try {
          console.log('✅ QR VALUE:', decodedText);
          await onScan(decodedText);
          
        } catch (e) {
        //   scanning.current = false;
          onError?.(e);
        }finally{
          scanning.current = false;
        }
      },
      () => {
        // ignore scan errors (blur / noise)
      },
    );

    return () => {
      scanning.current = false;
      qr.stop()
        .then(() => qr.clear())
        .catch(() => {});
    };
  }, [active, facingMode]);

  return (
    <div
      ref={qrRef}
      style={{
        width: '100%',
        height: '100%',
        // background: 'black',
      }}
    />
  );
};
