import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';
import { useState, useEffect } from 'react';
import { programsAPI, exercisesAPI, workoutsAPI, coachAPI, contentAPI, analyticsAPI, extrasAPI, backupAPI, warmupAPI } from '../lib/api';

export default function HistoryScreen() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    workoutsAPI.history(50)
      .then(data => { setWorkouts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatDuration = (start: string, end: string) => {
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const mins = Math.round(ms / 60000);
    return mins > 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity testID="back-btn" onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>WORKOUT HISTORY</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? <ActivityIndicator size="large" color={Colors.primary} /> : (
        <FlatList
          data={workouts}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Ionicons name="barbell-outline" size={48} color={Colors.muted} />
              <Text style={styles.emptyText}>No workouts yet</Text>
              <Text style={styles.emptySub}>Stop reading and go train.</Text>
            </View>
          }
          renderItem={({ item }: { item: any }) => (
            <View style={styles.card} testID={`history-${item.id}`}>
              <View style={styles.cardHeader}>
                <Text style={styles.dayName}>{item.day_name}</Text>
                <Text style={styles.date}>{item.completed_at ? formatDate(item.completed_at) : ''}</Text>
              </View>
              <Text style={styles.program}>{item.program_name}</Text>
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{item.summary?.total_sets || 0}</Text>
                  <Text style={styles.statLabel}>Sets</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{item.summary?.total_volume ? Math.round(item.summary.total_volume).toLocaleString() : '0'}</Text>
                  <Text style={styles.statLabel}>Volume (lbs)</Text>
                </View>
                {item.started_at && item.completed_at && (
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>{formatDuration(item.started_at, item.completed_at)}</Text>
                    <Text style={styles.statLabel}>Duration</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: FontSizes.lg, fontWeight: '700', color: Colors.text },
  placeholder: { width: 44 },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
  card: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.xl,
    marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  dayName: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.text },
  date: { fontSize: FontSizes.sm, color: Colors.muted },
  program: { fontSize: FontSizes.sm, color: Colors.primary, marginBottom: Spacing.md },
  statsRow: { flexDirection: 'row', gap: Spacing.xl },
  stat: {},
  statValue: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.text },
  statLabel: { fontSize: FontSizes.xs, color: Colors.muted },
  emptyCard: { alignItems: 'center', paddingVertical: Spacing.section },
  emptyText: { fontSize: FontSizes.lg, color: Colors.muted, marginTop: Spacing.lg },
  emptySub: { fontSize: FontSizes.sm, color: Colors.muted, marginTop: Spacing.xs, opacity: 0.6 },
});
