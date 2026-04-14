// src/hooks/useUpdateCheck.ts
import { useState, useEffect } from 'react';
import Constants from 'expo-constants';
import updateConfig from '@/configs/updatesConfig.json';
import { useAppStore } from '@/store/useAppStore';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

type VersionInfo = {
  version: string;
  releaseDate: string;
  required: boolean;
  notes: string[];
};

type UpdateConfigType = {
  storeLinks: { ios: string; android: string };
  versions: VersionInfo[];
};

const config = updateConfig as UpdateConfigType;

export const useUpdateCheck = () => {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [isUpdateRequired, setIsUpdateRequired] = useState(false);
  
  // Use lastSeenVersion instead of dismissed for "What's New" logic
  const { lastUpdateDismissedVersion, setLastUpdateDismissedVersion } = useAppStore();
  
  const currentVersion = Constants.expoConfig?.version || '1.0.0';
  const latestVersionInfo = config.versions[0];
  const latestVersion = latestVersionInfo?.version || '1.0.0';

  useEffect(() => {
    const compareVersions = (v1: string, v2: string) => {
      const v1Parts = v1.split('.').map(Number);
      const v2Parts = v2.split('.').map(Number);
      for (let i = 0; i < 3; i++) {
        if (v1Parts[i] > v2Parts[i]) return 1;
        if (v1Parts[i] < v2Parts[i]) return -1;
      }
      return 0;
    };

    // Check if the app version is OLDER than the config version (Remote Update Available)
    const isOlder = compareVersions(currentVersion, latestVersion) < 0;
    
    // Check if the user has NOT seen the notes for the CURRENT version (What's New)
    const isNewInstallOrUpdate = lastUpdateDismissedVersion !== currentVersion;

    if (isOlder) {
      setHasUpdate(true);
      setIsUpdateRequired(latestVersionInfo?.required || false);
    } else {
      setHasUpdate(false);
      setIsUpdateRequired(false);
    }
    
    // We can expose a separate flag for "Show What's New"
    // But for now, we'll stick to the update logic
  }, [currentVersion, latestVersion, latestVersionInfo, lastUpdateDismissedVersion]);

  const handleUpdate = () => {
    const url = Platform.OS === 'ios' 
      ? config.storeLinks.ios 
      : config.storeLinks.android;
    if (url) Linking.openURL(url);
  };

  const handleDismiss = () => {
    // Mark the CURRENT version as seen
    setLastUpdateDismissedVersion(currentVersion);
  };

  // Show toast if there is a newer version available AND user hasn't dismissed it
  const shouldShowToast = hasUpdate && lastUpdateDismissedVersion !== latestVersion;

  return {
    hasUpdate,
    isUpdateRequired,
    shouldShowToast,
    latestVersion,
    latestVersionInfo,
    allVersions: config.versions,
    handleUpdate,
    handleDismiss,
  };
};