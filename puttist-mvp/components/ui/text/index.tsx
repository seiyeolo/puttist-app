'use client';
import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';

interface TextProps extends RNTextProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikeThrough?: boolean;
  highlight?: boolean;
  isTruncated?: boolean;
}

const sizeMap = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 24,
  '4xl': 28,
  '5xl': 32,
  '6xl': 36,
};

export const Text = React.forwardRef<RNText, TextProps>(
  (
    {
      children,
      size = 'md',
      bold,
      italic,
      underline,
      strikeThrough,
      isTruncated,
      style,
      ...props
    },
    ref
  ) => {
    return (
      <RNText
        ref={ref}
        numberOfLines={isTruncated ? 1 : undefined}
        style={[
          {
            fontSize: sizeMap[size],
            fontWeight: bold ? '700' : '400',
            fontStyle: italic ? 'italic' : 'normal',
            textDecorationLine: underline
              ? 'underline'
              : strikeThrough
                ? 'line-through'
                : 'none',
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

Text.displayName = 'Text';

export default Text;
