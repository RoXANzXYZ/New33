import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../constants/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_right',
      }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="active-workout" options={{ animation: 'slide_from_bottom', gestureEnabled: false }} />
        <Stack.Screen name="program/[id]" />
        <Stack.Screen name="exercise/[id]" />
        <Stack.Screen name="coach" />
        <Stack.Screen name="philosophy" />
        <Stack.Screen name="history" />
        <Stack.Screen name="backup" />
        <Stack.Screen name="weekly-summary" />
        <Stack.Screen name="analytics" />
        <Stack.Screen name="coach-history" />
        <Stack.Screen name="warmup" />
      </Stack>
    </>
  );
}
