import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { useState, useCallback } from 'react';
import { } from '../../constants/theme';
import { useFocusEffect } from 'expo-router';
import { programsAPI, exercisesAPI, workoutsAPI, coachAPI, contentAPI, analyticsAPI, extrasAPI, backupAPI, warmupAPI } from '../../lib/api';

const MUSCLE_COLORS: Record<string, string> = {
  'Chest': '#EF4444', 'Back': '#3B82F6', 'Shoulders': '#F59E0B', 'Biceps': '#8B5CF6',
  'Triceps': '#EC4899', 'Quads': '#22C55E', 'Hamstrings': '#14B8A6', 'Calves': '#06B6D4',
  'Core': '#F97316', 'Glutes': '#A855F7', 'Lats': '#3B82F6',
};

export default function WorkoutScreen() {
  const router = useRouter();
  const [program, setProgram] = useState<any>(null);
  const [activeWorkout, setActiveWorkout] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recovery, setRecovery] = useState<any[]>([]);

  useFocusEffect(useCallback(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [progRes, workoutRes] = await Promise.all([
          programsAPI.getActive(),
          workoutsAPI.getActive(),
        ]);
        if (progRes) setProgram(progRes);
        else setProgram(null);
        const w = workoutRes;
        setActiveWorkout(w.status !== 'none' ? w : null);
        // Fetch recovery
        try { const recRes = await analyticsAPI.muscleRecovery(); if (recRes) { const recData = recRes; setRecovery(recData.recovery || []); } } catch {}
      } catch (e) { console.log(e); }
      setLoading(false);
    };
    load();
  }, []));

  const startWorkout = async (dayNumber: number) => {
    if (!program) return;
    try {
      const res = await workoutsAPI.start(program.id, dayNumber);
      if (res) router.push('/active-workout');
    } catch (e) { console.log(e); }
  };

  const startQuickWorkout = async (dayNumber: number) => {
    if (!program) return;
    try {
      const res = await workoutsAPI.startQuick(program.id, dayNumber);
      if (res) router.push('/active-workout');
    } catch (e) { console.log(e); }
  };

  if (loading) {
    return <SafeAreaView style={styles.container}><View style={styles.centerWrap}><ActivityIndicator size="large" color={Colors.primary} /></View></SafeAreaView>;
  }

  if (activeWorkout) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.resumeScreen}>
          <View style={styles.resumeIconWrap}>
            <Ionicons name="flash" size={36} color={Colors.primary} />
          </View>
          <Text style={styles.resumeLabel}>WORKOUT IN PROGRESS</Text>
          <Text style={styles.resumeName}>{activeWorkout.day_name}</Text>
          <Text style={styles.resumeMeta}>{activeWorkout.program_name}</Text>
          <TouchableOpacity testID="resume-active-btn" style={styles.resumeBtn} activeOpacity={0.7} onPress={() => router.push('/active-workout')}>
            <Ionicons name="play" size={18} color="#FFF" />
            <Text style={styles.resumeBtnText}>RESUME SESSION</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!program) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.resumeScreen}>
          <Ionicons name="barbell-outline" size={48} color={Colors.muted} />
          <Text style={styles.emptyTitle}>No Active Program</Text>
          <Text style={styles.emptyText}>Select a program from the library to start training</Text>
          <TouchableOpacity testID="go-programs-btn" style={styles.linkBtn} activeOpacity={0.7} onPress={() => router.push('/programs')}>
            <Text style={styles.linkBtnText}>BROWSE PROGRAMS</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const trainingDays = program.days?.filter((d: any) => !d.is_rest) || [];
  const currentDay = program.current_day || 1;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>TRAIN</Text>
        <View style={styles.programPill}>
          <View style={styles.programDot} />
          <Text style={styles.programName}>{program.name}</Text>
        </View>
      </View>

      <FlatList
        data={trainingDays}
        keyExtractor={(item: any) => `day-${item.day_number}`}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Muscle Recovery */}
            {recovery.length > 0 && (
              <View style={styles.recoveryCard}>
                <Text style={styles.recoveryTitle}>MUSCLE RECOVERY</Text>
                <View style={styles.recoveryGrid}>
                  {recovery.map((r: any) => {
                    const statusColors: Record<string, string> = { fresh: '#EF4444', recovered: '#F59E0B', ready: '#22C55E', overdue: '#8B5CF6' };
                    const statusIcons: Record<string, string> = { fresh: 'flame', recovered: 'time', ready: 'checkmark-circle', overdue: 'alert-circle' };
                    const color = statusColors[r.status] || Colors.muted;
                    return (
                      <View key={r.muscle} style={styles.recoveryItem}>
                        <Ionicons name={(statusIcons[r.status] || 'ellipse') as any} size={14} color={color} />
                        <Text style={styles.recoveryMuscle}>{r.muscle}</Text>
                        <Text style={[styles.recoveryDays, { color }]}>{r.days_ago === 0 ? 'Today' : r.days_ago === 1 ? '1d ago' : `${r.days_ago}d ago`}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
            {/* Warm-Up Button */}
            <TouchableOpacity style={styles.warmupBtn} activeOpacity={0.7} onPress={() => {
              const nextDay = trainingDays.find((d: any) => d.day_number === currentDay);
              const muscles = nextDay?.muscle_groups?.join(',') || 'default';
              const progId = program?.id || '';
              router.push(`/warmup?muscle=${muscles}&program=${progId}` as any);
            }}>
              <Ionicons name="fitness-outline" size={18} color={Colors.warning} />
              <View style={styles.warmupInfo}>
                <Text style={styles.warmupLabel}>WARM-UP & STRETCHES</Text>
                <Text style={styles.warmupSub}>Pre-workout mobility routine + feeder sets</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.muted} />
            </TouchableOpacity>
          </>
        }
        renderItem={({ item }: { item: any }) => {
          const muscles = item.muscle_groups || [];
          const primaryColor = MUSCLE_COLORS[muscles[0]] || Colors.primary;
          const isNext = item.day_number === currentDay;

          return (
            <TouchableOpacity
              testID={`start-day-${item.day_number}`}
              style={[styles.dayCard, isNext && { borderColor: primaryColor + '50' }]}
              activeOpacity={0.7}
              onPress={() => startWorkout(item.day_number)}
            >
              {isNext && <View style={[styles.nextBadge, { backgroundColor: primaryColor }]}><Text style={styles.nextBadgeText}>UP NEXT</Text></View>}
              <View style={styles.dayLeft}>
                <View style={[styles.dayBadge, { backgroundColor: primaryColor + '15' }]}>
                  <Text style={[styles.dayBadgeText, { color: primaryColor }]}>D{item.day_number}</Text>
                </View>
              </View>

              <View style={styles.dayCenter}>
                <Text style={styles.dayName}>{item.name}</Text>
                <View style={styles.muscleTags}>
                  {muscles.slice(0, 3).map((m: string) => (
                    <View key={m} style={[styles.muscleTag, { backgroundColor: (MUSCLE_COLORS[m] || Colors.muted) + '15' }]}>
                      <Text style={[styles.muscleTagText, { color: MUSCLE_COLORS[m] || Colors.muted }]}>{m}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.dayStats}>{item.exercises?.length} exercises · {item.target_sets} sets</Text>
              </View>

              <View style={styles.dayRight}>
                <View style={[styles.playCircle, { backgroundColor: primaryColor }]}>
                  <Ionicons name="play" size={16} color="#FFF" style={{ marginLeft: 2 }} />
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centerWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.xl },
  title: { fontSize: FontSizes.xxxl, fontWeight: '900', color: Colors.text, letterSpacing: 1 },
  programPill: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.sm,
    backgroundColor: Colors.surface, alignSelf: 'flex-start', paddingHorizontal: Spacing.md,
    paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: Colors.border,
  },
  programDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
  programName: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontWeight: '600' },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
  // Recovery
  recoveryCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  recoveryTitle: { fontSize: 10, fontWeight: '700', color: Colors.muted, letterSpacing: 1.5, marginBottom: Spacing.md },
  recoveryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  recoveryItem: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.surfaceHighlight, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8 },
  recoveryMuscle: { fontSize: FontSizes.xs, fontWeight: '600', color: Colors.text },
  recoveryDays: { fontSize: 10, fontWeight: '600' },
  // Warm-up
  warmupBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.lg, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.warning + '30', gap: Spacing.md },
  warmupInfo: { flex: 1 },
  warmupLabel: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.warning, letterSpacing: 0.5 },
  warmupSub: { fontSize: FontSizes.xs, color: Colors.muted, marginTop: 1 },
  dayCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.lg, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, gap: Spacing.md,
    overflow: 'hidden',
  },
  nextBadge: {
    position: 'absolute', top: 0, right: 0, paddingHorizontal: 8, paddingVertical: 3,
    borderBottomLeftRadius: 8,
  },
  nextBadgeText: { fontSize: 8, fontWeight: '800', color: '#FFF', letterSpacing: 1 },
  dayLeft: {},
  dayBadge: {
    width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center',
  },
  dayBadgeText: { fontSize: FontSizes.base, fontWeight: '900', letterSpacing: 0.5 },
  dayCenter: { flex: 1 },
  dayName: { fontSize: FontSizes.base, fontWeight: '700', color: Colors.text },
  muscleTags: { flexDirection: 'row', gap: 4, marginTop: 5, flexWrap: 'wrap' },
  muscleTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  muscleTagText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  dayStats: { fontSize: FontSizes.xs, color: Colors.muted, marginTop: 4 },
  dayRight: {},
  playCircle: {
    width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center',
  },
  // Resume screen
  resumeScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xxxl },
  resumeIconWrap: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primary + '15',
    justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.xxl,
  },
  resumeLabel: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.primary, letterSpacing: 2, marginBottom: Spacing.sm },
  resumeName: { fontSize: FontSizes.xxl, fontWeight: '800', color: Colors.text, textAlign: 'center' },
  resumeMeta: { fontSize: FontSizes.sm, color: Colors.muted, marginTop: Spacing.xs },
  resumeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.primary, paddingHorizontal: Spacing.xxxl,
    paddingVertical: Spacing.lg, borderRadius: BorderRadius.md, marginTop: Spacing.xxl,
  },
  resumeBtnText: { fontSize: FontSizes.base, fontWeight: '800', color: '#FFF', letterSpacing: 1 },
  // Empty
  emptyTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.text, marginTop: Spacing.xl },
  emptyText: { fontSize: FontSizes.sm, color: Colors.muted, marginTop: Spacing.sm, textAlign: 'center' },
  linkBtn: {
    backgroundColor: Colors.primary, paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md, borderRadius: BorderRadius.md, marginTop: Spacing.xxl,
  },
  linkBtnText: { fontSize: FontSizes.sm, fontWeight: '700', color: '#FFF', letterSpacing: 1 },
});
