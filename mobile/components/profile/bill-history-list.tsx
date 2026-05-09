import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EcoColors, EcoSpacing, EcoBorderRadius, EcoTypography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import type { Bill } from '@/types/api';

interface Props {
  bills: Bill[];
  isLoading?: boolean;
}

function BillRow({ bill }: { bill: Bill }) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const isElec = bill.type === 'ELECTRICITY';
  const monthName = new Date(bill.year, bill.month - 1).toLocaleString('tr-TR', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <View style={styles.row}>
      <View style={[styles.typeIcon, isElec ? styles.typeIconElec : styles.typeIconGas]}>
        <Ionicons
          name={isElec ? 'flash' : 'flame'}
          size={18}
          color={isElec ? EcoColors.accent : '#FF6B35'}
        />
      </View>
      <View style={styles.info}>
        <Text style={styles.monthText}>{monthName}</Text>
        <Text style={styles.usageText}>
          {bill.usage} {isElec ? 'kWh' : 'm³'}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.co2Text}>{bill.co2Kg.toFixed(1)} kg CO₂</Text>
        {(bill.treesSaved ?? 0) > 0 && (
          <Text style={styles.treesText}>🌳 {bill.treesSaved?.toFixed(1)}</Text>
        )}
      </View>
    </View>
  );
}

export function BillHistoryList({ bills, isLoading }: Props) {
  const theme = useTheme();
  const styles = getStyles(theme);
  if (isLoading) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Yükleniyor…</Text>
      </View>
    );
  }

  const confirmed = bills.filter((b) => b.isConfirmed);

  if (confirmed.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="receipt-outline" size={48} color={theme.muted} />
        <Text style={styles.emptyTitle}>Fatura geçmişi boş</Text>
        <Text style={styles.emptyText}>Henüz onaylanmış fatura yok.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={confirmed.sort((a, b) => {
        if (b.year !== a.year) return b.year - a.year;
        return b.month - a.month;
      })}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <BillRow bill={item} />}
      contentContainerStyle={styles.list}
      scrollEnabled={false}
    />
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  list: { paddingHorizontal: EcoSpacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    borderRadius: EcoBorderRadius.md,
    padding: EcoSpacing.sm,
    marginBottom: EcoSpacing.sm,
    borderWidth: 1,
    borderColor: theme.border,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: EcoBorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: EcoSpacing.sm,
  },
  typeIconElec: { backgroundColor: EcoColors.alpha.accent10 },
  typeIconGas: { backgroundColor: 'rgba(255,107,53,0.10)' },
  info: { flex: 1 },
  monthText: {
    fontSize: EcoTypography.sizes.sm,
    fontWeight: EcoTypography.weights.semibold,
    color: theme.text,
    textTransform: 'capitalize',
  },
  usageText: { fontSize: EcoTypography.sizes.xs, color: theme.muted, marginTop: 2 },
  right: { alignItems: 'flex-end' },
  co2Text: {
    fontSize: EcoTypography.sizes.sm,
    fontWeight: EcoTypography.weights.semibold,
    color: theme.text,
  },
  treesText: { fontSize: EcoTypography.sizes.xs, color: EcoColors.primary, marginTop: 2 },
  empty: {
    alignItems: 'center',
    paddingVertical: EcoSpacing.xxl,
    paddingHorizontal: EcoSpacing.xl,
  },
  emptyTitle: {
    fontSize: EcoTypography.sizes.md,
    fontWeight: EcoTypography.weights.semibold,
    color: theme.text,
    marginTop: EcoSpacing.md,
  },
  emptyText: {
    color: theme.muted,
    fontSize: EcoTypography.sizes.sm,
    marginTop: EcoSpacing.xs,
    textAlign: 'center',
  },
});
