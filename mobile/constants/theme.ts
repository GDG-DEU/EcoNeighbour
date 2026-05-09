/**
 * EcoNeighbour Design System
 * Light + Dark mode — yeşil sadece aksiyon elementlerinde
 */

// ─── Sabit Renkler (moddan bağımsız) ────────────────────────────────────────
export const EcoColors = {
  primary: '#6b7d5c',
  primaryDark: '#4b5a41',
  primaryLight: '#8ca17b',
  secondary: '#3B82F6',
  accent: '#F59E0B',
  danger: '#EF4444',
  success: '#6b7d5c',
  warning: '#F59E0B',

  // Alfa renkler — yalnızca küçük vurgu elementleri için (kart bg'de kullanma)
  alpha: {
    primary10: 'rgba(107, 125, 92, 0.10)',
    primary15: 'rgba(107, 125, 92, 0.15)',
    primary20: 'rgba(107, 125, 92, 0.20)',
    primary30: 'rgba(107, 125, 92, 0.30)',
    danger10: 'rgba(239, 68, 68, 0.10)',
    danger20: 'rgba(239, 68, 68, 0.20)',
    accent10: 'rgba(245, 158, 11, 0.10)',
    accent20: 'rgba(245, 158, 11, 0.20)',
    black20: 'rgba(0, 0, 0, 0.20)',
    black40: 'rgba(0, 0, 0, 0.40)',
    black60: 'rgba(0, 0, 0, 0.60)',
    white10: 'rgba(255, 255, 255, 0.10)',
    white20: 'rgba(255, 255, 255, 0.20)',
  },

  gradient: {
    primary: ['#6b7d5c', '#4b5a41'] as [string, string],
    gold: ['#F59E0B', '#D97706'] as [string, string],
  },

  // ─── Light Tema Yüzeyleri ──────────────────────────────────────────────────
  light: {
    bg: '#FFFFFF',
    surface: '#F8FAFC',        // çok açık gri — sekme barı, header arkaplanı
    card: '#FFFFFF',           // kart arkaplanı — saf beyaz
    elevated: '#F1F5F9',       // avatar bg, input bg gibi hafif elemanlar
    border: '#E2E8F0',         // kart kenarlığı
    borderLight: '#F1F5F9',    // çok hafif ayırıcı
    text: '#0F172A',           // ana metin
    textSecondary: '#475569',  // ikincil metin
    muted: '#94A3B8',          // placeholder, etiket
    overlay: 'rgba(15, 23, 42, 0.55)',
    tabBar: '#FFFFFF',
    tabBarBorder: '#E2E8F0',
  },

  // ─── Dark Tema Yüzeyleri (nötr — yeşil tonu YOK) ─────────────────────────
  dark: {
    bg: '#09090B',             // zinc-950
    surface: '#141417',        // zinc-900 tonu
    card: '#1C1C21',           // zinc-800 tonu
    elevated: '#27272D',       // zinc-700 tonu — input bg, avatar
    border: '#2E2E35',         // zinc-700
    borderLight: '#3A3A42',    // zinc-600
    text: '#FAFAFA',           // zinc-50
    textSecondary: '#A1A1AA',  // zinc-400
    muted: '#71717A',          // zinc-500
    overlay: 'rgba(0, 0, 0, 0.70)',
    tabBar: '#141417',
    tabBarBorder: '#2E2E35',
  },
};

export type ThemeColors = typeof EcoColors.light;

// ─── Spacing & Radius ────────────────────────────────────────────────────────
export const EcoSpacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48, xxxl: 64,
};

export const EcoBorderRadius = {
  xs: 6, sm: 10, md: 14, lg: 20, xl: 28, full: 9999,
};

// ─── Gölgeler ────────────────────────────────────────────────────────────────
export const EcoShadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  fab: {
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
};

// ─── Tipografi ────────────────────────────────────────────────────────────────
export const EcoTypography = {
  sizes: {
    xs: 11, sm: 13, base: 15, md: 17, lg: 20,
    xl: 24, xxl: 30, xxxl: 38,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
};

// ─── Navigation Theme'leri ────────────────────────────────────────────────────
const sharedFonts = {
  regular: { fontFamily: 'System', fontWeight: '400' as const },
  medium:  { fontFamily: 'System', fontWeight: '500' as const },
  bold:    { fontFamily: 'System', fontWeight: '700' as const },
  heavy:   { fontFamily: 'System', fontWeight: '800' as const },
};

export const EcoNavigationTheme = {
  light: {
    dark: false,
    colors: {
      primary: EcoColors.primary,
      background: EcoColors.light.bg,
      card: EcoColors.light.surface,
      text: EcoColors.light.text,
      border: EcoColors.light.border,
      notification: EcoColors.primary,
    },
    fonts: sharedFonts,
  },
  dark: {
    dark: true,
    colors: {
      primary: EcoColors.primary,
      background: EcoColors.dark.bg,
      card: EcoColors.dark.surface,
      text: EcoColors.dark.text,
      border: EcoColors.dark.border,
      notification: EcoColors.primary,
    },
    fonts: sharedFonts,
  },
};

// Geriye dönük uyumluluk
export const Colors = {
  light: {
    text: EcoColors.light.text,
    background: EcoColors.light.bg,
    tint: EcoColors.primary,
    icon: EcoColors.light.muted,
    tabIconDefault: EcoColors.light.muted,
    tabIconSelected: EcoColors.primary,
  },
  dark: {
    text: EcoColors.dark.text,
    background: EcoColors.dark.bg,
    tint: EcoColors.primary,
    icon: EcoColors.dark.muted,
    tabIconDefault: EcoColors.dark.muted,
    tabIconSelected: EcoColors.primary,
  },
};
