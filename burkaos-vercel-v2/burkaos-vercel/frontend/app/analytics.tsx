import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';
import { useState, useEffect } from 'react';
import { programsAPI, exercisesAPI, workoutsAPI, coachAPI, contentAPI, analyticsAPI, extrasAPI, backupAPI, warmupAPI } from '../lib/api';

const MUSCLE_COLORS: Record<string, string> = {
  'Chest': '#EF4444', 'Back': '#3B82F6', 'Shoulders': '#F59E0B', 'Biceps': '#8B5CF6',
  'Triceps': '#EC4899', 'Quads': '#22C55E', 'Hamstrings': '#14B8A6', 'Calves': '#06B6D4',
  'Core': '#F97316', 'Glutes': '#A855F7', 'Lats': '#3B82F6',
};

export default function AnalyticsScreen() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.analytics()
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <SafeAreaView style={styles.container}><View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View></SafeAreaView>;
  }

  const maxVol = Math.max(...(data.volume_trend?.map((v: any) => v.volume) || [1]));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity testID="back-btn" onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>ANALYTICS</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Overview Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{data.total_sessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{data.total_sets}</Text>
            <Text style={styles.statLabel}>Total Sets</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: Colors.primary }]}>{data.current_streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{(data.total_volume || 0).toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Vol (lbs)</Text>
          </View>
        </View>

        {/* Volume Trend */}
        {data.volume_trend?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>VOLUME TREND</Text>
            <View style={styles.chartCard}>
              <View style={styles.barChart}>
                {data.volume_trend.map((v: any, i: number) => {
                  const pct = maxVol > 0 ? (v.volume / maxVol) * 100 : 0;
                  return (
                    <View key={i} style={styles.barCol}>
                      <Text style={styles.barValue}>{(v.volume / 1000).toFixed(0)}k</Text>
                      <View style={styles.barTrack}>
                        <View style={[styles.barFill, { height: `${Math.max(pct, 5)}%` }]} />
                      </View>
                      <Text style={styles.barLabel}>{v.day_name?.slice(0, 3)}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* Muscle Distribution */}
        {Object.keys(data.muscle_sets || {}).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>MUSCLE DISTRIBUTION</Text>
            <View style={styles.muscleCard}>
              {Object.entries(data.muscle_sets)
                .sort(([, a]: any, [, b]: any) => b - a)
                .map(([muscle, sets]: any) => {
                  const totalMSets = Object.values(data.muscle_sets as Record<string, number>).reduce((a: number, b: number) => a + b, 0);
                  const pct = totalMSets > 0 ? Math.round((sets / totalMSets) * 100) : 0;
                  const color = MUSCLE_COLORS[muscle] || Colors.primary;
                  return (
                    <View key={muscle} style={styles.muscleRow}>
                      <View style={styles.muscleLeft}>
                        <View style={[styles.muscleDot, { backgroundColor: color }]} />
                        <Text style={styles.muscleName}>{muscle}</Text>
                      </View>
                      <View style={styles.muscleBarWrap}>
                        <View style={[styles.muscleBar, { width: `${pct}%`, backgroundColor: color + '80' }]} />
                      </View>
                      <Text style={styles.muscleSets}>{sets} sets</Text>
                    </View>
                  );
                })}
            </View>
          </View>
        )}

        {/* Personal Records */}
        {data.prs?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>PERSONAL RECORDS</Text>
            <View style={styles.prCard}>
              {data.prs.map((pr: any, i: number) => (
                <View key={i} style={[styles.prRow, i > 0 && styles.prBorder]}>
                  <View style={styles.prRank}>
                    <Text style={styles.prRankText}>{i + 1}</Text>
                  </View>
                  <View style={styles.prInfo}>
                    <Text style={styles.prName}>{pr.exercise}</Text>
                    <Text style={styles.prDate}>{pr.date}</Text>
                  </View>
                  <View style={styles.prStats}>
                    <Text style={styles.prWeight}>{pr.weight}<Text style={styles.prUnit}> lbs</Text></Text>
                    <Text style={styles.prReps}>× {pr.reps} reps</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {data.total_sessions === 0 && (
          <View style={styles.emptyWrap}>
            <Ionicons name="analytics-outline" size={48} color={Colors.muted} />
            <Text style={styles.emptyTitle}>No Data Yet</Text>
            <Text style={styles.emptyText}>Complete workouts to see your analytics, PRs, and progress.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.surface },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  title: { flex: 1, textAlign: 'center', fontSize: FontSizes.base, fontWeight: '700', color: Colors.text, letterSpacing: 0.5 },
  scroll: { padding: Spacing.xl, paddingBottom: 100 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xxl },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  statNum: { fontSize: FontSizes.xxl, fontWeight: '900', color: Colors.text },
  statLabel: { fontSize: 9, fontWeight: '600', color: Colors.muted, letterSpacing: 0.5, marginTop: 4 },
  section: { marginBottom: Spacing.xxl },
  sectionLabel: { fontSize: 10, fontWeight: '700', color: Colors.muted, letterSpacing: 1.5, marginBottom: Spacing.md },
  chartCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 140 },
  barCol: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  barValue: { fontSize: 8, color: Colors.muted, marginBottom: 4 },
  barTrack: { width: '80%', flex: 1, backgroundColor: Colors.surfaceHighlight, borderRadius: 4, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', backgroundColor: Colors.primary, borderRadius: 4, minHeight: 4 },
  barLabel: { fontSize: 8, color: Colors.muted, marginTop: 4, fontWeight: '600' },
  muscleCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, gap: Spacing.md },
  muscleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  muscleLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, width: 100 },
  muscleDot: { width: 8, height: 8, borderRadius: 4 },
  muscleName: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.text },
  muscleBarWrap: { flex: 1, height: 8, backgroundColor: Colors.surfaceHighlight, borderRadius: 4, overflow: 'hidden' },
  muscleBar: { height: 8, borderRadius: 4 },
  muscleSets: { fontSize: FontSizes.xs, color: Colors.muted, fontWeight: '600', width: 50, textAlign: 'right' },
  prCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  prRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, gap: Spacing.md },
  prBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  prRank: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary + '15', justifyContent: 'center', alignItems: 'center' },
  prRankText: { fontSize: FontSizes.sm, fontWeight: '800', color: Colors.primary },
  prInfo: { flex: 1 },
  prName: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.text },
  prDate: { fontSize: 10, color: Colors.muted, marginTop: 1 },
  prStats: { alignItems: 'flex-end' },
  prWeight: { fontSize: FontSizes.base, fontWeight: '800', color: Colors.success },
  prUnit: { fontSize: 10, fontWeight: '500', color: Colors.muted },
  prReps: { fontSize: 10, color: Colors.muted, marginTop: 1 },
  emptyWrap: { alignItems: 'center', padding: Spacing.xxxl, gap: Spacing.md },
  emptyTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.text },
  emptyText: { fontSize: FontSizes.sm, color: Colors.muted, textAlign: 'center' },
});
