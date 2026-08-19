import { useEffect, useRef, useState } from 'react';

type WebSocketMessage = {
  event?: string;
  data?: any;
  success?: boolean;
  message?: string;
};

type UseWebSocketOptions = {
  url?: string;
  onBarcodeScan?: (value: string) => Promise<void> | void;
  onOcrResult?: (data: any) => void;
  onPrintResult?: (result: { success?: boolean; message?: string }) => void;
  onImageStream?: (data: string) => void;
};

export const useWebSocket = ({
  url,
  onBarcodeScan,
  onOcrResult,
  onPrintResult,
  onImageStream,
}: UseWebSocketOptions) => {
  const [isOnline, setIsOnline] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);

  // Keep latest callbacks without recreating socket
  const onBarcodeScanRef = useRef(onBarcodeScan);
  const onOcrResultRef = useRef(onOcrResult);
  const onPrintResultRef = useRef(onPrintResult);
  const onImageStreamRef = useRef(onImageStream);

  useEffect(() => {
    onBarcodeScanRef.current = onBarcodeScan;
  }, [onBarcodeScan]);

  useEffect(() => {
    onOcrResultRef.current = onOcrResult;
  }, [onOcrResult]);

  useEffect(() => {
    onPrintResultRef.current = onPrintResult;
  }, [onPrintResult]);

  useEffect(() => {
    onImageStreamRef.current = onImageStream;
  }, [onImageStream]);

  useEffect(() => {
    if (!url) {
      setIsOnline(false);
      return;
    }

    const socket = new WebSocket(url);

    socketRef.current = socket;

    socket.onopen = () => {
      setIsOnline(true);
    };

    socket.onerror = (error) => {
      setIsOnline(false);
    };

    socket.onclose = () => {
    //   console.warn('🔌 WS disconnected');
      setIsOnline(false);
    };

    socket.onmessage = async (event) => {
      const raw = event.data;

      try {
        // =========================
        // IMAGE STREAM
        // =========================
        if (typeof raw === 'string' && raw.includes('|data:image')) {
          onImageStreamRef.current?.(raw);
          return;
        }

        // =========================
        // JSON EVENT
        // =========================
        const msg: WebSocketMessage = JSON.parse(raw);

        // =========================
        // BARCODE
        // =========================
        if (msg?.event === 'BARCODE_SCAN' && msg?.data) {
          const value = String(msg.data).trim();

          if (!value) return;

          await onBarcodeScanRef.current?.(value);

          return;
        }

        // =========================
        // OCR RESULT
        // =========================
        if (msg?.event === 'OCR_RESULT') {
          onOcrResultRef.current?.(msg.data);
          return;
        }

        // =========================
        // PRINT RESULT
        // =========================
        if (msg?.event === 'PRINT_RESULT') {
          onPrintResultRef.current?.({
            success: msg.success,
            message: msg.message,
          });

          return;
        }
      } catch (error) {
        console.error('⚠️ WS parse error:', error);
      }
    };

    return () => {
      socket.close();

      if (socketRef.current === socket) {
        socketRef.current = null;
      }

      setIsOnline(false);
    };
  }, [url]);

  return {
    socket: socketRef,
    isOnline,
  };
};
