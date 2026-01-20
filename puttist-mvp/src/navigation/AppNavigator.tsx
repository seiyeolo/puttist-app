import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';

import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import PracticeScreen from '../screens/PracticeScreen';
import GameModeScreen from '../screens/GameModeScreen';
import DuoModeScreen from '../screens/DuoModeScreen';
import TempoScreen from '../screens/TempoScreen';
import StatsScreen from '../screens/StatsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import VisionScreen from '../screens/VisionScreen';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Practice: undefined;
  GameMode: undefined;
  DuoMode: undefined;
  Tempo: undefined;
  Stats: undefined;
  Settings: undefined;
  Vision: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Practice':
              iconName = focused ? 'golf' : 'golf-outline';
              break;
            case 'GameMode':
              iconName = focused ? 'game-controller' : 'game-controller-outline';
              break;
            case 'DuoMode':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Tempo':
              iconName = focused ? 'musical-notes' : 'musical-notes-outline';
              break;
            case 'Stats':
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
          ...SHADOWS.sm,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: '홈' }} />
      <Tab.Screen name="Practice" component={PracticeScreen} options={{ title: '연습' }} />
      <Tab.Screen name="GameMode" component={GameModeScreen} options={{ title: '게임' }} />
      <Tab.Screen name="DuoMode" component={DuoModeScreen} options={{ title: '듀오' }} />
      <Tab.Screen name="Tempo" component={TempoScreen} options={{ title: '템포' }} />
      <Tab.Screen name="Stats" component={StatsScreen} options={{ title: '통계' }} />
      <Tab.Screen 
        name="Vision" 
        component={VisionScreen} 
        options={{ 
          title: 'AI 비전',
          tabBarLabel: 'AI 비전'
        }} 
      />
    </Tab.Navigator>
  );
}

interface AppNavigatorProps {
  isAuthenticated: boolean;
}

export default function AppNavigator({ isAuthenticated }: AppNavigatorProps) {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
