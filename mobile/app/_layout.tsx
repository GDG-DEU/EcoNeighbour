import { ThemeProvider } from '@react-navigation/native';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';
import { useColorScheme, View, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'react-native-reanimated';

import { EcoNavigationTheme, EcoColors } from '@/constants/theme';
import { useAuthStore } from '@/stores/auth.store';
import { configureNotifications } from '@/services/notifications';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 dakika
    },
  },
});

configureNotifications();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading, hydrate } = useAuthStore();
  const notificationListener = useRef<Notifications.EventSubscription | undefined>(undefined);
  const responseListener = useRef<Notifications.EventSubscription | undefined>(undefined);

  useEffect(() => {
    console.log("RootLayout EcoNavigationTheme:", EcoNavigationTheme);
    hydrate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  // Bildirim deep link handler
  useEffect(() => {
    notificationListener.current = Notifications.addNotificationReceivedListener(() => {
      // Bildirim geldiğinde arka planda işlem yapılabilir
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const type = response.notification.request.content.data?.type as string | undefined;
      if (type === 'BILL_REMINDER') router.push('/bill/camera');
      else if (type === 'LEADERBOARD_RESULT') router.push('/(tabs)/leaderboard');
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  // Auth yönlendirmesi
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <View style={styles.loadingRoot}>
        <Image
          source={require('@/assets/images/logo/ecoNeighbour-transparent.png')}
          style={styles.loadingLogo}
          resizeMode="contain"
        />
        <ActivityIndicator size="small" color={EcoColors.primary} style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? EcoNavigationTheme.dark : EcoNavigationTheme.light}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen
            name="bill/camera"
            options={{ headerShown: false, presentation: 'fullScreenModal' }}
          />
          <Stack.Screen
            name="bill/review"
            options={{
              headerShown: true,
              title: 'Fatura Bilgilerini Doğrula',
            }}
          />
          <Stack.Screen
            name="bill/success"
            options={{ headerShown: false, presentation: 'fullScreenModal' }}
          />
          <Stack.Screen
            name="neighborhood/[id]"
            options={{
              headerShown: true,
              title: 'Mahalle Detayı',
            }}
          />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loadingRoot: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Splash screen genellikle beyazdır, dark mode'da SplashScreen kendisi halleder
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingLogo: {
    width: 140,
    height: 140,
  },
});
