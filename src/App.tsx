import { RouterProvider } from 'react-router-dom';

import { AppState } from './store/Store';
import router from './routes/Router';
import { CircularProgress, CssBaseline, ThemeProvider, Box, Backdrop } from '@mui/material';
import { useSelector } from 'src/store/Store';
import { ThemeSettings } from './theme/Theme';
import RTL from './layouts/full/shared/customizer/RTL';
import { requestForToken, onMessageListener } from './fcm';
import { useEffect } from 'react';
import mqtt from 'mqtt';
import { useSession } from './customs/contexts/SessionContext';
import { generateToken, messaging } from './firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { Client } from '@stomp/stompjs';
import NotificationProvider from './providers/NotificationProvider';

function App() {
  const theme = ThemeSettings();
  const customizer = useSelector((state: AppState) => state.customizer);

  // useEffect(() => {
  //   generateToken();
  // }, []);

  // useEffect(() => {
  //   const unsubscribe = onMessage(messaging, (payload) => {
  //     console.log('📩 Message received:', payload);

  //     const title = payload.notification?.title;
  //     const body = payload.notification?.body;

  //     console.log(title);
  //     console.log(body);

  //     // contoh tampilkan toast
  //     alert(`${title} - ${body}`);

  //     // data custom dari backend
  //     console.log(payload.data);
  //   });

  //   return () => unsubscribe();
  // }, []);

  // useEffect(() => {
  //   // Pastikan socket hanya dibuat sekali
  //   const socket = new WebSocket('wss://mqtt.bio-experience.com/ws');

  //   socket.onopen = () => {
  //     console.log('✅ WebSocket connected');
  //   };

  //   socket.onerror = (err) => {
  //     console.error('❌ WebSocket error:', err);
  //   };

  //   socket.onmessage = (event) => {
  //     try {
  //       // Parse JSON
  //       const msg = JSON.parse(event.data);
  //       console.log('💬 Console client:', msg);

  //       // Cek tipe data dari server
  //       if (msg?.type === 'serial' && msg?.message) {
  //         const value = msg.message.toString().trim();
  //         console.log('📩 QR Value from socket:', value);

  //       }
  //     } catch (err) {
  //       console.error('⚠️ Failed to parse WebSocket message:', event.data, err);
  //     } finally {
  //     }
  //   };

  //   socket.onclose = () => {
  //     console.warn('🔌 WebSocket disconnected');
  //   };

  //   // cleanup saat komponen unmount
  //   return () => {
  //     socket.close();
  //   };
  // }, []);

  // useEffect(() => {
  //   const client = mqtt.connect('wss://mqtt.bio-experience.com/ws', {
  //     username: 'admin',
  //     password: 'instar',
  //     protocolVersion: 4,
  //     protocol: 'wss',
  //     reconnectPeriod: 1000,
  //     clean: true,
  //     connectTimeout: 30 * 1000,
  //   });
  //   client.on('connect', () => {
  //     console.log('✅ connected');
  //     client.subscribe('notification/visitor/#', (err, granted) => {
  //       console.log('subscribe err:', err);
  //       console.log('granted:', granted);
  //     });
  //   });
  //   client.on('reconnect', () => {
  //     console.log('🔄 reconnecting...');
  //   });
  //   client.on('close', () => {
  //     console.log('❌ connection closed');
  //   });
  //   client.on('offline', () => {
  //     console.log('📴 offline');
  //   });
  //   client.on('error', (err) => {
  //     console.log('🚨 error', err);
  //   });
  //   client.on('message', (topic, msg) => {
  //     console.log('topic:', topic);
  //     console.log('payload:', msg.toString());
  //     try {
  //       const payload = JSON.parse(msg.toString());
  //       console.log('topic:', topic);
  //       console.log('payload:', payload);
  //     } catch (err) {
  //       console.error('Invalid JSON', err);
  //     }
  //   });
  //   return () => {
  //     client.end();
  //   };
  // }, []);

  // useEffect(() => {
  //   const client = new Client({
  //     brokerURL: 'ws://localhost:15674/ws',

  //     connectHeaders: {
  //       login: 'guest',
  //       passcode: 'guest',
  //     },

  //     reconnectDelay: 5000,
  //     heartbeatIncoming: 4000,
  //     heartbeatOutgoing: 4000,

  //     onConnect: () => {
  //       console.log('✅ Connected');

  //       // subscribe queue/topic
  //       client.subscribe('/queue/test', (message) => {
  //         console.log('📩', message.body);
  //       });

  //       // kirim message
  //       client.publish({
  //         destination: '/queue/test',
  //         body: 'Hello RabbitMQ',
  //       });
  //     },

  //     onStompError: (frame) => {
  //       console.error('❌ Broker error', frame);
  //     },

  //     onWebSocketClose: () => {
  //       console.log('🔌 websocket closed');
  //     },

  //     onWebSocketError: (err) => {
  //       console.log('🚨 websocket error', err);
  //     },
  //   });

  //   client.activate();

  //   return () => {
  //     client.deactivate();
  //   };
  // }, []);

  // useEffect(() => {
  //   const client = new Client({
  //     brokerURL: 'wss://mqtt.bio-experience.com/ws',

  //     connectHeaders: {
  //       login: 'admin',
  //       passcode: 'instar',
  //     },

  //     reconnectDelay: 5000,

  //     onConnect: () => {
  //       console.log('✅ connected');

  //       client.subscribe('/topic/notification/visitor', (message) => {
  //         console.log('MESSAGE:', message.body);
  //       });
  //     },

  //     onStompError: (frame) => {
  //       console.error('Broker error:', frame);
  //     },

  //     onWebSocketError: (err) => {
  //       console.error('WebSocket error:', err);
  //     },
  //   });

  //   client.activate();

  //   return () => {
  //     client.deactivate();
  //   };
  // }, []);

  return (
    <ThemeProvider theme={theme}>
      <RTL direction={customizer.activeDir}>
        <CssBaseline />
        <NotificationProvider />
        <RouterProvider router={router} />
      </RTL>
    </ThemeProvider>
  );
}

export default App;
