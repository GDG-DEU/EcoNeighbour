import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { EcoColors, EcoSpacing, EcoBorderRadius, EcoTypography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

type Tab = 'individual' | 'neighborhood';

interface Props {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
}

export function TabSwitcher({ activeTab, onChange }: Props) {
  const theme = useTheme();
  const styles = getStyles(theme);
  return (
    <View style={styles.container}>
      {(['individual', 'neighborhood'] as const).map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.tabActive]}
          onPress={() => onChange(tab)}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
            {tab === 'individual' ? 'Bireysel' : 'Mahalle'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.card,
    borderRadius: EcoBorderRadius.full,
    padding: 4,
    marginHorizontal: EcoSpacing.lg,
    marginBottom: EcoSpacing.md,
    borderWidth: 1,
    borderColor: theme.border,
  },
  tab: {
    flex: 1,
    paddingVertical: EcoSpacing.sm,
    borderRadius: EcoBorderRadius.full,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: EcoColors.primary },
  tabText: {
    fontSize: EcoTypography.sizes.sm,
    fontWeight: EcoTypography.weights.semibold,
    color: theme.muted,
  },
  tabTextActive: { color: '#fff' },
});
