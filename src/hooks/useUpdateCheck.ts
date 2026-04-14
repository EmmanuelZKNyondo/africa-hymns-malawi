// src/hooks/useUpdateCheck.ts
import { useState, useEffect } from 'react';
import Constants from 'expo-constants';
import updateConfig from '@/configs/updatesConfig.json';
import { useAppStore } from '@/store/useAppStore';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

// Type for the config structure
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
  const { lastUpdateDismissedVersion, setLastUpdateDismissedVersion } = useAppStore();
  
  const currentVersion = Constants.expoConfig?.version || '1.0.0';
  
  // Get the latest version from the top of the array
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

    const comparison = compareVersions(currentVersion, latestVersion);
    const isNewer = comparison < 0; // Current < Latest

    if (isNewer && latestVersionInfo) {
      setHasUpdate(true);
      setIsUpdateRequired(latestVersionInfo.required);
    } else {
      setHasUpdate(false);
      setIsUpdateRequired(false);
    }
  }, [currentVersion, latestVersion, latestVersionInfo]);

  const handleUpdate = () => {
    const url = Platform.OS === 'ios' 
      ? config.storeLinks.ios 
      : config.storeLinks.android;
    if (url) Linking.openURL(url);
  };

  const handleDismiss = () => {
    setLastUpdateDismissedVersion(latestVersion);
  };

  // Only show toast/auto-modal if user hasn't dismissed THIS specific version
  const shouldShowToast = hasUpdate && lastUpdateDismissedVersion !== latestVersion;

  return {
    hasUpdate,
    isUpdateRequired,
    shouldShowToast,
    latestVersion,
    latestVersionInfo, // Return full info for modal
    allVersions: config.versions, // Return all for About screen
    handleUpdate,
    handleDismiss,
  };
};