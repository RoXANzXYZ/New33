import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';
import { useState, useEffect } from 'react';
import { programsAPI, exercisesAPI, workoutsAPI, coachAPI, contentAPI, analyticsAPI, extrasAPI, backupAPI, warmupAPI } from '../lib/api';

export default function WarmupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const muscleGroup = (params.muscle as string) || 'default';
  const programId = (params.program as string) || '';
  const [stretches, setStretches] = useState<any[]>([]);
  const [warmupNote, setWarmupNote] = useState('');
  const [dayType, setDayType] = useState('');
  const [loading, setLoading] = useState(true);
  const [completedIdx, setCompletedIdx] = useState<Set<number>>(new Set());

  useEffect(() => {
    Promise.resolve(warmupAPI.get(muscleGroup, programId))
      .then(r => r.json())
      .then(d => {
        setStretches(d.stretches || []);
        setWarmupNote(d.note || '');
        setDayType(d.day_type || '');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [muscleGroup, programId]);

  const allDone = completedIdx.size >= stretches.length && stretches.length > 0;

  const toggleDone = (idx: number) => {
    const next = new Set(completedIdx);
    if (next.has(idx)) next.delete(idx); else next.add(idx);
    setCompletedIdx(next);
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>WARM-UP</Text>
          <Text style={s.headerSub}>{dayType === 'upper' ? 'Upper Body' : dayType === 'lower' ? 'Lower Body' : muscleGroup.replace(/,/g, ' · ')} · Pre-Workout</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          <View style={s.intro}>
            <Ionicons name="fitness-outline" size={20} color={Colors.primary} />
            <Text style={s.introText}>{warmupNote || "Complete these before your working sets. Focus on controlled movements — no bouncing."}</Text>
          </View>

          {stretches.map((st, i) => {
            const done = completedIdx.has(i);
            return (
              <TouchableOpacity
                key={i}
                style={[s.stretchCard, done && s.stretchDone]}
                activeOpacity={0.7}
                onPress={() => toggleDone(i)}
              >
                <View style={[s.stretchNum, done && s.stretchNumDone]}>
                  {done ? <Ionicons name="checkmark" size={16} color="#FFF" /> : <Text style={s.stretchNumText}>{i + 1}</Text>}
                </View>
                <View style={s.stretchInfo}>
                  <View style={s.stretchTop}>
                    <Text style={[s.stretchName, done && s.stretchNameDone]}>{st.name}</Text>
                    <View style={s.stretchActions}>
                      {st.video ? (
                        <TouchableOpacity onPress={() => Linking.openURL(st.video)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                          <Ionicons name="logo-youtube" size={16} color="#FF0000" />
                        </TouchableOpacity>
                      ) : null}
                      <View style={s.durationBadge}>
                        <Ionicons name="timer-outline" size={10} color={Colors.primary} />
                        <Text style={s.durationText}>{st.duration}</Text>
                      </View>
                    </View>
                  </View>
                  <Text style={s.stretchDesc}>{st.desc}</Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {allDone && (
            <View style={s.doneCard}>
              <Ionicons name="checkmark-circle" size={28} color={Colors.success} />
              <Text style={s.doneTitle}>Warm-Up Complete!</Text>
              <Text style={s.doneText}>You're ready to train. Get after it.</Text>
              <TouchableOpacity style={s.doneBtn} onPress={() => router.back()}>
                <Text style={s.doneBtnText}>START TRAINING</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Feeder Sets Info */}
          <View style={s.feederCard}>
            <View style={s.feederHeader}>
              <Ionicons name="barbell-outline" size={16} color={Colors.warning} />
              <Text style={s.feederTitle}>FEEDER SETS (Before First Working Set)</Text>
            </View>
            <Text style={s.feederDesc}>After stretching, do 3-4 feeder sets before your first working set:</Text>
            <View style={s.feederSteps}>
              {['Empty bar / very light — 6 reps', '40% working weight — 6 reps', '60% working weight — 4 reps', '80% working weight — 3 reps'].map((step, i) => (
                <View key={i} style={s.feederStep}>
                  <View style={s.feederDot}><Text style={s.feederDotText}>{i + 1}</Text></View>
                  <Text style={s.feederStepText}>{step}</Text>
                </View>
              ))}
            </View>
            <Text style={s.feederNote}>Keep these EASY. The goal is to acclimate your nervous system, not to fatigue.</Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.surface },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: FontSizes.base, fontWeight: '700', color: Colors.text, letterSpacing: 0.5 },
  headerSub: { fontSize: FontSizes.xs, color: Colors.muted, marginTop: 2 },
  scroll: { padding: Spacing.xl, paddingBottom: 100 },
  intro: { flexDirection: 'row', gap: Spacing.md, backgroundColor: Colors.primary + '08', borderRadius: BorderRadius.md, padding: Spacing.lg, marginBottom: Spacing.xl, borderLeftWidth: 3, borderLeftColor: Colors.primary + '40' },
  introText: { flex: 1, fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20 },
  watchBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.xl, borderWidth: 1, borderColor: '#FF000020' },
  watchBtnText: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.text },
  stretchCard: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.lg, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border, gap: Spacing.md },
  stretchDone: { borderColor: Colors.success + '40', backgroundColor: Colors.success + '05' },
  stretchNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.surfaceHighlight, justifyContent: 'center', alignItems: 'center' },
  stretchNumDone: { backgroundColor: Colors.success },
  stretchNumText: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.primary },
  stretchInfo: { flex: 1 },
  stretchTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  stretchName: { fontSize: FontSizes.base, fontWeight: '600', color: Colors.text, flex: 1 },
  stretchNameDone: { textDecorationLine: 'line-through', color: Colors.muted },
  stretchActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  durationBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.primary + '12', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  durationText: { fontSize: 10, fontWeight: '600', color: Colors.primaryLight },
  stretchDesc: { fontSize: FontSizes.xs, color: Colors.muted, lineHeight: 18 },
  doneCard: { alignItems: 'center', backgroundColor: Colors.success + '08', borderRadius: BorderRadius.lg, padding: Spacing.xxl, marginVertical: Spacing.xl, borderWidth: 1, borderColor: Colors.success + '30', gap: Spacing.sm },
  doneTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.success },
  doneText: { fontSize: FontSizes.sm, color: Colors.muted },
  doneBtn: { backgroundColor: Colors.success, paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, marginTop: Spacing.md },
  doneBtnText: { fontSize: FontSizes.sm, fontWeight: '800', color: '#FFF', letterSpacing: 1 },
  feederCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, marginTop: Spacing.md },
  feederHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  feederTitle: { fontSize: 10, fontWeight: '700', color: Colors.warning, letterSpacing: 1 },
  feederDesc: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginBottom: Spacing.md },
  feederSteps: { gap: Spacing.sm },
  feederStep: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  feederDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.warning + '15', justifyContent: 'center', alignItems: 'center' },
  feederDotText: { fontSize: 10, fontWeight: '700', color: Colors.warning },
  feederStepText: { fontSize: FontSizes.sm, color: Colors.text },
  feederNote: { fontSize: FontSizes.xs, color: Colors.muted, fontStyle: 'italic', marginTop: Spacing.md },
});
