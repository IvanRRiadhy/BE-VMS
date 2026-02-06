import { useEffect, useRef, useState } from 'react';

export function useWebSocket(url: string) {
  const wsRef = useRef<WebSocket | null>(null);

  // 🔥 QUEUE UNTUK SEMUA PESAN
  const messageQueueRef = useRef<string[]>([]);

  // hanya untuk trigger re-render
  const [, setTick] = useState(0);

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      messageQueueRef.current.push(e.data);
      setTick((t) => t + 1); // trigger consumer
    };

    ws.onerror = (err) => {
      console.error('WS error', err);
    };

    ws.onclose = () => {
      console.log('WS closed');
    };

    return () => {
      ws.close();
      wsRef.current = null;
      messageQueueRef.current = [];
    };
  }, [url]);

  return {
    ws: wsRef.current,
    messageQueueRef, // 🔥 expose queue
    send: (data: any) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(data));
      }
    },
  };
}
