import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { savePushToken } from './users.api';

// Bildirim handler konfigürasyonu (app/_layout'ta çağrılmalı)
export function configureNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowList: true,
    }),
  });
}

export async function registerForPushNotifications(): Promise<string | null> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return null;

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

    if (!projectId) {
      console.warn('[Notifications] EAS projectId bulunamadı');
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    await savePushToken(token);
    return token;
  } catch (error) {
    console.error('[Notifications] Token alınamadı:', error);
    return null;
  }
}
