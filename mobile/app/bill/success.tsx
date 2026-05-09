import { router, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  useAnimatedValue,
} from 'react-native';
import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EcoColors, EcoSpacing, EcoBorderRadius, EcoTypography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

export default function SuccessScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);
  const params = useLocalSearchParams<{
    co2Kg: string;
    treesSaved: string;
    billType: string;
    usage: string;
    usageUnit: string;
  }>();
  const insets = useSafeAreaInsets();

  const co2Kg = parseFloat(params.co2Kg ?? '0');
  const treesSaved = parseFloat(params.treesSaved ?? '0');
  const isPositive = treesSaved > 0;

  // Giriş animasyonları
  const scaleAnim = useAnimatedValue(0.5);
  const fadeAnim = useAnimatedValue(0);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, fadeAnim]);

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Arka plan süsleme */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        {/* Ana ikon */}
        <View style={[styles.iconWrap, !isPositive && styles.iconWrapNeutral]}>
          <Text style={styles.iconEmoji}>{isPositive ? '🌳' : '⚡'}</Text>
        </View>

        {/* Başlık */}
        <Text style={styles.headline}>
          {isPositive
            ? `${treesSaved.toFixed(1)} ağaç kurtardın!`
            : 'Fatura kaydedildi!'}
        </Text>
        <Text style={styles.subheadline}>
          {isPositive
            ? 'Harika! Bu ay mahallenin ortalamasının altındasın.'
            : 'Gelecek ay daha iyi yapabilirsin!'}
        </Text>

        {/* İstatistik Kartları */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{co2Kg.toFixed(1)}</Text>
            <Text style={styles.statUnit}>kg CO₂</Text>
            <Text style={styles.statLabel}>Bu ay</Text>
          </View>

          <View style={[styles.statCard, isPositive ? styles.statCardPositive : styles.statCardNeutral]}>
            <Text style={[styles.statValue, isPositive && { color: EcoColors.primary }]}>
              {isPositive ? `+${treesSaved.toFixed(1)}` : treesSaved.toFixed(1)}
            </Text>
            <Text style={styles.statUnit}>🌳 ağaç</Text>
            <Text style={styles.statLabel}>{isPositive ? 'Tasarruf' : 'Fark'}</Text>
          </View>
        </View>

        {/* Tüketim detayı */}
        <View style={styles.detailRow}>
          <Ionicons
            name={params.billType === 'ELECTRICITY' ? 'flash' : 'flame'}
            size={16}
            color={theme.muted}
          />
          <Text style={styles.detailText}>
            {params.usage} {params.usageUnit} tüketim kaydedildi
          </Text>
        </View>
      </Animated.View>

      {/* Buton */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.85}
        >
          <Ionicons name="home" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.homeBtnText}>Ana Sayfaya Dön</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.bg,
    justifyContent: 'space-between',
  },
  bgCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: EcoColors.alpha.primary10,
    top: -80,
    right: -80,
  },
  bgCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: EcoColors.alpha.primary10,
    bottom: 120,
    left: -60,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: EcoSpacing.xl,
  },
  iconWrap: {
    width: 100,
    height: 100,
    borderRadius: EcoBorderRadius.full,
    backgroundColor: EcoColors.alpha.primary15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: EcoColors.alpha.primary30,
    marginBottom: EcoSpacing.lg,
  },
  iconWrapNeutral: {
    backgroundColor: EcoColors.alpha.accent10,
    borderColor: EcoColors.alpha.accent20,
  },
  iconEmoji: { fontSize: 48 },
  headline: {
    fontSize: EcoTypography.sizes.xxl,
    fontWeight: EcoTypography.weights.extrabold,
    color: theme.text,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: EcoSpacing.sm,
  },
  subheadline: {
    fontSize: EcoTypography.sizes.base,
    color: theme.muted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: EcoSpacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: EcoSpacing.md,
    marginBottom: EcoSpacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: EcoBorderRadius.md,
    padding: EcoSpacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  statCardPositive: {
    borderColor: EcoColors.alpha.primary30,
    backgroundColor: EcoColors.alpha.primary10,
  },
  statCardNeutral: {
    borderColor: EcoColors.alpha.accent20,
    backgroundColor: EcoColors.alpha.accent10,
  },
  statValue: {
    fontSize: EcoTypography.sizes.xxl,
    fontWeight: EcoTypography.weights.extrabold,
    color: theme.text,
  },
  statUnit: {
    fontSize: EcoTypography.sizes.sm,
    color: theme.muted,
    marginTop: 2,
  },
  statLabel: {
    fontSize: EcoTypography.sizes.xs,
    color: theme.muted,
    marginTop: EcoSpacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: EcoSpacing.xs,
  },
  detailText: {
    fontSize: EcoTypography.sizes.sm,
    color: theme.muted,
  },
  footer: {
    padding: EcoSpacing.lg,
  },
  homeBtn: {
    backgroundColor: EcoColors.primary,
    borderRadius: EcoBorderRadius.sm,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeBtnText: {
    color: '#fff',
    fontSize: EcoTypography.sizes.md,
    fontWeight: EcoTypography.weights.bold,
  },
});
