import React, { useEffect } from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

interface ProgressCircleProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  backgroundColor?: string;
  progressColor?: string;
  style?: ViewStyle;
}

/**
 * ProgressCircle: Animated circular progress indicator.
 * - progress: 0 to 100
 * - Smooth rotation animation for indeterminate state
 * - Duration: 400ms for progress changes
 * - Easing: ease-out for smooth deceleration
 * - Perfect for: bill upload, file processing, loading indicators
 */
export const ProgressCircle: React.FC<ProgressCircleProps> = ({
  progress,
  size = 60,
  strokeWidth = 4,
  backgroundColor = '#e5e7eb',
  progressColor = '#3b82f6',
  style,
}) => {
  const animatedProgress = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(Math.min(progress, 100), {
      duration: 400,
      easing: Easing.out(Easing.quad),
    });
  }, [progress]);

  useEffect(() => {
    if (progress < 100) {
      rotation.value = withTiming(360, {
        duration: 2000,
        easing: Easing.linear,
      });
    }
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${interpolate(
          rotation.value,
          [0, 360],
          [0, 360],
          Extrapolate.CLAMP
        )}deg`,
      },
    ],
  }));

  const circumference = 2 * Math.PI * (size / 2 - strokeWidth);
  const strokeDashoffset =
    circumference - (animatedProgress.value / 100) * circumference;

  return (
    <View style={[{ width: size, height: size }, style]}>
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: backgroundColor,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          },
          animatedStyle,
        ]}
      >
        <View
          style={{
            width: size - strokeWidth * 2,
            height: size - strokeWidth * 2,
            borderRadius: (size - strokeWidth * 2) / 2,
            backgroundColor: '#fff',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Animated.Text
            style={{
              fontSize: 12,
              fontWeight: 'bold',
              color: progressColor,
            }}
          >
            {Math.round(progress)}%
          </Animated.Text>
        </View>
      </Animated.View>
    </View>
  );
};
