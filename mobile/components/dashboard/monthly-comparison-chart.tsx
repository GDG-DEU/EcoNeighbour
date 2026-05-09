import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { EcoColors, EcoSpacing, EcoBorderRadius, EcoTypography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface MonthData {
  month: number;
  year: number;
  co2Kg: number;
  neighborhoodAvg: number;
}

interface Props {
  data: MonthData[];
}

const { width } = Dimensions.get('window');

export function MonthlyComparisonChart({ data }: Props) {
  const theme = useTheme();
  const styles = getStyles(theme);
  if (!data || data.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Son 6 Ay Karşılaştırması</Text>
        <Text style={styles.empty}>Henüz yeterli veri yok</Text>
      </View>
    );
  }

  const barData = data.flatMap((d) => [
    {
      value: d.co2Kg,
      label: new Date(d.year, d.month - 1).toLocaleString('tr-TR', { month: 'short' }),
      frontColor: EcoColors.primary,
      topLabelComponent: (): null => null,
    },
    {
      value: d.neighborhoodAvg,
      frontColor: EcoColors.alpha.white10,
      topLabelComponent: (): null => null,
    },
  ]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Son 6 Ay</Text>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: EcoColors.primary }]} />
            <Text style={styles.legendText}>Sen</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.border }]} />
            <Text style={styles.legendText}>Mahalle Ort.</Text>
          </View>
        </View>
      </View>

      <BarChart
        data={barData}
        barWidth={14}
        spacing={6}
        roundedTop
        hideRules
        xAxisThickness={1}
        yAxisThickness={0}
        xAxisColor={theme.border}
        yAxisTextStyle={{ color: theme.muted, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: theme.muted, fontSize: 10 }}
        noOfSections={4}
        maxValue={Math.max(...data.map((d) => Math.max(d.co2Kg, d.neighborhoodAvg))) * 1.2}
        width={width - EcoSpacing.lg * 2 - EcoSpacing.md * 2 - 40}
        height={120}
        barBorderRadius={4}
        backgroundColor="transparent"
        isAnimated
      />
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  card: {
    backgroundColor: theme.card,
    borderRadius: EcoBorderRadius.lg,
    padding: EcoSpacing.md,
    marginHorizontal: EcoSpacing.lg,
    marginBottom: EcoSpacing.md,
    borderWidth: 1,
    borderColor: theme.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: EcoSpacing.md,
  },
  title: {
    fontSize: EcoTypography.sizes.base,
    fontWeight: EcoTypography.weights.semibold,
    color: theme.text,
  },
  legend: { flexDirection: 'row', gap: EcoSpacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: EcoTypography.sizes.xs, color: theme.muted },
  empty: {
    color: theme.muted,
    textAlign: 'center',
    paddingVertical: EcoSpacing.xl,
    fontSize: EcoTypography.sizes.sm,
  },
});
