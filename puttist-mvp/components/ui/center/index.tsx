'use client';
import React from 'react';
import { View, ViewProps } from 'react-native';

export const Center = React.forwardRef<View, ViewProps>(
  ({ children, style, ...props }, ref) => {
    return (
      <View
        ref={ref}
        style={[
          {
            alignItems: 'center',
            justifyContent: 'center',
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

Center.displayName = 'Center';

export default Center;
