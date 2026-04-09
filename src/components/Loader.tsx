import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';

export const Loader: React.FC = () => {
  const scale = useSharedValue(1);
  const [reanimatedReady, setReanimatedReady] = React.useState(true);

  React.useEffect(() => {
    try{
      scale.value = withRepeat(
        withSequence(withTiming(0.6, { duration: 400 }), withTiming(1, { duration: 400 })),
        -1,
        true
      );
    } catch (error) {
      console.warn('[Loader] Reanimated failed, using fallback:', error);
      setReanimatedReady(false);
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  if (!reanimatedReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007A3D" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.circle, animatedStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  circle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF'
  }
});