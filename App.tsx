import React, { useEffect, useState, useCallback } from "react";
import { StatusBar, StyleSheet, View, Text, Image, BackHandler, Alert, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppStore } from './src/store/useAppStore';
import { Loader } from './src/components/Loader';
import { TermsModal } from './src/components/TermsModal';
import { AppNavigator } from './src/navigation/AppNavigator';
import { writeStorage } from "./src/utils/storageUtils";
import { ExitAppConfirmation } from "./src/components/ExitAppConfirmation";

// Prevent auto-hide once at module level
SplashScreen.preventAutoHideAsync();

export default function App(){
  const [isReady, setIsReady] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [appStarted, setAppStarted] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  
  const acceptedTerms = useAppStore((state: any) => state.acceptedTerms);

  const prepare = useCallback(async () => {
    try {
      // Load persisted state INTO Zustand store (single source of truth)
      await useAppStore.getState().loadFromStorage();
      
      // Re-read acceptedTerms AFTER load to ensure fresh value
      const { acceptedTerms: storedAccepted } = useAppStore.getState();
      
      if (!storedAccepted) {
        setShowTerms(true);
      } else {
        setAppStarted(true);
      }
    } catch (error) {
      console.warn('[App] Initialization failed:', error);
      // Fallback: show terms on error to ensure legal compliance
      setShowTerms(true);
    } finally {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn('[App] SplashScreen.hideAsync failed:', e);
      }
      // Simulate low-end device warm-up
      await new Promise((r) => setTimeout(r, 300));
      setIsReady(true);
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
    // ✅ Write to storage AND update store for immediate UI sync
    await writeStorage({ acceptedTerms: true });
    useAppStore.setState({ acceptedTerms: true }); 
    
    setShowTerms(false);
    setAppStarted(true);
  };

  const handleExitApp = () => {
    if (Platform.OS === 'android') {
      setShowExitConfirmation(false);
      BackHandler.exitApp();
    } else {
      Alert.alert('App Closed', 'You may now close this window.');
    }
  };

  const handleCancelExit = () => {
    setShowExitConfirmation(false);
  };

  if (!isReady) return null; 

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
          <Text style={styles.title}>Africa Hymns (Malawi)</Text>
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
    marginBottom: 24,
    textAlign: 'center'
  }
});