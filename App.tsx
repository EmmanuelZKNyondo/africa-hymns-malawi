import React, { use, useEffect, useState } from "react";
import { StatusBar, StyleSheet, View, Text, Image, BackHandler, Alert, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Loader } from '@/components/Loader';
import { TermsModal } from '@/components/TermsModal';
import { AppNavigator } from '@/navigation/AppNavigator';
import { readStorage, writeStorage } from "@/utils/storate.utils";
import { ExitAppConfirmation } from "@/components/ExitAppConfirmation";

SplashScreen.preventAutoHideAsync();

export default function App(){
  const [isReady, setIsReady] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [appStarted, setAppStarted] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);

  useEffect(() => {
    async function prepare() {
      try{
        const data = await readStorage();
        if(!data.acceptedTerms) setShowTerms(true);
        setAppStarted(!!data.acceptedTerms);
      } finally{
        await new Promise((r) => setTimeout(r, 500)); // simu low-end device warm-up /asset hydration
        setIsReady(true);
      }
    }

    prepare()
  }, []);

  const handleAcceptTerms = async () => {
    await writeStorage({ acceptedTerms: true });
    setShowTerms(false);
    setAppStarted(true);
    await SplashScreen.hideAsync();
  };

  const handleExitApp = () => {
    if (Platform.OS === 'android') {
      BackHandler.exitApp();
    } else {
      // iOS: minimal fallback (can't truly exit)
      Alert.alert('App Closed', 'You may now close this window.');
    }
  };

  const handleCancelExit = () => {
    setShowExitConfirmation(false);
  };

  if (!isReady) return null; 

  if(!appStarted && showTerms) {
    return(
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />

        <View style={styles.splashContainer}>
          <Image source={require('@/assets/images/malawi-flag.png')} style={styles.flag} resizeMode="contain" />
          <Text style={styles.title}>Africa Hymns (Malawi)</Text>
          <Loader />
          <TermsModal visible={showTerms} onAccept={handleAcceptTerms} onExit={handleExitApp} />
        </View>
      </SafeAreaProvider>
    );
  }

  return(
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
    backgroundColor: '#f8f9f0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  flag: {
    width: 80, 
    height: 50,
    marginBottom: 16
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 24
  }
});