import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { programsAPI, exercisesAPI, workoutsAPI, coachAPI, contentAPI, analyticsAPI, extrasAPI, backupAPI, warmupAPI } from '../../lib/api';

const menuSections = [
  {
    title: 'TRAINING',
    items: [
      { icon: 'trophy-outline' as const, label: 'Analytics & PRs', route: '/analytics', desc: 'Volume trends, personal records', color: '#F59E0B' },
      { icon: 'chatbubble-ellipses-outline' as const, label: 'AI Coach', route: '/coach', desc: 'Ask Burka anything', color: '#3B82F6' },
      { icon: 'chatbubbles-outline' as const, label: 'Coach History', route: '/coach-history', desc: 'Past AI conversations', color: '#8B5CF6' },
      { icon: 'analytics-outline' as const, label: 'Weekly Review', route: '/weekly-summary', desc: 'Auto-generated coaching summary', color: '#10B981' },
      { icon: 'time-outline' as const, label: 'Workout History', route: '/history', desc: 'Past sessions & performance', color: '#6366F1' },
    ],
  },
  {
    title: 'KNOWLEDGE',
    items: [
      { icon: 'school-outline' as const, label: 'Philosophy & Glossary', route: '/philosophy', desc: 'Burka training principles', color: '#EC4899' },
    ],
  },
  {
    title: 'DATA',
    items: [
      { icon: 'cloud-download-outline' as const, label: 'Backup & Restore', route: '/backup', desc: 'Export/import all data', color: '#14B8A6' },
    ],
  },
];

export default function MoreScreen() {
  const router = useRouter();

  const handleReset = () => {
    Alert.alert(
      'Reset All Data?',
      'This will permanently delete all workout history, PRs, and coach conversations. Programs and exercises will be kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await backupAPI.reset();
              const data = res;
              Alert.alert('Reset Complete', data.message || 'All data cleared.');
            } catch {
              Alert.alert('Error', 'Failed to reset. Try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>MORE</Text>
        {menuSections.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map(item => (
              <TouchableOpacity
                key={item.label}
                testID={`more-${item.label.toLowerCase().replace(/\s/g, '-')}`}
                style={styles.menuItem}
                activeOpacity={0.7}
                onPress={() => router.push(item.route as any)}
              >
                <View style={[styles.iconWrap, { backgroundColor: item.color + '15' }]}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <View style={styles.menuInfo}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuDesc}>{item.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Reset Button */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DANGER ZONE</Text>
          <TouchableOpacity
            testID="reset-app-btn"
            style={[styles.menuItem, styles.resetItem]}
            activeOpacity={0.7}
            onPress={handleReset}
          >
            <View style={[styles.iconWrap, { backgroundColor: '#EF444415' }]}>
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </View>
            <View style={styles.menuInfo}>
              <Text style={[styles.menuLabel, { color: '#EF4444' }]}>Reset App</Text>
              <Text style={styles.menuDesc}>Clear all workouts, PRs & coach history</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.versionCard}>
          <Text style={styles.versionText}>BurkaOS v1.0.0</Text>
          <Text style={styles.versionSub}>Execution First. No Junk Volume.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.xl, paddingBottom: 100 },
  title: { fontSize: FontSizes.xxxl, fontWeight: '900', color: Colors.text, letterSpacing: 1, marginBottom: Spacing.xxl },
  section: { marginBottom: Spacing.xxl },
  sectionTitle: { fontSize: 10, fontWeight: '700', color: Colors.muted, letterSpacing: 1.5, marginBottom: Spacing.md },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md, padding: Spacing.lg, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border, gap: Spacing.lg,
  },
  resetItem: { borderColor: '#EF444430' },
  iconWrap: {
    width: 40, height: 40, borderRadius: BorderRadius.sm,
    justifyContent: 'center', alignItems: 'center',
  },
  menuInfo: { flex: 1 },
  menuLabel: { fontSize: FontSizes.base, fontWeight: '600', color: Colors.text },
  menuDesc: { fontSize: FontSizes.xs, color: Colors.muted, marginTop: 2 },
  versionCard: {
    alignItems: 'center', padding: Spacing.xxl, marginTop: Spacing.xl,
  },
  versionText: { fontSize: FontSizes.sm, color: Colors.muted, fontWeight: '600' },
  versionSub: { fontSize: FontSizes.xs, color: Colors.muted, marginTop: Spacing.xs, opacity: 0.6 },
});
