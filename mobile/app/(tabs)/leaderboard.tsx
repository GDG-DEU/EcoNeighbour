import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EcoColors, EcoSpacing, EcoBorderRadius, EcoTypography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/auth.store';
import { getIndividualLeaderboard, getNeighborhoodLeaderboard } from '@/services/leaderboard.api';
import { TabSwitcher } from '@/components/leaderboard/tab-switcher';
import { LeaderboardList } from '@/components/leaderboard/leaderboard-list';

const now = new Date();
const MONTH = now.getMonth() + 1;
const YEAR = now.getFullYear();

const MEDAL = ['🥇', '🥈', '🥉'];

export default function LeaderboardScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'individual' | 'neighborhood'>('individual');

  const individualQ = useQuery({
    queryKey: ['leaderboard', 'individual', MONTH, YEAR],
    queryFn: () => getIndividualLeaderboard(MONTH, YEAR),
    enabled: activeTab === 'individual',
  });

  const neighborhoodQ = useQuery({
    queryKey: ['leaderboard', 'neighborhoods', MONTH, YEAR],
    queryFn: () => getNeighborhoodLeaderboard(MONTH, YEAR),
    enabled: activeTab === 'neighborhood',
  });

  const monthName = new Date(YEAR, MONTH - 1).toLocaleString('tr-TR', {
    month: 'long',
    year: 'numeric',
  });


  const refetch =
    activeTab === 'individual' ? individualQ.refetch : neighborhoodQ.refetch;
  const isRefetching =
    activeTab === 'individual' ? individualQ.isRefetching : neighborhoodQ.isRefetching;

  return (
    <ScrollView
      style={[styles.root, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={EcoColors.primary}
        />
      }
    >
      {/* Başlık */}
      <View style={styles.header}>
        <Ionicons name="trophy" size={24} color={EcoColors.accent} />
        <Text style={styles.title}>Sıralama</Text>
        <Text style={styles.monthBadge}>{monthName}</Text>
      </View>

      {/* Toggle */}
      <TabSwitcher activeTab={activeTab} onChange={setActiveTab} />

      {/* Liste */}
      {activeTab === 'individual' ? (
        <LeaderboardList
          data={individualQ.data ?? []}
          currentUserId={user?.id ?? ''}
          isLoading={individualQ.isLoading}
        />
      ) : (
        <View style={styles.neighborhoodList}>
          {neighborhoodQ.isLoading ? (
            <ActivityIndicator color={EcoColors.primary} style={{ marginTop: EcoSpacing.xl }} />
          ) : (neighborhoodQ.data ?? []).length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="location-outline" size={48} color={theme.muted} />
              <Text style={styles.emptyText}>Bu ay için mahalle verisi yok</Text>
            </View>
          ) : (
            (neighborhoodQ.data ?? []).map((entry) => {
              const medal = entry.rank <= 3 ? MEDAL[entry.rank - 1] : null;
              return (
                <View key={entry.neighborhood.id} style={styles.neighborhoodRow}>
                  <Text style={styles.neighborhoodRank}>
                    {medal ?? `#${entry.rank}`}
                  </Text>
                  <View style={styles.neighborhoodInfo}>
                    <Text style={styles.neighborhoodName}>{entry.neighborhood.name}</Text>
                    <Text style={styles.neighborhoodCity}>{entry.neighborhood.city}</Text>
                  </View>
                  <View style={styles.neighborhoodRight}>
                    <Text style={styles.neighborhoodCo2}>{entry.avgCo2Kg.toFixed(1)} kg</Text>
                    <Text style={styles.neighborhoodTrees}>🌳 {entry.totalTreesSaved.toFixed(0)}</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      )}
    </ScrollView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  content: { paddingBottom: EcoSpacing.xxl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: EcoSpacing.sm,
    paddingHorizontal: EcoSpacing.lg,
    paddingVertical: EcoSpacing.lg,
    marginBottom: EcoSpacing.sm,
  },
  title: {
    fontSize: EcoTypography.sizes.xl,
    fontWeight: EcoTypography.weights.bold,
    color: theme.text,
    flex: 1,
  },
  monthBadge: {
    fontSize: EcoTypography.sizes.xs,
    color: theme.muted,
    backgroundColor: theme.card,
    paddingHorizontal: EcoSpacing.sm,
    paddingVertical: 4,
    borderRadius: EcoBorderRadius.full,
    borderWidth: 1,
    borderColor: theme.border,
    textTransform: 'capitalize',
  },
  neighborhoodList: { paddingHorizontal: EcoSpacing.lg },
  neighborhoodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    borderRadius: EcoBorderRadius.md,
    padding: EcoSpacing.sm,
    marginBottom: EcoSpacing.sm,
    borderWidth: 1,
    borderColor: theme.border,
  },
  neighborhoodRank: {
    width: 36,
    fontSize: EcoTypography.sizes.md,
    fontWeight: EcoTypography.weights.bold,
    color: theme.muted,
    textAlign: 'center',
  },
  neighborhoodInfo: { flex: 1, marginLeft: EcoSpacing.sm },
  neighborhoodName: {
    fontSize: EcoTypography.sizes.sm,
    fontWeight: EcoTypography.weights.semibold,
    color: theme.text,
  },
  neighborhoodCity: { fontSize: EcoTypography.sizes.xs, color: theme.muted, marginTop: 2 },
  neighborhoodRight: { alignItems: 'flex-end' },
  neighborhoodCo2: {
    fontSize: EcoTypography.sizes.sm,
    fontWeight: EcoTypography.weights.semibold,
    color: theme.text,
  },
  neighborhoodTrees: { fontSize: EcoTypography.sizes.xs, color: EcoColors.primary, marginTop: 2 },
  empty: { alignItems: 'center', paddingVertical: EcoSpacing.xxl },
  emptyText: { color: theme.muted, marginTop: EcoSpacing.md, fontSize: EcoTypography.sizes.sm },
});
