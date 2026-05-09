import { router } from 'expo-router';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EcoColors, EcoSpacing, EcoBorderRadius, EcoTypography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/auth.store';
import { getMe } from '@/services/users.api';
import { getMyBills } from '@/services/bills.api';
import { AnimatedNumber, SkeletonGroup, FadeInSlide } from '@/animations';
import { getNeighborhoodStats } from '@/services/neighborhood.api';
import { CarbonSummaryCard } from '@/components/dashboard/carbon-summary-card';
import { TreesSavedBanner } from '@/components/dashboard/trees-saved-banner';
import { MonthlyComparisonChart } from '@/components/dashboard/monthly-comparison-chart';

const now = new Date();
const MONTH = now.getMonth() + 1;
const YEAR = now.getFullYear();

export default function DashboardScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard', MONTH, YEAR],
    queryFn: async () => {
      const [me, bills] = await Promise.all([
        getMe(),
        getMyBills(),
      ]);

      let neighborhoodAvg = 0;
      if (me.neighborhoodId) {
        try {
          const stats = await getNeighborhoodStats(me.neighborhoodId, MONTH, YEAR);
          neighborhoodAvg = stats.avgCo2Kg;
        } catch {}
      }

      // Bu ayın onaylı faturaları
      const thisMonthBills = bills.filter(
        (b) => b.month === MONTH && b.year === YEAR && b.isConfirmed
      );
      const totalCo2 = thisMonthBills.reduce((s, b) => s + b.co2Kg, 0);
      const totalTrees = thisMonthBills.reduce((s, b) => s + (b.treesSaved ?? 0), 0);

      // Son 6 ay grafik verisi
      const last6: { month: number; year: number; co2Kg: number; neighborhoodAvg: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(YEAR, MONTH - 1 - i);
        const m = d.getMonth() + 1;
        const y = d.getFullYear();
        const monthBills = bills.filter((b) => b.month === m && b.year === y && b.isConfirmed);
        last6.push({ month: m, year: y, co2Kg: monthBills.reduce((s, b) => s + b.co2Kg, 0), neighborhoodAvg });
      }

      return { me, totalCo2, totalTrees, neighborhoodAvg, chartData: last6 };
    },
    enabled: !!user,
  });

  const firstName = (data?.me.name ?? user?.name ?? 'Kullanıcı').split(' ')[0];

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
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Merhaba, {firstName} 👋</Text>
          <Text style={styles.subGreeting}>
            {data?.me.neighborhood?.name ?? 'Mahallenin'} karbon takibi
          </Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
        </View>
      </View>

      {/* İçerik */}
      {isLoading ? (
        <View style={styles.loadingWrap}>
          <SkeletonGroup lines={4} style={styles.skeleton} />
        </View>
      ) : data && (data.totalCo2 > 0 || data.neighborhoodAvg > 0) ? (
        <>
          <FadeInSlide direction="up" distance={20} delay={0} duration={500}>
            <CarbonSummaryCard
              co2Kg={data.totalCo2}
              neighborhoodAvgCo2={data.neighborhoodAvg}
              month={MONTH}
              year={YEAR}
            />
          </FadeInSlide>
          <FadeInSlide direction="up" distance={20} delay={100} duration={500}>
            <TreesSavedBanner
              treesSavedThisMonth={data.totalTrees}
              totalTreesSaved={data.me.totalTreesSaved}
            />
          </FadeInSlide>
          <FadeInSlide direction="up" distance={20} delay={200} duration={500}>
            <MonthlyComparisonChart data={data.chartData} />
          </FadeInSlide>
        </>
      ) : (
        <View style={styles.emptyWrap}>
          <Ionicons name="leaf-outline" size={60} color={theme.muted} />
          <Text style={styles.emptyTitle}>Henüz fatura yüklemediniz</Text>
          <Text style={styles.emptySub}>İlk faturanı yükle, karbon takibine başla!</Text>
        </View>
      )}

      {/* Fatura Yükle CTA */}
      <TouchableOpacity
        style={styles.ctaBtn}
        onPress={() => router.push('/bill/camera')}
        activeOpacity={0.85}
      >
        <Ionicons name="camera-outline" size={20} color="#fff" style={{ marginRight: EcoSpacing.sm }} />
        <Text style={styles.ctaBtnText}>Fatura Yükle</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  content: { paddingBottom: EcoSpacing.xxl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: EcoSpacing.lg,
    paddingVertical: EcoSpacing.lg,
    marginBottom: EcoSpacing.sm,
  },
  greeting: {
    fontSize: EcoTypography.sizes.xl,
    fontWeight: EcoTypography.weights.bold,
    color: theme.text,
  },
  subGreeting: {
    fontSize: EcoTypography.sizes.sm,
    color: theme.muted,
    marginTop: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: EcoBorderRadius.full,
    backgroundColor: EcoColors.alpha.primary20,
    borderWidth: 2,
    borderColor: EcoColors.alpha.primary30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: EcoTypography.sizes.md,
    fontWeight: EcoTypography.weights.bold,
    color: EcoColors.primary,
  },
  loadingWrap: {
    alignItems: 'center',
    paddingVertical: EcoSpacing.xxl,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingHorizontal: EcoSpacing.xl,
    paddingVertical: EcoSpacing.xxl,
    marginHorizontal: EcoSpacing.lg,
  },
  emptyTitle: {
    fontSize: EcoTypography.sizes.lg,
    fontWeight: EcoTypography.weights.semibold,
    color: theme.text,
    marginTop: EcoSpacing.md,
    marginBottom: EcoSpacing.sm,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: EcoTypography.sizes.sm,
    color: theme.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  ctaBtn: {
    marginHorizontal: EcoSpacing.lg,
    marginTop: EcoSpacing.md,
    height: 50,
    borderRadius: EcoBorderRadius.sm,
    backgroundColor: EcoColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtnText: {
    color: '#fff',
    fontSize: EcoTypography.sizes.md,
    fontWeight: EcoTypography.weights.bold,
  },
});
