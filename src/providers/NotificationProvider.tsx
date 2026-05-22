import { useEffect } from 'react';
import mqtt from 'mqtt';

import { useDispatch, useSelector } from 'src/store/Store';
import { AppState } from 'src/store/Store';

import { addNotification } from 'src/store/apps/notifications/NotificationSlice';

const NotificationProvider = () => {
  const dispatch = useDispatch();

  const user = useSelector((state: any) => state.userReducer.data);
  // console.log('user id', user);

  useEffect(() => {
    // if (!user?.id) return;

    const client = mqtt.connect('wss://mqtt.bio-experience.com/ws', {
      username: 'admin',
      password: 'instar',
      protocolVersion: 4,
      protocol: 'wss',
      reconnectPeriod: 1000,
      clean: true,
      connectTimeout: 30 * 1000,
    });

    client.on('connect', () => {
      // console.log('✅ MQTT connected');

      let topic = '';
      if (user?.visitor_id) {
        topic = `notification/visitor/${user.visitor_id}/#`;
      } else {
        topic = `notification/employee/${user.id}/#`;
      }
      //   const topic = `notification/visitor/#`;
      // console.log('topic', topic);

      client.subscribe(topic, (err) => {
        if (err) {
          console.error('subscribe failed', err);
          return;
        }
        // console.log('📡 subscribed:', topic);
      });
    });
    client.on('message', (topic, msg) => {
      console.log('topic:', topic);
      try {
        const payload = JSON.parse(msg.toString());
        // console.log('payload:', payload);
        dispatch(
          addNotification({
            id: crypto.randomUUID(),
            ...payload,
            is_read: false,
          }),
        );
      } catch (err) {
        console.error('Invalid JSON', err);
      }
    });

    return () => {
      client.end(true);
    };
  }, [dispatch, user?.id]);

  return null;
};

export default NotificationProvider;
