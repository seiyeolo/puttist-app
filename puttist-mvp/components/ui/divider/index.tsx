'use client';
import React from 'react';
import { View, ViewProps } from 'react-native';

interface DividerProps extends ViewProps {
  orientation?: 'horizontal' | 'vertical';
}

export const Divider = React.forwardRef<View, DividerProps>(
  ({ orientation = 'horizontal', style, ...props }, ref) => {
    return (
      <View
        ref={ref}
        style={[
          orientation === 'horizontal'
            ? { height: 1, width: '100%' }
            : { width: 1, height: '100%' },
          { backgroundColor: '#2E4830' },
          style,
        ]}
        {...props}
      />
    );
  }
);

Divider.displayName = 'Divider';

export default Divider;
