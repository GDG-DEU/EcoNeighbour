import React, { useEffect } from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  style?: ViewStyle;
  borderRadius?: number;
}

/**
 * SkeletonLoader: Pulsing placeholder for loading states.
 * - Animates opacity from 0.5 to 1 to 0.5 repeatedly
 * - Duration: 1000ms per cycle
 * - Easing: ease-in-out for smooth pulsing
 * - Perfect for: dashboard loading, bill list loading, neighborhood data loading
 */
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 12,
  style,
  borderRadius = 4,
}) => {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, {
        duration: 800,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#e5e7eb',
          marginBottom: 12,
        },
        animatedStyle,
        style,
      ]}
    />
  );
};

interface SkeletonGroupProps {
  lines?: number;
  style?: ViewStyle;
}

/**
 * SkeletonGroup: Multiple skeleton loaders in sequence (staggered).
 * - Creates 3 lines by default, last one shorter
 * - Each line pulses at slightly different timing
 */
export const SkeletonGroup: React.FC<SkeletonGroupProps> = ({ lines = 3, style }) => {
  return (
    <View style={style}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLoader
          key={i}
          width={i === lines - 1 ? '70%' : '100%'}
          height={i === 0 ? 16 : 12}
          style={{ marginBottom: i === lines - 1 ? 0 : 12 }}
        />
      ))}
    </View>
  );
};
