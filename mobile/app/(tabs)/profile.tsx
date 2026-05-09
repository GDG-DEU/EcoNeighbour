import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  EcoColors,
  EcoSpacing,
  EcoBorderRadius,
  EcoTypography,
} from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/stores/auth.store";
import { getMe } from "@/services/users.api";
import { getMyBills } from "@/services/bills.api";
import { logout as apiLogout } from "@/services/auth.api";
import { BillHistoryList } from "@/components/profile/bill-history-list";

export default function ProfileScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);
  const insets = useSafeAreaInsets();
  const { user, logout, refreshToken } = useAuthStore();

  const meQ = useQuery({ queryKey: ["me"], queryFn: getMe });
  const billsQ = useQuery({ queryKey: ["bills"], queryFn: getMyBills });

  async function handleLogout() {
    Alert.alert("Çıkış Yap", "Hesabından çıkmak istediğine emin misin?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Çıkış Yap",
        style: "destructive",
        onPress: async () => {
          try {
            if (refreshToken) await apiLogout(refreshToken);
          } catch {}
          await logout();
        },
      },
    ]);
  }

  const me = meQ.data ?? user;
  const totalTrees = me?.totalTreesSaved ?? 0;

  return (
    <ScrollView
      style={[styles.root, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={meQ.isRefetching || billsQ.isRefetching}
          onRefresh={() => {
            meQ.refetch();
            billsQ.refetch();
          }}
          tintColor={EcoColors.primary}
        />
      }
    >
      {/* Profil Kartı */}
      <View style={styles.profileCard}>
        <View style={styles.avatarWrap}>
          <Text style={styles.avatarText}>
            {(me?.name ?? "?").charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{me?.name ?? "—"}</Text>
        {me?.neighborhood && (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={theme.muted} />
            <Text style={styles.locationText}>
              {me.neighborhood.name}, {me.neighborhood.city}
            </Text>
          </View>
        )}

        {/* Toplam Ağaç */}
        <View style={styles.treesBadge}>
          <Text style={styles.treesValue}>{totalTrees.toFixed(0)}</Text>
          <Text style={styles.treesLabel}>🌳 Toplam ağaç</Text>
        </View>
      </View>

      {/* Fatura Geçmişi */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fatura Geçmişi</Text>
      </View>

      {billsQ.isLoading ? (
        <ActivityIndicator
          color={EcoColors.primary}
          style={{ marginTop: EcoSpacing.xl }}
        />
      ) : (
        <BillHistoryList bills={billsQ.data ?? []} />
      )}

      {/* Çıkış */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Ionicons name="log-out-outline" size={18} color={EcoColors.danger} />
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.bg },
    content: { paddingBottom: EcoSpacing.xxl },
    profileCard: {
      margin: EcoSpacing.lg,
      backgroundColor: theme.card,
      borderRadius: EcoBorderRadius.lg,
      padding: EcoSpacing.xl,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.border,
    },
    avatarWrap: {
      width: 80,
      height: 80,
      borderRadius: EcoBorderRadius.full,
      backgroundColor: EcoColors.alpha.primary20,
      borderWidth: 3,
      borderColor: EcoColors.alpha.primary30,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: EcoSpacing.md,
    },
    avatarText: {
      fontSize: EcoTypography.sizes.xxl,
      fontWeight: EcoTypography.weights.extrabold,
      color: EcoColors.primary,
    },
    name: {
      fontSize: EcoTypography.sizes.xl,
      fontWeight: EcoTypography.weights.bold,
      color: theme.text,
      marginBottom: EcoSpacing.xs,
    },
    locationRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginBottom: EcoSpacing.md,
    },
    locationText: { fontSize: EcoTypography.sizes.sm, color: theme.muted },
    treesBadge: {
      alignItems: "center",
      backgroundColor: EcoColors.alpha.primary15,
      borderRadius: EcoBorderRadius.md,
      paddingHorizontal: EcoSpacing.xl,
      paddingVertical: EcoSpacing.sm,
      borderWidth: 1,
      borderColor: EcoColors.alpha.primary30,
    },
    treesValue: {
      fontSize: EcoTypography.sizes.xxl,
      fontWeight: EcoTypography.weights.extrabold,
      color: EcoColors.primary,
    },
    treesLabel: {
      fontSize: EcoTypography.sizes.sm,
      color: theme.muted,
      marginTop: 2,
    },
    section: {
      paddingHorizontal: EcoSpacing.lg,
      marginBottom: EcoSpacing.sm,
    },
    sectionTitle: {
      fontSize: EcoTypography.sizes.md,
      fontWeight: EcoTypography.weights.bold,
      color: theme.text,
    },
    logoutBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: EcoSpacing.sm,
      marginHorizontal: EcoSpacing.lg,
      marginTop: EcoSpacing.xl,
      height: 48,
      borderRadius: EcoBorderRadius.sm,
      borderWidth: 1,
      borderColor: EcoColors.alpha.danger20,
      backgroundColor: EcoColors.alpha.danger10,
    },
    logoutText: {
      color: EcoColors.danger,
      fontSize: EcoTypography.sizes.base,
      fontWeight: EcoTypography.weights.semibold,
    },
  });
