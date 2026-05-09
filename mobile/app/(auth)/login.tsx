import { router, Link } from 'expo-router';
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
} from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { EcoColors, EcoSpacing, EcoBorderRadius, EcoTypography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { login } from '@/services/auth.api';
import { useAuthStore } from '@/stores/auth.store';
import { registerForPushNotifications } from '@/services/notifications';

export default function LoginScreen() {
  const theme = useTheme();
  const styles = getStyles(theme);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login: storeLogin } = useAuthStore();

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Eksik bilgi', 'E-posta ve şifre alanlarını doldurun.');
      return;
    }
    setIsLoading(true);
    try {
      const { accessToken, refreshToken, user } = await login(email.trim(), password);
      await storeLogin(accessToken, refreshToken, user);
      // Push token kaydet (arka planda, hata olsa da devam et)
      registerForPushNotifications().catch(() => {});
      router.replace('/(tabs)');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Giriş yapılamadı. Bilgilerinizi kontrol edin.';
      Alert.alert('Hata', msg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Logo & Başlık */}
        <View style={styles.hero}>
          <View style={styles.logoWrap}>
            <Image
              source={require('@/assets/images/logo/ecoNeighbour-transparent.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appName}>EcoNeighbour</Text>
          <Text style={styles.tagline}>Karbon takibini başlat</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>E-posta</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={18} color={theme.muted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              placeholder="ornek@mail.com"
              placeholderTextColor={theme.muted}
              selectionColor={EcoColors.primary}
            />
          </View>

          <Text style={[styles.label, { marginTop: EcoSpacing.md }]}>Şifre</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color={theme.muted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholder="••••••••"
              placeholderTextColor={theme.muted}
              selectionColor={EcoColors.primary}
            />
            <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={theme.muted}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, isLoading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="log-in-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.loginBtnText}>Giriş Yap</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Kayıt Linki */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Hesabın yok mu? </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Kayıt Ol</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: EcoSpacing.lg,
    paddingTop: 80,
    paddingBottom: EcoSpacing.xxl,
  },
  hero: {
    alignItems: 'center',
    marginBottom: EcoSpacing.xxl,
  },
  logoWrap: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: EcoSpacing.md,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  appName: {
    fontSize: EcoTypography.sizes.xxl,
    fontWeight: EcoTypography.weights.extrabold,
    color: theme.text,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: EcoTypography.sizes.base,
    color: theme.muted,
    marginTop: EcoSpacing.xs,
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
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: EcoBorderRadius.sm,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: EcoSpacing.sm,
    height: 48,
  },
  inputIcon: {
    marginRight: EcoSpacing.sm,
  },
  input: {
    flex: 1,
    color: theme.text,
    fontSize: EcoTypography.sizes.base,
  },
  eyeBtn: {
    padding: EcoSpacing.xs,
  },
  loginBtn: {
    marginTop: EcoSpacing.lg,
    backgroundColor: EcoColors.primary,
    borderRadius: EcoBorderRadius.sm,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: EcoTypography.sizes.md,
    fontWeight: EcoTypography.weights.bold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: EcoSpacing.xl,
  },
  footerText: {
    color: theme.muted,
    fontSize: EcoTypography.sizes.base,
  },
  footerLink: {
    color: EcoColors.primary,
    fontSize: EcoTypography.sizes.base,
    fontWeight: EcoTypography.weights.semibold,
  },
});
