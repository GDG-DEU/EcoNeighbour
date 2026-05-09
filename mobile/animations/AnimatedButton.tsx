import React from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Pressable } from 'react-native';

interface AnimatedButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  disabled?: boolean;
}

/**
 * AnimatedButton: Provides tactile feedback on press.
 * - Scales down to 0.95 and fades to 80% opacity on press
 * - Bounces back to 1.0 on release with ease-out elastic
 * - Duration: 100ms press, 150ms release
 */
export const AnimatedButton = React.forwardRef<Animated.View, AnimatedButtonProps>(
  ({ onPress, children, style, disabled = false }, ref) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
      const opacity = interpolate(scale.value, [0.95, 1], [0.8, 1], Extrapolate.CLAMP);
      return {
        transform: [{ scale: scale.value }],
        opacity,
      };
    });

    const handlePressIn = () => {
      scale.value = withTiming(0.95, {
        duration: 100,
        easing: Easing.out(Easing.quad),
      });
    };

    const handlePressOut = () => {
      scale.value = withTiming(1, {
        duration: 150,
        easing: Easing.out(Easing.elastic(1)),
      });
    };

    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
      >
        <Animated.View ref={ref} style={[style, animatedStyle]}>
          {children}
        </Animated.View>
      </Pressable>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';
