'use client';
import React from 'react';
import { View, ViewProps } from 'react-native';

interface HStackProps extends ViewProps {
  space?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  reversed?: boolean;
}

const spaceMap = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
};

export const HStack = React.forwardRef<View, HStackProps>(
  ({ children, space, reversed, style, ...props }, ref) => {
    const gap = space ? spaceMap[space] : 0;

    return (
      <View
        ref={ref}
        style={[
          {
            flexDirection: reversed ? 'row-reverse' : 'row',
            alignItems: 'center',
            gap,
          },
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    );
  }
);

HStack.displayName = 'HStack';

export default HStack;
