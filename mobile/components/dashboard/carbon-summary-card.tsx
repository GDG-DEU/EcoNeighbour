import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EcoColors, EcoSpacing, EcoBorderRadius, EcoTypography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  co2Kg: number;
  neighborhoodAvgCo2: number;
  month: number;
  year: number;
}

export function CarbonSummaryCard({ co2Kg, neighborhoodAvgCo2, month, year }: Props) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const diff = neighborhoodAvgCo2 - co2Kg;
  const isGood = diff >= 0;
  const monthName = new Date(year, month - 1).toLocaleString('tr-TR', { month: 'long' });

  return (
    <View style={styles.card}>
      {/* Başlık */}
      <View style={styles.header}>
        <Text style={styles.monthLabel}>{monthName} {year}</Text>
        <View style={[styles.badge, isGood ? styles.badgeGood : styles.badgeBad]}>
          <Ionicons
            name={isGood ? 'trending-down' : 'trending-up'}
            size={12}
            color={isGood ? EcoColors.primary : EcoColors.danger}
          />
          <Text style={[styles.badgeText, isGood ? styles.badgeTextGood : styles.badgeTextBad]}>
            {isGood ? 'İyi' : 'Yüksek'}
          </Text>
        </View>
      </View>

      {/* Ana değer */}
      <View style={styles.mainRow}>
        <Text style={styles.co2Value}>{co2Kg.toFixed(1)}</Text>
        <Text style={styles.co2Unit}>kg CO₂</Text>
      </View>

      {/* Karşılaştırma */}
      <View style={styles.divider} />
      <View style={styles.compareRow}>
        <View style={styles.compareItem}>
          <Text style={styles.compareLabel}>Mahalle Ort.</Text>
          <Text style={styles.compareValue}>{neighborhoodAvgCo2.toFixed(1)} kg</Text>
        </View>
        <View style={styles.compareSep} />
        <View style={styles.compareItem}>
          <Text style={styles.compareLabel}>Fark</Text>
          <Text style={[styles.compareValue, isGood ? styles.compareValueGood : styles.compareValueBad]}>
            {isGood ? '-' : '+'}{Math.abs(diff).toFixed(1)} kg
          </Text>
        </View>
      </View>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  card: {
    backgroundColor: theme.card,
    borderRadius: EcoBorderRadius.lg,
    padding: EcoSpacing.lg,
    borderWidth: 1,
    borderColor: theme.border,
    marginHorizontal: EcoSpacing.lg,
    marginBottom: EcoSpacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: EcoSpacing.md,
  },
  monthLabel: {
    fontSize: EcoTypography.sizes.sm,
    color: theme.muted,
    fontWeight: EcoTypography.weights.medium,
    textTransform: 'capitalize',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: EcoSpacing.sm,
    paddingVertical: 3,
    borderRadius: EcoBorderRadius.full,
  },
  badgeGood: { backgroundColor: EcoColors.alpha.primary15 },
  badgeBad: { backgroundColor: EcoColors.alpha.danger10 },
  badgeText: { fontSize: EcoTypography.sizes.xs, fontWeight: EcoTypography.weights.semibold },
  badgeTextGood: { color: EcoColors.primary },
  badgeTextBad: { color: EcoColors.danger },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: EcoSpacing.sm,
    marginBottom: EcoSpacing.md,
  },
  co2Value: {
    fontSize: EcoTypography.sizes.xxxl,
    fontWeight: EcoTypography.weights.extrabold,
    color: theme.text,
    letterSpacing: -1,
  },
  co2Unit: {
    fontSize: EcoTypography.sizes.lg,
    color: theme.muted,
    marginBottom: 6,
  },
  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginBottom: EcoSpacing.md,
  },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compareItem: { flex: 1, alignItems: 'center' },
  compareSep: {
    width: 1,
    height: 32,
    backgroundColor: theme.border,
    marginHorizontal: EcoSpacing.md,
  },
  compareLabel: {
    fontSize: EcoTypography.sizes.xs,
    color: theme.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  compareValue: {
    fontSize: EcoTypography.sizes.md,
    fontWeight: EcoTypography.weights.bold,
    color: theme.text,
  },
  compareValueGood: { color: EcoColors.primary },
  compareValueBad: { color: EcoColors.danger },
});
