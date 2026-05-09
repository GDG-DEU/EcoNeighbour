import { Tabs, router } from 'expo-router';
import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EcoColors, EcoBorderRadius, EcoShadow } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

// Merkez FAB butonu bileşeni
function CenterFABButton({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const insets = useSafeAreaInsets();
  return (
    <TouchableOpacity
      style={[styles.fabContainer, { marginBottom: insets.bottom > 0 ? 4 : 8 }]}
      onPress={() => router.push('/bill/camera')}
      activeOpacity={0.85}
    >
      <View style={styles.fabInner}>
        <Ionicons name="add" size={28} color="#fff" />
      </View>
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  const theme = useTheme();
  const styles = getStyles(theme);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: EcoColors.primary,
        tabBarInactiveTintColor: theme.muted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarBackground: () => <View style={styles.tabBarBg} />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Sıralama',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy" size={size} color={color} />
          ),
        }}
      />
      {/* Merkez FAB — gerçek bir sekme değil */}
      <Tabs.Screen
        name="__fab__"
        options={{
          title: '',
          tabBarButton: (props) => <CenterFABButton {...props} />,
        }}
        listeners={{ tabPress: (e) => e.preventDefault() }}
      />
      <Tabs.Screen
        name="neighborhood"
        options={{
          title: 'Mahalle',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="location" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  tabBar: {
    backgroundColor: theme.surface,
    borderTopColor: theme.border,
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 4,
    paddingTop: 6,
  },
  tabBarBg: {
    flex: 1,
    backgroundColor: theme.surface,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  fabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    top: -16,
  },
  fabInner: {
    width: 58,
    height: 58,
    borderRadius: EcoBorderRadius.full,
    backgroundColor: EcoColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...EcoShadow.fab,
    shadowColor: EcoColors.primary,
  },
});
