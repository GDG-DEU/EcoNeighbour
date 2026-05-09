import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface SuccessCheckmarkProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
  onAnimationComplete?: () => void;
}

/**
 * SuccessCheckmark: Animated check icon with scale-in + subtle bounce.
 * - Scales from 0 to 1.1, then back to 1 for bounce effect
 * - Opacity fades in simultaneously
 * - Duration: 300ms
 * - Easing: ease-out elastic for bounce feel
 * - Perfect for: bill upload success, form submission success
 */
export const SuccessCheckmark: React.FC<SuccessCheckmarkProps> = ({
  size = 48,
  color = '#22c55e',
  style,
  onAnimationComplete,
}) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.1, {
        duration: 150,
        easing: Easing.out(Easing.quad),
      }),
      withTiming(1, {
        duration: 150,
        easing: Easing.out(Easing.cubic),
      })
    );

    opacity.value = withTiming(1, {
      duration: 150,
      easing: Easing.out(Easing.quad),
    });

    const timeout = setTimeout(() => {
      onAnimationComplete?.();
    }, 300);

    return () => clearTimeout(timeout);
  }, [onAnimationComplete]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      <MaterialCommunityIcons name="check-circle" size={size} color={color} />
    </Animated.View>
  );
};
