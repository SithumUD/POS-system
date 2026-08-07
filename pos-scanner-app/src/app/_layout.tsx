import { Stack } from 'expo-router';
import { StoreProvider } from '../contexts/StoreContext';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StoreProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerStyle: { backgroundColor: '#E6F4FE' } }}>
          <Stack.Screen name="index" options={{ title: 'Scanner', headerShown: false }} />
          <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        </Stack>
      </StoreProvider>
    </GestureHandlerRootView>
  );
}
