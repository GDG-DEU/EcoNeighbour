import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

type SlideDirection = 'up' | 'down' | 'left' | 'right';

interface FadeInSlideProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  distance?: number;
  direction?: SlideDirection;
  style?: ViewStyle;
}

/**
 * FadeInSlide: Entry animation combining fade and slide.
 * - Fades from 0 to 1 opacity
 * - Slides in from direction with configurable distance
 * - Duration: 500ms by default
 * - Delay: configurable for staggered animations
 * - Perfect for: screen transitions, list item entries, empty state illustrations
 */
export const FadeInSlide: React.FC<FadeInSlideProps> = ({
  children,
  delay = 0,
  duration = 500,
  distance = 20,
  direction = 'up',
  style,
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(direction === 'up' ? distance : direction === 'down' ? -distance : 0);
  const translateX = useSharedValue(direction === 'right' ? -distance : direction === 'left' ? distance : 0);

  useEffect(() => {
    const timer = setTimeout(() => {
      opacity.value = withTiming(1, {
        duration,
        easing: Easing.out(Easing.cubic),
      });
      translateY.value = withTiming(0, {
        duration,
        easing: Easing.out(Easing.cubic),
      });
      translateX.value = withTiming(0, {
        duration,
        easing: Easing.out(Easing.cubic),
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, duration, distance, direction]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { translateX: translateX.value }],
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
};
