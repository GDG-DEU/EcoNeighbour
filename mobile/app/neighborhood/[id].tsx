import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EcoColors, EcoSpacing, EcoBorderRadius, EcoTypography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { getNeighborhoodStats } from '@/services/neighborhood.api';

const now = new Date();

function getLast6Months(): { month: number; year: number }[] {
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i);
    return { month: d.getMonth() + 1, year: d.getFullYear() };
  }).reverse();
}

function MonthRow({ id, month, year }: { id: string; month: number; year: number }) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { data } = useQuery({
    queryKey: ['neighborhood-stats', id, month, year],
    queryFn: () => getNeighborhoodStats(id, month, year),
    enabled: !!id,
  });
  const label = new Date(year, month - 1).toLocaleString('tr-TR', { month: 'long', year: 'numeric' });
  return (
    <View style={styles.monthRow}>
      <Text style={styles.monthLabel}>{label}</Text>
      <Text style={styles.monthValue}>{data ? `${data.avgCo2Kg.toFixed(1)} kg` : '—'}</Text>
      <Text style={styles.monthTrees}>{data ? `🌳 ${data.totalTreesSaved.toFixed(0)}` : ''}</Text>
    </View>
  );
}

export default function NeighborhoodDetailScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const currentQ = useQuery({
    queryKey: ['neighborhood-stats', id, now.getMonth() + 1, now.getFullYear()],
    queryFn: () => getNeighborhoodStats(id, now.getMonth() + 1, now.getFullYear()),
    enabled: !!id,
  });

  return (
    <ScrollView
      style={[styles.root, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {currentQ.isLoading ? (
        <ActivityIndicator color={EcoColors.primary} style={{ marginTop: EcoSpacing.xxl }} />
      ) : currentQ.data ? (
        <>
          <Text style={styles.sectionTitle}>Bu Ay</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{currentQ.data.avgCo2Kg.toFixed(1)}</Text>
              <Text style={styles.statLabel}>kg CO₂ Ort.</Text>
            </View>
            <View style={[styles.statCard, styles.statCardGreen]}>
              <Text style={[styles.statValue, { color: EcoColors.primary }]}>
                {currentQ.data.totalTreesSaved.toFixed(0)}
              </Text>
              <Text style={styles.statLabel}>🌳 Toplam Ağaç</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{currentQ.data.activeUsers}</Text>
              <Text style={styles.statLabel}>Aktif Üye</Text>
            </View>
          </View>

          <Text style={[styles.sectionTitle, { marginTop: EcoSpacing.lg }]}>Son 6 Ay Geçmişi</Text>
          {getLast6Months().map(({ month, year }) => (
            <MonthRow key={`${year}-${month}`} id={id} month={month} year={year} />
          ))}
        </>
      ) : (
        <View style={styles.empty}>
          <Ionicons name="information-circle-outline" size={48} color={theme.muted} />
          <Text style={styles.emptyText}>Veri bulunamadı</Text>
        </View>
      )}
    </ScrollView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  content: { padding: EcoSpacing.lg, paddingBottom: EcoSpacing.xxl },
  sectionTitle: {
    fontSize: EcoTypography.sizes.md,
    fontWeight: EcoTypography.weights.bold,
    color: theme.text,
    marginBottom: EcoSpacing.sm,
  },
  statsRow: { flexDirection: 'row', gap: EcoSpacing.sm, marginBottom: EcoSpacing.md },
  statCard: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: EcoBorderRadius.md,
    padding: EcoSpacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  statCardGreen: { borderColor: EcoColors.alpha.primary30, backgroundColor: EcoColors.alpha.primary10 },
  statValue: {
    fontSize: EcoTypography.sizes.xl,
    fontWeight: EcoTypography.weights.extrabold,
    color: theme.text,
  },
  statLabel: { fontSize: EcoTypography.sizes.xs, color: theme.muted, marginTop: 4, textAlign: 'center' },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    borderRadius: EcoBorderRadius.sm,
    padding: EcoSpacing.sm,
    marginBottom: EcoSpacing.sm,
    borderWidth: 1,
    borderColor: theme.border,
  },
  monthLabel: { flex: 1, fontSize: EcoTypography.sizes.sm, color: theme.text, textTransform: 'capitalize' },
  monthValue: { fontSize: EcoTypography.sizes.sm, fontWeight: EcoTypography.weights.semibold, color: theme.text, marginRight: EcoSpacing.md },
  monthTrees: { fontSize: EcoTypography.sizes.xs, color: EcoColors.primary },
  empty: { alignItems: 'center', paddingVertical: EcoSpacing.xxl },
  emptyText: { color: theme.muted, marginTop: EcoSpacing.md },
});
