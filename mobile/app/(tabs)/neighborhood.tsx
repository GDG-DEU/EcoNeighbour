import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EcoColors, EcoSpacing, EcoBorderRadius, EcoTypography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/auth.store';
import { getNeighborhoodStats } from '@/services/neighborhood.api';
import { getMe } from '@/services/users.api';

const now = new Date();
const MONTH = now.getMonth() + 1;
const YEAR = now.getFullYear();

export default function NeighborhoodScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  const meQ = useQuery({ queryKey: ['me'], queryFn: getMe });
  const neighborhoodId = meQ.data?.neighborhoodId ?? user?.neighborhoodId;

  const statsQ = useQuery({
    queryKey: ['neighborhood-stats', neighborhoodId, MONTH, YEAR],
    queryFn: () => getNeighborhoodStats(neighborhoodId!, MONTH, YEAR),
    enabled: !!neighborhoodId,
  });

  const monthName = new Date(YEAR, MONTH - 1).toLocaleString('tr-TR', { month: 'long', year: 'numeric' });
  const neighborhood = meQ.data?.neighborhood;
  const stats = statsQ.data;

  return (
    <ScrollView
      style={[styles.root, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={statsQ.isRefetching}
          onRefresh={statsQ.refetch}
          tintColor={EcoColors.primary}
        />
      }
    >
      {/* Başlık */}
      <View style={styles.header}>
        <Ionicons name="location" size={24} color={EcoColors.primary} />
        <View style={styles.headerText}>
          <Text style={styles.title}>{neighborhood?.name ?? 'Mahallem'}</Text>
          <Text style={styles.subtitle}>{neighborhood?.city ?? '—'}</Text>
        </View>
      </View>

      {/* İstatistikler */}
      {statsQ.isLoading ? (
        <ActivityIndicator color={EcoColors.primary} style={{ marginTop: EcoSpacing.xxl }} />
      ) : stats ? (
        <>
          <Text style={styles.monthLabel}>{monthName} İstatistikleri</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.avgCo2Kg.toFixed(1)}</Text>
              <Text style={styles.statUnit}>kg CO₂</Text>
              <Text style={styles.statLabel}>Ortalama</Text>
            </View>
            <View style={[styles.statCard, styles.statCardGreen]}>
              <Text style={[styles.statValue, { color: EcoColors.primary }]}>
                {stats.totalTreesSaved.toFixed(0)}
              </Text>
              <Text style={styles.statUnit}>🌳 ağaç</Text>
              <Text style={styles.statLabel}>Toplam Katkı</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.activeUsers}</Text>
              <Text style={styles.statUnit}>kişi</Text>
              <Text style={styles.statLabel}>Aktif Kullanıcı</Text>
            </View>
          </View>

          {/* Detay Butonu */}
          {neighborhoodId && (
            <TouchableOpacity
              style={styles.detailBtn}
              onPress={() => router.push(`/neighborhood/${neighborhoodId}`)}
              activeOpacity={0.85}
            >
              <Text style={styles.detailBtnText}>Mahalle Detayına Git</Text>
              <Ionicons name="chevron-forward" size={16} color={EcoColors.primary} />
            </TouchableOpacity>
          )}
        </>
      ) : (
        <View style={styles.empty}>
          <Ionicons name="map-outline" size={60} color={theme.muted} />
          <Text style={styles.emptyTitle}>
            {!neighborhoodId ? 'Mahalle seçilmedi' : 'Veri bulunamadı'}
          </Text>
          <Text style={styles.emptyText}>
            {!neighborhoodId
              ? 'Profilini düzenleyerek mahalle seç.'
              : 'Bu ay için mahalle verisi henüz mevcut değil.'}
          </Text>
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
  },
  headerText: { flex: 1 },
  title: {
    fontSize: EcoTypography.sizes.xl,
    fontWeight: EcoTypography.weights.bold,
    color: theme.text,
  },
  subtitle: { fontSize: EcoTypography.sizes.sm, color: theme.muted, marginTop: 2 },
  monthLabel: {
    fontSize: EcoTypography.sizes.sm,
    fontWeight: EcoTypography.weights.semibold,
    color: theme.muted,
    textTransform: 'capitalize',
    letterSpacing: 0.5,
    paddingHorizontal: EcoSpacing.lg,
    marginBottom: EcoSpacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: EcoSpacing.lg,
    gap: EcoSpacing.sm,
    marginBottom: EcoSpacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: EcoBorderRadius.md,
    padding: EcoSpacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  statCardGreen: {
    borderColor: EcoColors.alpha.primary30,
    backgroundColor: EcoColors.alpha.primary10,
  },
  statValue: {
    fontSize: EcoTypography.sizes.xl,
    fontWeight: EcoTypography.weights.extrabold,
    color: theme.text,
  },
  statUnit: { fontSize: EcoTypography.sizes.xs, color: theme.muted, marginTop: 2 },
  statLabel: {
    fontSize: EcoTypography.sizes.xs,
    color: theme.muted,
    marginTop: EcoSpacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: EcoSpacing.lg,
    padding: EcoSpacing.md,
    backgroundColor: theme.card,
    borderRadius: EcoBorderRadius.md,
    borderWidth: 1,
    borderColor: EcoColors.alpha.primary30,
  },
  detailBtnText: {
    fontSize: EcoTypography.sizes.base,
    fontWeight: EcoTypography.weights.semibold,
    color: EcoColors.primary,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: EcoSpacing.xxl,
    paddingHorizontal: EcoSpacing.xl,
  },
  emptyTitle: {
    fontSize: EcoTypography.sizes.lg,
    fontWeight: EcoTypography.weights.semibold,
    color: theme.text,
    marginTop: EcoSpacing.md,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: EcoTypography.sizes.sm,
    color: theme.muted,
    marginTop: EcoSpacing.xs,
    textAlign: 'center',
    lineHeight: 20,
  },
});
