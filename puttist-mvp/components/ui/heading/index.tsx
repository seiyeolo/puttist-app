'use client';
import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';

interface HeadingProps extends RNTextProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  bold?: boolean;
  isTruncated?: boolean;
}

const sizeMap = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 36,
};

export const Heading = React.forwardRef<RNText, HeadingProps>(
  ({ children, size = 'lg', bold = true, isTruncated, style, ...props }, ref) => {
    return (
      <RNText
        ref={ref}
        numberOfLines={isTruncated ? 1 : undefined}
        style={[
          {
            fontSize: sizeMap[size],
            fontWeight: bold ? '700' : '600',
            color: '#FFFFFF',
          },
          style,
        ]}
        {...props}
      >
        {children}
      </RNText>
    );
  }
);

Heading.displayName = 'Heading';

export default Heading;
