import { useColorScheme } from 'react-native';
import { EcoColors, ThemeColors } from '@/constants/theme';

export function useTheme(): ThemeColors {
  const scheme = useColorScheme();
  return scheme === 'dark' ? EcoColors.dark : EcoColors.light;
}
