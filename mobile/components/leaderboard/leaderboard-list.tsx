import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EcoColors, EcoSpacing, EcoBorderRadius, EcoTypography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import type { LeaderboardEntry } from '@/types/api';

const MEDAL = ['🥇', '🥈', '🥉'];

interface Props {
  data: LeaderboardEntry[];
  currentUserId: string;
  isLoading?: boolean;
}

function EntryRow({ item, currentUserId }: { item: LeaderboardEntry; currentUserId: string }) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const isMe = item.user.id === currentUserId;
  const medal = item.rank <= 3 ? MEDAL[item.rank - 1] : null;

  return (
    <View style={[styles.row, isMe && styles.rowMe]}>
      {/* Sıra */}
      <View style={styles.rankWrap}>
        {medal ? (
          <Text style={styles.medal}>{medal}</Text>
        ) : (
          <Text style={[styles.rank, isMe && styles.rankMe]}>{item.rank}</Text>
        )}
      </View>

      {/* Avatar */}
      <View style={[styles.avatar, isMe && styles.avatarMe]}>
        <Text style={styles.avatarText}>
          {item.user.name.charAt(0).toUpperCase()}
        </Text>
      </View>

      {/* İsim */}
      <Text style={[styles.name, isMe && styles.nameMe]} numberOfLines={1}>
        {isMe ? 'Sen' : item.user.name}
      </Text>

      {/* Sağ taraf */}
      <View style={styles.right}>
        <Text style={[styles.co2, isMe && styles.co2Me]}>{item.totalCo2Kg.toFixed(1)} kg</Text>
        <Text style={styles.trees}>🌳 {item.treesSaved.toFixed(1)}</Text>
      </View>
    </View>
  );
}

export function LeaderboardList({ data, currentUserId, isLoading }: Props) {
  const theme = useTheme();
  const styles = getStyles(theme);
  if (isLoading) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Yükleniyor…</Text>
      </View>
    );
  }
  if (!data || data.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="trophy-outline" size={48} color={theme.muted} />
        <Text style={styles.emptyText}>Bu ay için henüz sıralama yok</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.user.id}
      renderItem={({ item }) => <EntryRow item={item} currentUserId={currentUserId} />}
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
  rowMe: {
    borderColor: EcoColors.alpha.primary30,
    backgroundColor: EcoColors.alpha.primary10,
  },
  rankWrap: { width: 32, alignItems: 'center' },
  rank: {
    fontSize: EcoTypography.sizes.md,
    fontWeight: EcoTypography.weights.bold,
    color: theme.muted,
  },
  rankMe: { color: EcoColors.primary },
  medal: { fontSize: 20 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: EcoBorderRadius.full,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: EcoSpacing.sm,
  },
  avatarMe: { backgroundColor: EcoColors.alpha.primary20 },
  avatarText: {
    fontSize: EcoTypography.sizes.sm,
    fontWeight: EcoTypography.weights.bold,
    color: theme.text,
  },
  name: {
    flex: 1,
    fontSize: EcoTypography.sizes.sm,
    fontWeight: EcoTypography.weights.medium,
    color: theme.text,
  },
  nameMe: { color: EcoColors.primary, fontWeight: EcoTypography.weights.bold },
  right: { alignItems: 'flex-end' },
  co2: {
    fontSize: EcoTypography.sizes.sm,
    fontWeight: EcoTypography.weights.semibold,
    color: theme.text,
  },
  co2Me: { color: EcoColors.primary },
  trees: { fontSize: EcoTypography.sizes.xs, color: theme.muted, marginTop: 2 },
  empty: {
    alignItems: 'center',
    paddingVertical: EcoSpacing.xxl,
    paddingHorizontal: EcoSpacing.xl,
  },
  emptyText: {
    color: theme.muted,
    fontSize: EcoTypography.sizes.base,
    marginTop: EcoSpacing.md,
    textAlign: 'center',
  },
});
