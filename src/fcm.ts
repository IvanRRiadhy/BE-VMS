import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from './firebase';

export const requestForToken = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return;
    }

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });

    // console.log('FCM TOKEN:', token);

    return token;
  } catch (error) {
    console.log(error);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });


