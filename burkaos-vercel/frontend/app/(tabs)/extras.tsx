import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { programsAPI, exercisesAPI, workoutsAPI, coachAPI, contentAPI, analyticsAPI, extrasAPI, backupAPI, warmupAPI } from '../../lib/api';

const AB_ROUTINE = {
  title: 'Ab Circuit',
  type: 'abs',
  frequency: '2x per week',
  note: 'Perform before or after any training day. Burka recommends pairing with leg days or as a standalone session.',
  exercises: [
    { name: 'Hanging Leg Raise', sets: '3 sets', reps: '10-15 reps', tempo: '2-1-1-1', rest: '60 sec',
      cues: 'No swinging. Curl your pelvis UP toward your ribcage. Control the negative. If you can\'t do 10 reps strict, use the captain\'s chair or bent knees.',
      video: 'https://www.youtube.com/watch?v=LXGNs4wstLg', icon: 'body-outline' as const, color: '#EF4444' },
    { name: 'Cable Crunch / Ab Crunch Machine', sets: '3 sets', reps: '12-20 reps', tempo: '2-1-1-2', rest: '60 sec',
      cues: 'Think ribs to pelvis. Exhale HARD at peak contraction — squeeze for 2 seconds. Don\'t just bend at the hips, actually crunch your abs.',
      video: 'https://www.youtube.com/watch?v=-32KVcv4vro', icon: 'fitness-outline' as const, color: '#F59E0B' },
    { name: 'Pallof Press (Anti-Rotation)', sets: '2 sets each side', reps: '10-12 reps', tempo: '2-2-2-0', rest: '45 sec',
      cues: 'Press cable out from chest, hold. Resist rotation. Keep hips square. Brace your core — this is anti-rotation training, not a chest press.',
      video: '', icon: 'shield-outline' as const, color: '#3B82F6' },
  ],
};

const CALF_ROUTINE = {
  title: 'Calf Protocol',
  type: 'calves',
  frequency: '2-3x per week',
  note: 'From the Bro Split 2.0 PDF. Calves respond to DEEP stretches and controlled reps. No bouncing half-reps. Leave your ego at the door.',
  exercises: [
    { name: 'Straight Leg Calf Raise (Gastrocnemius)', sets: '3 sets', reps: '10-15 reps', tempo: '1-3-1-2', rest: '90 sec',
      cues: 'FULL ROM. 3-second hold at the BOTTOM stretch — this is where the magic happens. Controlled concentric, 2-second squeeze at the top. Heel elevation mandatory.',
      video: 'https://www.youtube.com/watch?v=SP-TwvGXIvw', icon: 'footsteps-outline' as const, color: '#06B6D4' },
    { name: 'Seated Calf Raise (Soleus)', sets: '3 sets', reps: '15-20 reps', tempo: '1-3-1-1', rest: '60 sec',
      cues: 'Seated targets the soleus (deeper calf muscle). Same rules: 3-second stretch hold at the bottom. Full ROM, no bouncing. The soleus responds to higher reps.',
      video: '', icon: 'resize-outline' as const, color: '#8B5CF6' },
  ],
};

