'use client';
import React from 'react';
import { View, ViewProps } from 'react-native';

export const Box = React.forwardRef<View, ViewProps>(
  ({ children, ...props }, ref) => {
    return (
      <View ref={ref} {...props}>
        {children}
      </View>
    );
  }
);

Box.displayName = 'Box';

export default Box;
