import { router, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import {
  EcoColors,
  EcoSpacing,
  EcoBorderRadius,
  EcoTypography,
} from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { confirmBill } from "@/services/bills.api";
import type { ExtractedBillData } from "@/types/api";

export default function ReviewScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);
  const params = useLocalSearchParams<{ data: string; imageUri: string }>();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  const initial: ExtractedBillData = params.data ? JSON.parse(params.data) : {};

  const [billType, setBillType] = useState<"ELECTRICITY" | "GAS">(
    initial.bill_type ?? "ELECTRICITY",
  );
  const [address, setAddress] = useState(initial.address ?? "");
  const [subscriberNumber, setSubscriberNumber] = useState(
    initial.subscriber_number ?? "",
  );
  const [periodStart, setPeriodStart] = useState(initial.period_start ?? "");
  const [periodEnd, setPeriodEnd] = useState(initial.period_end ?? "");
  const [usage, setUsage] = useState(initial.usage?.toString() ?? "");
  const [isLoading, setIsLoading] = useState(false);

  const confidence = initial.confidence ?? 0;
  const usageUnit =
    initial.usage_unit ?? (billType === "ELECTRICITY" ? "kWh" : "m3");

  async function handleConfirm() {
    const usageNum = parseFloat(usage);
    if (
      !address.trim() ||
      !subscriberNumber.trim() ||
      !periodStart ||
      !periodEnd ||
      isNaN(usageNum)
    ) {
      Alert.alert("Eksik bilgi", "Tüm alanları eksiksiz doldurun.");
      return;
    }
    setIsLoading(true);
    try {
      const bill = await confirmBill({
        bill_type: billType,
        address: address.trim(),
        subscriber_number: subscriberNumber.trim(),
        period_start: periodStart,
        period_end: periodEnd,
        usage: usageNum,
        usage_unit: usageUnit,
        rawImageUrl: params.imageUri,
      });

      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      await queryClient.invalidateQueries({ queryKey: ["bills"] });

      router.replace({
        pathname: "/bill/success",
        params: {
          co2Kg: bill.co2Kg.toString(),
          treesSaved: bill.treesSaved?.toString() ?? "0",
          billType,
          usage,
          usageUnit,
        },
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Fatura kaydedilemedi.";
      Alert.alert("Hata", msg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Güven Skoru */}
        <View
          style={[
            styles.confidenceBar,
            confidence < 0.85 && styles.confidenceBarWarn,
          ]}
        >
          <Ionicons
            name={confidence >= 0.85 ? "checkmark-circle" : "warning"}
            size={18}
            color={confidence >= 0.85 ? EcoColors.primary : EcoColors.warning}
          />
          <Text
            style={[
              styles.confidenceText,
              confidence < 0.85 && styles.confidenceTextWarn,
            ]}
          >
            AI güveni: %{Math.round(confidence * 100)} — Lütfen bilgileri
            doğrula
          </Text>
        </View>

        {/* Fatura Tipi */}
        <Text style={styles.sectionLabel}>FATURA TİPİ</Text>
        <View style={styles.typeToggle}>
          {(["ELECTRICITY", "GAS"] as const).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeBtn,
                billType === type && styles.typeBtnActive,
              ]}
              onPress={() => setBillType(type)}
            >
              <Ionicons
                name={type === "ELECTRICITY" ? "flash" : "flame"}
                size={18}
                color={billType === type ? "#fff" : theme.muted}
              />
              <Text
                style={[
                  styles.typeBtnText,
                  billType === type && styles.typeBtnTextActive,
                ]}
              >
                {type === "ELECTRICITY" ? "Elektrik" : "Doğalgaz"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Form Alanları */}
        {[
          {
            label: "Adres",
            value: address,
            onChange: setAddress,
            icon: "location-outline",
            keyboard: "default",
          },
          {
            label: "Abone Numarası",
            value: subscriberNumber,
            onChange: setSubscriberNumber,
            icon: "card-outline",
            keyboard: "numeric",
          },
          {
            label: "Dönem Başlangıcı (YYYY-MM-DD)",
            value: periodStart,
            onChange: setPeriodStart,
            icon: "calendar-outline",
            keyboard: "default",
          },
          {
            label: "Dönem Bitişi (YYYY-MM-DD)",
            value: periodEnd,
            onChange: setPeriodEnd,
            icon: "calendar-outline",
            keyboard: "default",
          },
        ].map((field) => (
          <View key={field.label}>
            <Text style={styles.fieldLabel}>{field.label}</Text>
            <View style={styles.inputWrap}>
              <Ionicons
                name={field.icon as any}
                size={16}
                color={theme.muted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={field.value}
                onChangeText={field.onChange}
                keyboardType={field.keyboard as any}
                placeholderTextColor={theme.muted}
                selectionColor={EcoColors.primary}
              />
            </View>
          </View>
        ))}

        {/* Tüketim */}
        <Text style={styles.fieldLabel}>Tüketim</Text>
        <View style={styles.inputWrap}>
          <Ionicons
            name="speedometer-outline"
            size={16}
            color={theme.muted}
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={usage}
            onChangeText={setUsage}
            keyboardType="decimal-pad"
            placeholderTextColor={theme.muted}
            selectionColor={EcoColors.primary}
          />
          <View style={styles.unitBadge}>
            <Text style={styles.unitBadgeText}>{usageUnit}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Onayla Butonu */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmBtn, isLoading && { opacity: 0.7 }]}
          onPress={handleConfirm}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons
                name="cloud-upload-outline"
                size={20}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.confirmBtnText}>Onayla & Kaydet</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.bg },
    scroll: { padding: EcoSpacing.lg, paddingBottom: EcoSpacing.xxl },
    confidenceBar: {
      flexDirection: "row",
      alignItems: "center",
      gap: EcoSpacing.sm,
      backgroundColor: EcoColors.alpha.primary10,
      borderRadius: EcoBorderRadius.sm,
      padding: EcoSpacing.sm,
      marginBottom: EcoSpacing.lg,
      borderWidth: 1,
      borderColor: EcoColors.alpha.primary30,
    },
    confidenceBarWarn: {
      backgroundColor: EcoColors.alpha.accent10,
      borderColor: EcoColors.alpha.accent20,
    },
    confidenceText: {
      fontSize: EcoTypography.sizes.sm,
      color: EcoColors.primary,
      flex: 1,
    },
    confidenceTextWarn: { color: EcoColors.warning },
    sectionLabel: {
      fontSize: EcoTypography.sizes.xs,
      fontWeight: EcoTypography.weights.semibold,
      color: theme.muted,
      letterSpacing: 0.8,
      marginBottom: EcoSpacing.sm,
    },
    typeToggle: {
      flexDirection: "row",
      gap: EcoSpacing.sm,
      marginBottom: EcoSpacing.lg,
    },
    typeBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: EcoSpacing.xs,
      height: 44,
      borderRadius: EcoBorderRadius.sm,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
    },
    typeBtnActive: {
      backgroundColor: EcoColors.primary,
      borderColor: EcoColors.primary,
    },
    typeBtnText: {
      color: theme.muted,
      fontWeight: EcoTypography.weights.semibold,
    },
    typeBtnTextActive: { color: "#fff" },
    fieldLabel: {
      fontSize: EcoTypography.sizes.sm,
      fontWeight: EcoTypography.weights.semibold,
      color: theme.textSecondary,
      marginBottom: EcoSpacing.xs,
      marginTop: EcoSpacing.md,
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    inputWrap: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.card,
      borderRadius: EcoBorderRadius.sm,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: EcoSpacing.sm,
      height: 48,
    },
    inputIcon: { marginRight: EcoSpacing.sm },
    input: { flex: 1, color: theme.text, fontSize: EcoTypography.sizes.base },
    unitBadge: {
      backgroundColor: EcoColors.alpha.primary15,
      borderRadius: EcoBorderRadius.xs,
      paddingHorizontal: EcoSpacing.sm,
      paddingVertical: 3,
      borderWidth: 1,
      borderColor: EcoColors.alpha.primary30,
    },
    unitBadgeText: {
      color: EcoColors.primary,
      fontSize: EcoTypography.sizes.sm,
      fontWeight: EcoTypography.weights.semibold,
    },
    footer: {
      padding: EcoSpacing.lg,
      backgroundColor: theme.surface,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    confirmBtn: {
      backgroundColor: EcoColors.primary,
      borderRadius: EcoBorderRadius.sm,
      height: 52,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    confirmBtnText: {
      color: "#fff",
      fontSize: EcoTypography.sizes.md,
      fontWeight: EcoTypography.weights.bold,
    },
  });
