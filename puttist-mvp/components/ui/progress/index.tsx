'use client';
import React from 'react';
import { View, ViewProps } from 'react-native';

type ProgressSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface ProgressProps extends ViewProps {
  value?: number;
  min?: number;
  max?: number;
  size?: ProgressSize;
  orientation?: 'horizontal' | 'vertical';
}

interface ProgressFilledTrackProps extends ViewProps {}

const sizeMap: Record<ProgressSize, number> = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  '2xl': 16,
};

const ProgressContext = React.createContext<{
  value: number;
  min: number;
  max: number;
  size: ProgressSize;
  orientation: 'horizontal' | 'vertical';
}>({
  value: 0,
  min: 0,
  max: 100,
  size: 'md',
  orientation: 'horizontal',
});

const ProgressComponent = React.forwardRef<View, ProgressProps>(
  (
    {
      value = 0,
      min = 0,
      max = 100,
      size = 'md',
      orientation = 'horizontal',
      style,
      children,
      ...props
    },
    ref
  ) => {
    const clampedValue = Math.min(Math.max(value, min), max);
    const height = sizeMap[size];

    const contextValue = React.useMemo(
      () => ({ value: clampedValue, min, max, size, orientation }),
      [clampedValue, min, max, size, orientation]
    );

    return (
      <ProgressContext.Provider value={contextValue}>
        <View
          ref={ref}
          style={[
            {
              height,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: height / 2,
              overflow: 'hidden',
              width: '100%',
            },
            style,
          ]}
          {...props}
        >
          {children}
        </View>
      </ProgressContext.Provider>
    );
  }
);

ProgressComponent.displayName = 'Progress';

const ProgressFilledTrackComponent = React.forwardRef<View, ProgressFilledTrackProps>(
  ({ style, ...props }, ref) => {
    const { value, min, max, size } = React.useContext(ProgressContext);
    const percentage = ((value - min) / (max - min)) * 100;
    const height = sizeMap[size];

    return (
      <View
        ref={ref}
        style={[
          {
            height,
            backgroundColor: '#2E7D32',
            borderRadius: height / 2,
            width: `${percentage}%`,
          },
          style,
        ]}
        {...props}
      />
    );
  }
);

ProgressFilledTrackComponent.displayName = 'ProgressFilledTrack';

export const Progress = ProgressComponent;
export const ProgressFilledTrack = ProgressFilledTrackComponent;

export default Progress;
