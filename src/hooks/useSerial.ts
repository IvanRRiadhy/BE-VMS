import { useCallback, useEffect, useRef, useState } from 'react';
declare global {
  interface Navigator {
    serial: any;
  }
}
type SerialOptions = {
  baudRate?: number;
  dataBits?: number;
  stopBits?: number;
  parity?: 'none' | 'even' | 'odd';
  flowControl?: 'none' | 'hardware';
};
type UseSerialRS232Props = {
  options?: SerialOptions;
  onData?: (data: string) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
};
export function useSerialRS232({
  options,
  onData,
  onConnect,
  onDisconnect,
  onError,
}: UseSerialRS232Props = {}) {
  const portRef = useRef<any>(null);
  const readerRef = useRef<any>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const connect = useCallback(async () => {
    try {
      setLoading(true);
      const port = await navigator.serial.requestPort();
      await port.open({
        baudRate: options?.baudRate || 9600,
        dataBits: options?.dataBits || 8,
        stopBits: options?.stopBits || 1,
        parity: options?.parity || 'none',
        flowControl: options?.flowControl || 'none',
      });
      portRef.current = port;
      setConnected(true);
      onConnect?.();
      startReading();
    } catch (err) {
      console.error('SERIAL CONNECT ERROR', err);
      onError?.(err);
    } finally {
      setLoading(false);
    }
  }, [options]);
  //   const startReading = async () => {
  //     const port = portRef.current;
  //     if (!port?.readable) return;
  //     const reader = port.readable.getReader();
  //     readerRef.current = reader;
  //     const decoder = new TextDecoder();
  //     try {
  //       while (true) {
  //         const { value, done } = await reader.read();
  //         if (done) {
  //           break;
  //         }
  //         if (value) {
  //           const text = decoder.decode(value);
  //           onData?.(text);
  //         }
  //       }
  //     } catch (err) {
  //       console.error('SERIAL READ ERROR', err);
  //       onError?.(err);
  //     } finally {
  //       reader.releaseLock();
  //     }
  //   };
  const startReading = async () => {
    const port = portRef.current;

    if (!port?.readable) return;

    const reader = port.readable.getReader();

    readerRef.current = reader;

    const decoder = new TextDecoder();

    let serialBuffer = '';

    try {
      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          break;
        }

        if (value) {
          const text = decoder.decode(value);

          serialBuffer += text;

          if (serialBuffer.includes('\r') || serialBuffer.includes('\n')) {
            const finalText = serialBuffer
              .replace(/[\r\n]+/g, '')
              .replace(/[^\x20-\x7E]/g, '')
              .trim();

            serialBuffer = '';

            if (finalText) {
              onData?.(finalText);
            }
          }
        }
      }
    } catch (err) {
      console.error('SERIAL READ ERROR', err);

      onError?.(err);
    } finally {
      reader.releaseLock();
    }
  };
  const disconnect = useCallback(async () => {
    try {
      if (readerRef.current) {
        await readerRef.current.cancel();
        readerRef.current.releaseLock();
      }
      if (portRef.current) {
        await portRef.current.close();
      }
      setConnected(false);
      onDisconnect?.();
    } catch (err) {
      console.error(err);
      onError?.(err);
    }
  }, []);
  const send = useCallback(async (message: string) => {
    try {
      const port = portRef.current;
      if (!port?.writable) return;
      const writer = port.writable.getWriter();
      const encoder = new TextEncoder();
      await writer.write(encoder.encode(message));
      writer.releaseLock();
    } catch (err) {
      console.error(err);
      onError?.(err);
    }
  }, []);
  useEffect(() => {
    const handleDisconnect = () => {
      setConnected(false);
      onDisconnect?.();
    };
    navigator.serial?.addEventListener?.('disconnect', handleDisconnect);
    return () => {
      navigator.serial?.removeEventListener?.('disconnect', handleDisconnect);
    };
  }, []);
  return { connect, disconnect, send, connected, loading };
}
