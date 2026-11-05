import { useEffect, useState } from 'react';
import mqtt, { MqttClient } from 'mqtt';

interface MonitorActivity {
  event_id: string;
  action_type: string;
  title?: string;
  message?: string;
  timestamp?: string;
  [key: string]: any;
}

interface UseMonitorActivitiesOptions {
  host: string;
  port: number;
  username?: string;
  password?: string;
}

const MONITOR_TOPIC = 'notification/monitor/activities';

export const useMonitorActivities = ({
  host,
  port,
  username,
  password,
}: UseMonitorActivitiesOptions) => {
  const [activities, setActivities] = useState<MonitorActivity[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!host || !port) return;

    const client: MqttClient = mqtt.connect(`wss://${host}:${port}/ws`, {
      username,
      password,
      protocolVersion: 4,
      protocol: 'ws',
      reconnectPeriod: 1000,
      clean: true,
      connectTimeout: 30 * 1000,
    });

    client.on('connect', () => {
      console.log('MQTT Monitor connected');
      setConnected(true);

      client.subscribe(MONITOR_TOPIC, (error) => {
        if (error) {
          console.error('Monitor subscribe failed:', error);
          return;
        }

        console.log('Subscribed:', MONITOR_TOPIC);
      });
    });

    client.on('message', (topic, message) => {
      if (topic !== MONITOR_TOPIC) return;

      try {
        const payload: MonitorActivity = JSON.parse(message.toString());

        if (!payload) return;

        setActivities((prev) => {
          if (payload.event_id && prev.some((item) => item.event_id === payload.event_id)) {
            return prev;
          }

          return [payload, ...prev].slice(0, 100);
        });
      } catch (error) {
        console.error('Invalid monitor activity:', error);
      }
    });

    client.on('close', () => {
      setConnected(false);
    });

    client.on('offline', () => {
      setConnected(false);
    });

    client.on('error', (error) => {
      console.error('MQTT Monitor error:', error);
    });

    return () => {
      setConnected(false);
      client.end(true);
    };
  }, [host, port, username, password]);

  return {
    activities,
    connected,
  };
};
