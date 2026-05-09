import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface ErrorShakeProps {
  trigger: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
}

/**
 * ErrorShake: Horizontal shake animation for error indication.
 * - Shakes left/right 5 times for 300ms total
 * - Intensity: pixel offset (default 10px)
 * - Perfect for: invalid form fields, auth errors, validation feedback
 * - Resets to x=0 after animation completes
 */
export const ErrorShake: React.FC<ErrorShakeProps> = ({
  trigger,
  children,
  style,
  intensity = 10,
}) => {
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (trigger) {
      translateX.value = withSequence(
        withTiming(intensity, { duration: 50, easing: Easing.linear }),
        withTiming(-intensity, { duration: 50, easing: Easing.linear }),
        withTiming(intensity * 0.75, { duration: 50, easing: Easing.linear }),
        withTiming(-intensity * 0.75, { duration: 50, easing: Easing.linear }),
        withTiming(intensity * 0.5, { duration: 50, easing: Easing.linear }),
        withTiming(0, { duration: 50, easing: Easing.linear })
      );
    }
  }, [trigger, intensity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
};
