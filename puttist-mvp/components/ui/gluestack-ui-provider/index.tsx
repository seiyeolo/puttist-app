'use client';
import React from 'react';
import { View, ViewProps } from 'react-native';

type ModeType = 'light' | 'dark' | 'system';

const GluestackUIContext = React.createContext<{
  colorMode: ModeType;
  toggleColorMode: () => void;
}>({
  colorMode: 'dark',
  toggleColorMode: () => {},
});

export const useColorMode = () => React.useContext(GluestackUIContext);

export function GluestackUIProvider({
  mode = 'dark',
  ...props
}: {
  mode?: ModeType;
  children?: React.ReactNode;
  style?: ViewProps['style'];
}) {
  const [colorMode, setColorMode] = React.useState<ModeType>(mode);

  const toggleColorMode = React.useCallback(() => {
    setColorMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const contextValue = React.useMemo(
    () => ({
      colorMode,
      toggleColorMode,
    }),
    [colorMode, toggleColorMode]
  );

  return (
    <GluestackUIContext.Provider value={contextValue}>
      <View
        style={[
          { flex: 1, height: '100%', width: '100%' },
          props.style,
        ]}
      >
        {props.children}
      </View>
    </GluestackUIContext.Provider>
  );
}
