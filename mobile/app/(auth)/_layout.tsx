import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

export default function AuthLayout() {
  const theme = useTheme();
  const styles = getStyles(theme);
  return (
    <View style={styles.container}>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
});
