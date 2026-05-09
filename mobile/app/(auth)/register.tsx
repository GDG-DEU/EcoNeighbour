import { router, Link } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  EcoColors,
  EcoSpacing,
  EcoBorderRadius,
  EcoTypography,
} from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { register } from "@/services/auth.api";
import { useAuthStore } from "@/stores/auth.store";
import { registerForPushNotifications } from "@/services/notifications";

export default function RegisterScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login: storeLogin } = useAuthStore();

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert("Eksik bilgi", "Tüm alanları doldurun.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Şifre hatası", "Şifreler eşleşmiyor.");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Şifre hatası", "Şifre en az 8 karakter olmalıdır.");
      return;
    }
    setIsLoading(true);
    try {
      const { accessToken, refreshToken, user } = await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      await storeLogin(accessToken, refreshToken, user);
      registerForPushNotifications().catch(() => {});
      router.replace("/(tabs)");
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Kayıt oluşturulamadı.";
      Alert.alert("Hata", msg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Başlık */}
        <View style={styles.hero}>
          <View style={styles.logoWrap}>
            <Image
              source={require("@/assets/images/logo/ecoNeighbour-transparent.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Hesap Oluştur</Text>
          <Text style={styles.subtitle}>Karbon takibine hoş geldin</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Ad Soyad */}
          <Text style={styles.label}>Ad Soyad</Text>
          <View style={styles.inputWrap}>
            <Ionicons
              name="person-outline"
              size={18}
              color={theme.muted}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              placeholder="Adınız Soyadınız"
              placeholderTextColor={theme.muted}
              selectionColor={EcoColors.primary}
            />
          </View>

          {/* E-posta */}
          <Text style={[styles.label, { marginTop: EcoSpacing.md }]}>
            E-posta
          </Text>
          <View style={styles.inputWrap}>
            <Ionicons
              name="mail-outline"
              size={18}
              color={theme.muted}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="ornek@mail.com"
              placeholderTextColor={theme.muted}
              selectionColor={EcoColors.primary}
            />
          </View>

          {/* Şifre */}
          <Text style={[styles.label, { marginTop: EcoSpacing.md }]}>
            Şifre
          </Text>
          <View style={styles.inputWrap}>
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color={theme.muted}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholder="En az 8 karakter"
              placeholderTextColor={theme.muted}
              selectionColor={EcoColors.primary}
            />
            <TouchableOpacity
              onPress={() => setShowPassword((v) => !v)}
              style={styles.eyeBtn}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={18}
                color={theme.muted}
              />
            </TouchableOpacity>
          </View>

          {/* Şifre Tekrar */}
          <Text style={[styles.label, { marginTop: EcoSpacing.md }]}>
            Şifre Tekrar
          </Text>
          <View style={styles.inputWrap}>
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color={theme.muted}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              placeholder="••••••••"
              placeholderTextColor={theme.muted}
              selectionColor={EcoColors.primary}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.registerBtn,
              isLoading && styles.registerBtnDisabled,
            ]}
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons
                  name="person-add-outline"
                  size={18}
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.registerBtnText}>Kayıt Ol</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Login Linki */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Zaten hesabın var mı? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Giriş Yap</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.bg },
    scroll: {
      flexGrow: 1,
      paddingHorizontal: EcoSpacing.lg,
      paddingTop: 60,
      paddingBottom: EcoSpacing.xxl,
    },
    hero: { alignItems: "center", marginBottom: EcoSpacing.xl },
    logoWrap: {
      width: 80,
      height: 80,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: EcoSpacing.md,
    },
    logo: {
      width: "100%",
      height: "100%",
    },
    title: {
      fontSize: EcoTypography.sizes.xxl,
      fontWeight: EcoTypography.weights.extrabold,
      color: theme.text,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: EcoTypography.sizes.base,
      color: theme.muted,
      marginTop: 4,
    },
    form: {
      backgroundColor: theme.card,
      borderRadius: EcoBorderRadius.lg,
      padding: EcoSpacing.lg,
      borderWidth: 1,
      borderColor: theme.border,
    },
    label: {
      fontSize: EcoTypography.sizes.sm,
      fontWeight: EcoTypography.weights.semibold,
      color: theme.textSecondary,
      marginBottom: EcoSpacing.xs,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    inputWrap: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.surface,
      borderRadius: EcoBorderRadius.sm,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: EcoSpacing.sm,
      height: 48,
    },
    inputIcon: { marginRight: EcoSpacing.sm },
    input: { flex: 1, color: theme.text, fontSize: EcoTypography.sizes.base },
    eyeBtn: { padding: EcoSpacing.xs },
    registerBtn: {
      marginTop: EcoSpacing.lg,
      backgroundColor: EcoColors.primary,
      borderRadius: EcoBorderRadius.sm,
      height: 50,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    registerBtnDisabled: { opacity: 0.6 },
    registerBtnText: {
      color: "#fff",
      fontSize: EcoTypography.sizes.md,
      fontWeight: EcoTypography.weights.bold,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: EcoSpacing.xl,
    },
    footerText: { color: theme.muted, fontSize: EcoTypography.sizes.base },
    footerLink: {
      color: EcoColors.primary,
      fontSize: EcoTypography.sizes.base,
      fontWeight: EcoTypography.weights.semibold,
    },
  });