export default function ExtrasScreen() {
  const [completedAbs, setCompletedAbs] = useState<Set<number>>(new Set());
  const [completedCalves, setCompletedCalves] = useState<Set<number>>(new Set());
  const [status, setStatus] = useState<any>(null);

  useFocusEffect(useCallback(() => {
    fetchStatus();
  }, []));

  const fetchStatus = async () => {
    try {
      const res = await extrasAPI.status();
      if (res) setStatus(res);
    } catch {}
  };

  const toggleExercise = (routine: 'abs' | 'calves', idx: number) => {
    if (routine === 'abs') {
      const next = new Set(completedAbs);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      setCompletedAbs(next);
    } else {
      const next = new Set(completedCalves);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      setCompletedCalves(next);
    }
  };

  const finishRoutine = async (routineType: 'abs' | 'calves') => {
    try {
      await extrasAPI.log(routineType);
      if (routineType === 'abs') setCompletedAbs(new Set());
      else setCompletedCalves(new Set());
      fetchStatus();
      Alert.alert('Routine Logged', `${routineType === 'abs' ? 'Ab' : 'Calf'} routine marked as complete for today.`);
    } catch {}
  };

  const renderRoutine = (
    routine: typeof AB_ROUTINE,
    completed: Set<number>,
    routineType: 'abs' | 'calves'
  ) => {
    const allDone = completed.size >= routine.exercises.length;
    const weeklyInfo = status?.[routineType];
    return (
      <View style={s.routineCard} data-testid={`routine-${routineType}`}>
        <View style={s.routineHeader}>
          <View>
            <Text style={s.routineTitle}>{routine.title}</Text>
            <View style={s.freqRow}>
              <Ionicons name="calendar-outline" size={12} color={Colors.primary} />
              <Text style={s.freqText}>{routine.frequency}</Text>
            </View>
          </View>
          {weeklyInfo && (
            <View style={s.weeklyBadge}>
              <Text style={s.weeklyCount}>{weeklyInfo.done_this_week}/{weeklyInfo.target}</Text>
              <Text style={s.weeklyLabel}>this week</Text>
            </View>
          )}
        </View>
        <Text style={s.routineNote}>{routine.note}</Text>

        {routine.exercises.map((ex, i) => {
          const done = completed.has(i);
          return (
            <TouchableOpacity key={i} style={[s.exCard, done && s.exCardDone]} activeOpacity={0.7}
              onPress={() => toggleExercise(routineType, i)} data-testid={`exercise-${routineType}-${i}`}>
              <View style={s.exTop}>
                <View style={[s.exIcon, { backgroundColor: ex.color + '15' }]}>
                  {done ? <Ionicons name="checkmark" size={16} color={Colors.success} /> : <Ionicons name={ex.icon} size={16} color={ex.color} />}
                </View>
                <View style={s.exInfo}>
                  <Text style={[s.exName, done && s.exNameDone]}>{ex.name}</Text>
                  <View style={s.exMeta}>
                    <Text style={s.exMetaText}>{ex.sets}</Text>
                    <Text style={s.exMetaDot}>·</Text>
                    <Text style={s.exMetaText}>{ex.reps}</Text>
                    <Text style={s.exMetaDot}>·</Text>
                    <Text style={s.exMetaText}>{ex.tempo}</Text>
                  </View>
                </View>
                {ex.video ? (
                  <TouchableOpacity onPress={() => Linking.openURL(ex.video)} style={s.videoBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="logo-youtube" size={18} color="#FF0000" />
                  </TouchableOpacity>
                ) : null}
              </View>
              <View style={s.cueBox}>
                <Ionicons name="information-circle-outline" size={12} color={Colors.primary} />
                <Text style={s.cueText}>{ex.cues}</Text>
              </View>
              <View style={s.restRow}>
                <Ionicons name="timer-outline" size={11} color={Colors.muted} />
                <Text style={s.restText}>Rest: {ex.rest}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Complete Routine Button */}
        <TouchableOpacity
          data-testid={`finish-${routineType}-btn`}
          style={[s.finishBtn, !allDone && s.finishBtnDisabled]}
          activeOpacity={0.7}
          disabled={!allDone}
          onPress={() => finishRoutine(routineType)}
        >
          <Ionicons name="checkmark-circle" size={18} color={allDone ? '#FFF' : Colors.muted} />
          <Text style={[s.finishBtnText, !allDone && s.finishBtnTextDisabled]}>
            {allDone ? 'LOG ROUTINE COMPLETE' : `Complete all exercises (${completed.size}/${routine.exercises.length})`}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <Text style={s.title}>EXTRAS</Text>
        <Text style={s.subtitle}>Ab & Calf add-ons from the Burka PDFs</Text>

        {renderRoutine(AB_ROUTINE, completedAbs, 'abs')}
        {renderRoutine(CALF_ROUTINE, completedCalves, 'calves')}

        <View style={s.tipCard}>
          <Ionicons name="bulb-outline" size={16} color={Colors.warning} />
          <View style={s.tipContent}>
            <Text style={s.tipTitle}>BURKA'S ADVICE</Text>
            <Text style={s.tipText}>Abs and calves are the most neglected muscle groups. Train them consistently 2-3x per week with FULL ROM and controlled tempo. Calves especially respond to deep stretches — hold the bottom position for 3 seconds minimum. No bouncing. No half-reps.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.xl, paddingBottom: 100 },
  title: { fontSize: FontSizes.xxxl, fontWeight: '900', color: Colors.text, letterSpacing: 1 },
  subtitle: { fontSize: FontSizes.sm, color: Colors.muted, marginTop: Spacing.xs, marginBottom: Spacing.xxl },
  routineCard: { marginBottom: Spacing.xxl },
  routineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  routineTitle: { fontSize: FontSizes.xl, fontWeight: '800', color: Colors.text },
  freqRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  freqText: { fontSize: FontSizes.xs, color: Colors.primary, fontWeight: '600' },
  weeklyBadge: { alignItems: 'center', backgroundColor: Colors.primary + '12', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  weeklyCount: { fontSize: FontSizes.lg, fontWeight: '800', color: Colors.primary },
  weeklyLabel: { fontSize: 9, fontWeight: '600', color: Colors.muted, letterSpacing: 0.3 },
  routineNote: { fontSize: FontSizes.sm, color: Colors.muted, lineHeight: 20, marginBottom: Spacing.lg },
  exCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  exCardDone: { borderColor: Colors.success + '40', backgroundColor: Colors.success + '05' },
  exTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  exIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  exInfo: { flex: 1 },
  exName: { fontSize: FontSizes.base, fontWeight: '700', color: Colors.text },
  exNameDone: { textDecorationLine: 'line-through', color: Colors.muted },
  exMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  exMetaText: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  exMetaDot: { fontSize: FontSizes.xs, color: Colors.muted },
  videoBtn: { padding: 4 },
  cueBox: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md, backgroundColor: Colors.primary + '06', borderRadius: BorderRadius.sm, padding: Spacing.md, borderLeftWidth: 2, borderLeftColor: Colors.primary + '30' },
  cueText: { flex: 1, fontSize: FontSizes.xs, color: Colors.textSecondary, lineHeight: 18 },
  restRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.sm },
  restText: { fontSize: FontSizes.xs, color: Colors.muted },
  finishBtn: { backgroundColor: Colors.success, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.lg, borderRadius: BorderRadius.md, marginTop: Spacing.md },
  finishBtnDisabled: { backgroundColor: Colors.surfaceHighlight },
  finishBtnText: { fontSize: FontSizes.sm, fontWeight: '800', color: '#FFF', letterSpacing: 0.5 },
  finishBtnTextDisabled: { color: Colors.muted },
  tipCard: { flexDirection: 'row', gap: Spacing.md, backgroundColor: Colors.warning + '08', borderRadius: BorderRadius.lg, padding: Spacing.lg, borderLeftWidth: 3, borderLeftColor: Colors.warning + '40' },
  tipContent: { flex: 1 },
  tipTitle: { fontSize: 10, fontWeight: '700', color: Colors.warning, letterSpacing: 1, marginBottom: Spacing.sm },
  tipText: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20 },
});
