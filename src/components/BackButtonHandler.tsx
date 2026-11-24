//src/components/BackButtonHandler.tsx
import { useEffect, useCallback } from 'react';
import { BackHandler, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export const BackButtonHandler: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const handleBackPress = useCallback(() => {
    const currentRouteName = route.name;

    if(["Home", "HomeRoot"].includes(currentRouteName)) {
      Alert.alert(
        'Exit App',
        'Are you sure you want to exit?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: "Exit", style: 'destructive', onPress: () => BackHandler.exitApp() }
        ],
        { cancelable: true }
      );
      return true;
    }

    return false;
  }, [route.name]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => subscription.remove();
  }, [handleBackPress]);
};