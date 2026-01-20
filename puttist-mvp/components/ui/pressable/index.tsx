'use client';
import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  Vibration,
} from 'react-native';

interface PressableProps extends TouchableOpacityProps {}

export const Pressable = React.forwardRef<TouchableOpacity, PressableProps>(
  ({ children, onPress, style, ...props }, ref) => {
    const handlePress = (e: any) => {
      Vibration.vibrate(10);
      onPress?.(e);
    };

    return (
      <TouchableOpacity
        ref={ref}
        onPress={handlePress}
        activeOpacity={0.7}
        style={style}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }
);

Pressable.displayName = 'Pressable';

export default Pressable;
