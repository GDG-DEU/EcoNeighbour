import { View, Text, StyleSheet } from 'react-native';
import { EcoColors, EcoSpacing, EcoBorderRadius, EcoTypography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  treesSavedThisMonth: number;
  totalTreesSaved: number;
}

export function TreesSavedBanner({ treesSavedThisMonth, totalTreesSaved }: Props) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const isPositive = treesSavedThisMonth > 0;
  const treeCount = Math.max(0, Math.floor(treesSavedThisMonth));
  const treesToShow = Math.min(treeCount, 8);

  return (
    <View style={[styles.banner, !isPositive && styles.bannerNeutral]}>
      <View style={styles.left}>
        <Text style={styles.headline}>
          {isPositive
            ? `${treesSavedThisMonth.toFixed(1)} ağaç kurtardın`
            : 'Hedefine ulaş!'}
        </Text>
        <Text style={styles.sub}>
          {isPositive
            ? `Toplam ${totalTreesSaved.toFixed(0)} ağaç birikti 🌿`
            : 'Bir sonraki faturada daha az tüket'}
        </Text>

        {isPositive && treesToShow > 0 && (
          <View style={styles.treeRow}>
            {Array.from({ length: treesToShow }).map((_, i) => (
              <Text key={i} style={styles.treeEmoji}>🌳</Text>
            ))}
            {treeCount > 8 && (
              <Text style={styles.treeMore}>+{treeCount - 8}</Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.right}>
        <Text style={styles.bigEmoji}>{isPositive ? '🌿' : '💡'}</Text>
      </View>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  banner: {
    marginHorizontal: EcoSpacing.lg,
    marginBottom: EcoSpacing.md,
    borderRadius: EcoBorderRadius.lg,
    backgroundColor: EcoColors.alpha.primary10,
    borderWidth: 1,
    borderColor: EcoColors.alpha.primary30,
    flexDirection: 'row',
    alignItems: 'center',
    padding: EcoSpacing.md,
  },
  bannerNeutral: {
    backgroundColor: EcoColors.alpha.accent10,
    borderColor: EcoColors.alpha.accent20,
  },
  left: { flex: 1 },
  headline: {
    fontSize: EcoTypography.sizes.md,
    fontWeight: EcoTypography.weights.bold,
    color: theme.text,
    marginBottom: 4,
  },
  sub: {
    fontSize: EcoTypography.sizes.sm,
    color: theme.muted,
    marginBottom: EcoSpacing.sm,
  },
  treeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
  treeEmoji: { fontSize: 18 },
  treeMore: {
    fontSize: EcoTypography.sizes.sm,
    color: EcoColors.primary,
    fontWeight: EcoTypography.weights.bold,
    alignSelf: 'center',
    marginLeft: 4,
  },
  right: { marginLeft: EcoSpacing.md },
  bigEmoji: { fontSize: 40 },
});
