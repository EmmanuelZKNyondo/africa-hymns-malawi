// src/navigation/AppNavigator.tsx
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '@/screens/HomeScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { HymnListScreen } from '@/screens/HymnListScreen';
import { DrawerContent } from '@/navigation/DrawerContent';
import { NavbarHeader } from '@/components/NavbarHeader';
import { HymnDetailScreen } from '@/screens/HymnDetailScreen';
import { PrayersScreen } from '@/screens/PrayersScreen';
import { PrayerDetailScreen } from '@/screens/PrayerDetailScreen';
import { FavoritesScreen } from '@/screens/FavoritesScreen';

/* ==================== PARAM LISTS ==================== */
export type HomeStackParamList = {
  HomeRoot: undefined;
  HymnList: {
    countryCode: string;
    languageCode: string;
    languageName: string;
  };
  HymnDetail: {
    hymn: any;
    countryCode: string;
    languageCode: string;
  };
  Prayers: undefined;
  PrayerDetail: {
    prayerId: string;
  };
  Favorites: undefined;
  FamousSongs: undefined;
  Settings: undefined;
};

export type RootDrawerParamList = {
  Home: undefined;
  Settings: undefined;
};

const Drawer = createDrawerNavigator<RootDrawerParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();

/* ==================== HOME STACK ==================== */
const HomeStackNavigator = () => (
  <HomeStack.Navigator
    screenOptions={{
      headerShown: true,
      // ✅ Use custom header component as default
      header: (props) => (
        <NavbarHeader
          title={props.route.name === 'HomeRoot' ? 'Africa Hymns' : 'Hymns'}
          showBack={props.navigation.canGoBack()}
          onBack={props.navigation.goBack}
        />
      ),
    }}
  >
    <HomeStack.Screen 
      name="HomeRoot" 
      component={HomeScreen} 
      options={{ 
        header: () => null // HomeScreen handles its own header via NavbarHeader if needed
      }} 
    />
    <HomeStack.Screen 
      name="HymnList" 
      component={HymnListScreen}
      options={{ header: () => null }} 
    />
    <HomeStack.Screen 
      name="HymnDetail"
      component={HymnDetailScreen}
      options={{header: () => null}}
    />
    <HomeStack.Screen 
      name="Prayers"
      component={PrayersScreen}
      options={{header: () => null}}
    />
    <HomeStack.Screen 
      name="Favorites"
      component={FavoritesScreen}
      options={{header: () => null}}
    />
    <HomeStack.Screen 
      name="Settings"
      component={SettingsScreen}
      options={{header: () => {}}}
    />
    <HomeStack.Screen 
      name="PrayerDetail"
      component={PrayerDetailScreen}
      options={{header: () => {}}}
    />
  </HomeStack.Navigator>
);

/* ==================== MAIN DRAWER ==================== */
export const AppNavigator: React.FC = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        drawerPosition: 'left',
        drawerStyle: { width: 280, backgroundColor: '#fff' },
        headerShown: true,
        header: (props) => (
          <NavbarHeader
            title="Africa Hymns"
            subtitle="Worship • Study • Unity"
            showBack={false} // Drawer screens usually don't need back button
            rightIcon="menu"
            onRightPress={() => props.navigation.openDrawer()}
          />
        ),
      }}
    >
      <Drawer.Screen name="Home" component={HomeStackNavigator} options={{ header: () => null }} />
      <Drawer.Screen name="Settings" component={SettingsScreen} options={{ header: () => null }} />
    </Drawer.Navigator>
  );
};