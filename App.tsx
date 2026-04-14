// src/App.tsx
import React, { useEffect, useState, useCallback } from "react";
import { StatusBar, StyleSheet, View, Text, Image, BackHandler, Alert, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import Constants from 'expo-constants';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppStore } from './src/store/useAppStore';
import { Loader } from './src/components/Loader';
import { TermsModal } from './src/components/TermsModal';
import { AppNavigator } from './src/navigation/AppNavigator';
import { writeStorage } from "./src/utils/storageUtils";
import { ExitAppConfirmation } from "./src/components/ExitAppConfirmation";
import { GlobalLoader } from "./src/components/GlobalLoader";

// Prevent auto-hide once at module level
SplashScreen.preventAutoHideAsync();

export default function App(){
  const [showTerms, setShowTerms] = useState(false);
  const [appStarted, setAppStarted] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  
  // ✅ Use store state for initialization and terms
  const acceptedTerms = useAppStore((state) => state.acceptedTerms);
  const isInitializing = useAppStore((state) => state.isInitializing);

  // ✅ Get App Metadata
  const appName = Constants.expoConfig?.name || 'Africa Hymns';
  const appVersion = Constants.expoConfig?.version || '1.0.0';

  const prepare = useCallback(async () => {
    try {
      // Load persisted state INTO Zustand store
      await useAppStore.getState().loadFromStorage();
      
      // Re-read acceptedTerms AFTER load
      const { acceptedTerms: storedAccepted } = useAppStore.getState();
      
      if (!storedAccepted) {
        setShowTerms(true);
      } else {
        setAppStarted(true);
      }
    } catch (error) {
      console.warn('[App] Initialization failed:', error);
      setShowTerms(true);
    } finally {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn('[App] SplashScreen.hideAsync failed:', e);
      }
    }
  }, []);

  useEffect(() => {
    prepare();
  }, [prepare]);

  useEffect(() => {
    if (!appStarted) return;
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      setShowExitConfirmation(true);
      return true;
    });
    return () => backHandler.remove();
  }, [appStarted]);

  const handleAcceptTerms = async () => {
    await writeStorage({ acceptedTerms: true });
    useAppStore.setState({ acceptedTerms: true }); 
    
    setShowTerms(false);
    setAppStarted(true);
  };

  const handleExitApp = () => {
    // ✅ Dismiss modal first
    setShowExitConfirmation(false);
    
    // ✅ Wait a few milliseconds for UI to update before exiting
    setTimeout(() => {
      if (Platform.OS === 'android') {
        BackHandler.exitApp();
      } else {
        // iOS doesn't allow programmatic exit, just show alert
        Alert.alert('App Closed', 'You may now close this window.');
      }
    }, 300);
  };

  const handleCancelExit = () => {
    setShowExitConfirmation(false);
  };

  // ✅ Show Global Loader if initializing
  if (isInitializing) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />
        <View style={styles.splashContainer}>
          <Image 
            source={require('./src/assets/images/flags/malawi-flag.png')} 
            style={styles.flag} 
            resizeMode="contain" 
          />
          <Text style={styles.title}>{appName}</Text>
          <Text style={styles.version}>v{appVersion}</Text>
          <Loader />
        </View>
      </SafeAreaProvider>
    );
  }

  // Terms flow (first-time users)
  if (!appStarted) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />
        <View style={styles.splashContainer}>
          <Image 
            source={require('./src/assets/images/flags/malawi-flag.png')} 
            style={styles.flag} 
            resizeMode="contain" 
          />
          <Text style={styles.title}>{appName}</Text>
          <Loader />
          <TermsModal 
            visible={showTerms} 
            onAccept={handleAcceptTerms} 
            onExit={handleExitApp} 
          />
        </View>
      </SafeAreaProvider>
    );
  }

  // Main app (returning users)
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppNavigator />
        <ExitAppConfirmation
          visible={showExitConfirmation}
          onConfirm={handleExitApp}
          onCancel={handleCancelExit}
        />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  flag: {
    width: 100, 
    height: 60,
    marginBottom: 20,
    borderRadius: 4
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
    textAlign: 'center'
  },
  version: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 24,
    textAlign: 'center'
  }
});