import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.muted,
      tabBarLabelStyle: styles.tabLabel,
    }}>
      <Tabs.Screen name="index" options={{
        title: 'Home',
        tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
      }} />
      <Tabs.Screen name="programs" options={{
        title: 'Programs',
        tabBarIcon: ({ color, size }) => <Ionicons name="barbell-outline" size={size} color={color} />,
      }} />
      <Tabs.Screen name="workout" options={{
        title: 'Train',
        tabBarIcon: ({ color, focused }) => (
          <View style={[styles.trainIcon, focused && styles.trainIconActive]}>
            <Ionicons name="flash" size={24} color={focused ? Colors.primaryForeground : Colors.text} />
          </View>
        ),
      }} />
      <Tabs.Screen name="exercises" options={{
        title: 'Library',
        tabBarIcon: ({ color, size }) => <Ionicons name="book-outline" size={size} color={color} />,
      }} />
      <Tabs.Screen name="extras" options={{
        title: 'Extras',
        tabBarIcon: ({ color, size }) => <Ionicons name="fitness-outline" size={size} color={color} />,
      }} />
      <Tabs.Screen name="more" options={{
        title: 'More',
        tabBarIcon: ({ color, size }) => <Ionicons name="ellipsis-horizontal" size={size} color={color} />,
      }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0D0D14',
    borderTopColor: Colors.border,
    borderTopWidth: 0.5,
    height: 88,
    paddingBottom: 28,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  trainIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -4,
  },
  trainIconActive: {
    backgroundColor: Colors.primary,
  },
});
