import { useEffect } from 'react';
import mqtt from 'mqtt';

import { useDispatch, useSelector } from 'src/store/Store';
import { addNotification } from 'src/store/apps/notifications/NotificationSlice';
import { getConfig } from 'src/config';

const RECONNECT_INTERVAL = 30000;
const ERROR_LOG_INTERVAL = 30000;

const NotificationProvider = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.userReducer.data);

  const config = getConfig();

  useEffect(() => {
    if (!user?.id && !user?.visitor_id) return;

    if (!config?.WS_MONITOR || !config?.WS_MONITOR_PORT) return;

    const brokerUrl = `wss://${config.WS_MONITOR}:${config.WS_MONITOR_PORT}/ws`;

    let lastErrorLog = 0;

    const client = mqtt.connect(brokerUrl, {
      username: 'user',
      password: 'root',
      protocolVersion: 4,
      reconnectPeriod: RECONNECT_INTERVAL,
      clean: true,
      connectTimeout: 10000,
    });

    const topic = user.visitor_id
      ? `notification/visitor/${user.visitor_id}/#`
      : `notification/employee/${user.id}/#`;

    client.on('connect', () => {
      console.log('MQTT connected');

      client.subscribe(topic, (err) => {
        if (err) {
          console.error('MQTT subscribe failed:', err.message);
          return;
        }

        console.log('MQTT subscribed:', topic);
      });
    });

    client.on('message', (_, msg) => {
      try {
        const payload = JSON.parse(msg.toString());

        dispatch(
          addNotification({
            ...payload,
            id: crypto.randomUUID(),
            is_read: false,
          }),
        );
      } catch (err) {
        console.error('Invalid MQTT JSON:', err);
      }
    });

    client.on('error', (err) => {
      const now = Date.now();

      if (now - lastErrorLog >= ERROR_LOG_INTERVAL) {
        console.warn('MQTT connection error:', err.message);
        lastErrorLog = now;
      }
    });

    client.on('offline', () => {
      console.warn('MQTT offline');
    });

    client.on('reconnect', () => {
      console.log('MQTT reconnecting...');
    });

    return () => {
      client.end(true);
    };
  }, [dispatch, user?.id, user?.visitor_id]);

  return null;
};

export default NotificationProvider;
