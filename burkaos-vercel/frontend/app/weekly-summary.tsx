import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';
import { useState, useEffect } from 'react';
import { programsAPI, exercisesAPI, workoutsAPI, coachAPI, contentAPI, analyticsAPI, extrasAPI, backupAPI, warmupAPI } from '../lib/api';

export default function WeeklySummaryScreen() {
  const router = useRouter();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.weeklySummary()
      .then(data => { setSummary(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <SafeAreaView style={styles.container}><ActivityIndicator size="large" color={Colors.primary} /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity testID="back-btn" onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>WEEKLY REVIEW</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {summary && (
          <>
            <View style={styles.periodCard}>
              <Ionicons name="calendar" size={20} color={Colors.primary} />
              <Text style={styles.periodText}>{summary.period}</Text>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{summary.total_sessions}</Text>
                <Text style={styles.statLabel}>Sessions</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{summary.total_sets}</Text>
                <Text style={styles.statLabel}>Total Sets</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{summary.total_volume?.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Volume (lbs)</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{summary.avg_sets_per_session || 0}</Text>
                <Text style={styles.statLabel}>Sets/Session</Text>
              </View>
            </View>

            {/* Muscle Groups */}
            {summary.muscle_groups_hit && Object.keys(summary.muscle_groups_hit).length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>MUSCLE GROUPS TRAINED</Text>
                <View style={styles.muscleGrid}>
                  {Object.entries(summary.muscle_groups_hit).map(([muscle, sets]: any) => (
                    <View key={muscle} style={styles.muscleChip}>
                      <Text style={styles.muscleName}>{muscle}</Text>
                      <Text style={styles.muscleSets}>{sets} sets</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Coaching Bullets */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>COACH FEEDBACK</Text>
              <View style={styles.coachCard}>
                <View style={styles.coachHeader}>
                  <View style={styles.coachAvatar}>
                    <Ionicons name="barbell" size={16} color={Colors.primaryForeground} />
                  </View>
                  <Text style={styles.coachName}>Sebastian Burka</Text>
                </View>
                {summary.coaching_bullets?.map((bullet: string, i: number) => (
                  <View key={i} style={styles.bulletRow}>
                    <View style={styles.bulletDot} />
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Recent Workouts */}
            {summary.workouts?.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>THIS WEEK'S SESSIONS</Text>
                {summary.workouts.map((w: any, i: number) => (
                  <View key={i} style={styles.workoutRow}>
                    <View style={styles.workoutInfo}>
                      <Text style={styles.workoutDay}>{w.day_name}</Text>
                      <Text style={styles.workoutMeta}>{w.total_sets} sets • {w.total_volume?.toLocaleString()} lbs</Text>
                    </View>
                    <Text style={styles.workoutDate}>
                      {w.date ? new Date(w.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : ''}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: FontSizes.lg, fontWeight: '700', color: Colors.text },
  placeholder: { width: 44 },
  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
  periodCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.lg,
    marginBottom: Spacing.xl, borderWidth: 1, borderColor: Colors.primary + '40',
  },
  periodText: { fontSize: FontSizes.base, fontWeight: '600', color: Colors.text },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing.xxl },
  statCard: {
    width: '47%', backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.xl, borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  statValue: { fontSize: FontSizes.xxxl, fontWeight: '800', color: Colors.primary },
  statLabel: { fontSize: FontSizes.xs, color: Colors.muted, marginTop: Spacing.xs, fontWeight: '600' },
  section: { marginBottom: Spacing.xxl },
  sectionTitle: { fontSize: FontSizes.xs, fontWeight: '600', color: Colors.muted, letterSpacing: 1.5, marginBottom: Spacing.md },
  muscleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  muscleChip: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm, borderWidth: 1, borderColor: Colors.border,
  },
  muscleName: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.text },
  muscleSets: { fontSize: FontSizes.xs, color: Colors.primary, marginTop: 2 },
  coachCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.xl,
    borderWidth: 1, borderColor: Colors.border,
  },
  coachHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg },
  coachAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  coachName: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.text },
  bulletRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md, alignItems: 'flex-start' },
  bulletDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary, marginTop: 7 },
  bulletText: { flex: 1, fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20 },
  workoutRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.lg,
    marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border,
  },
  workoutInfo: {},
  workoutDay: { fontSize: FontSizes.base, fontWeight: '600', color: Colors.text },
  workoutMeta: { fontSize: FontSizes.xs, color: Colors.muted, marginTop: 2 },
  workoutDate: { fontSize: FontSizes.xs, color: Colors.muted },
});
