import React, { useEffect } from 'react';
import { Text, TextProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

interface AnimatedNumberProps extends TextProps {
  value: number;
  decimals?: number;
  duration?: number;
  useCommas?: boolean;
  onComplete?: () => void;
}

const AnimatedText = Animated.createAnimatedComponent(Text);

/**
 * AnimatedNumber: Counts from 0 to target value smoothly.
 * - Useful for dashboard stats (CO2 saved, trees planted, etc.)
 * - Duration: 800ms by default, configurable
 * - Easing: ease-out-quad for smooth deceleration
 * - Decimals: supports fixed decimal places
 * - Commas: adds thousand separators (e.g., 1,234)
 */
export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  decimals = 0,
  duration = 800,
  useCommas = false,
  onComplete,
  style,
  ...props
}) => {
  const animatedValue = useSharedValue(0);
  const [displayValue, setDisplayValue] = React.useState('0');

  useEffect(() => {
    animatedValue.value = withTiming(value, {
      duration,
      easing: Easing.out(Easing.quad),
    }, () => {
      if (onComplete) {
        runOnJS(onComplete)();
      }
    });
  }, [value, duration, onComplete]);

  // Format number with commas and decimals
  const formatNumber = (num: number): string => {
    const fixed = num.toFixed(decimals);
    if (!useCommas) return fixed;
    return fixed.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Update display value periodically (worklet approximation)
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayValue(formatNumber(animatedValue.value));
    }, 50);

    return () => clearInterval(interval);
  }, [decimals, useCommas]);

  return (
    <AnimatedText style={[style]} {...props}>
      {displayValue}
    </AnimatedText>
  );
};
