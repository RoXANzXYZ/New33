import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { useState, useCallback } from 'react';
import { programsAPI, exercisesAPI, workoutsAPI, coachAPI, contentAPI, analyticsAPI, extrasAPI, backupAPI, warmupAPI } from '../../lib/api';

const QUICK_ITEMS = [
  { icon: 'barbell-outline' as const, label: 'Programs', route: '/programs', color: '#3B82F6' },
  { icon: 'trophy-outline' as const, label: 'Analytics & PRs', route: '/analytics', color: '#F59E0B' },
  { icon: 'chatbubble-ellipses-outline' as const, label: 'AI Coach', route: '/coach', color: '#8B5CF6' },
  { icon: 'chatbubbles-outline' as const, label: 'Coach History', route: '/coach-history', color: '#6366F1' },
  { icon: 'book-outline' as const, label: 'Exercise Library', route: '/exercises', color: '#10B981' },
  { icon: 'analytics-outline' as const, label: 'Weekly Review', route: '/weekly-summary', color: '#EC4899' },
];

// Progress Ring component
function ProgressRing({ progress, size, strokeWidth, sessions, target }: { progress: number; size: number; strokeWidth: number; sessions: number; target: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - Math.min(progress, 1));

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={Colors.surfaceHighlight} strokeWidth={strokeWidth} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={progress >= 1 ? Colors.success : Colors.primary} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={`${circumference}`} strokeDashoffset={dashOffset} strokeLinecap="round" />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text style={{ fontSize: 28, fontWeight: '900', color: Colors.text }}>{sessions}</Text>
        <Text style={{ fontSize: 10, fontWeight: '600', color: Colors.muted, letterSpacing: 0.5 }}>/{target} this week</Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const [activeProgram, setActiveProgram] = useState<any>(null);
  const [activeWorkout, setActiveWorkout] = useState<any>(null);
  const [weeklyProgress, setWeeklyProgress] = useState<any>(null);
  const [extrasStatus, setExtrasStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    const load = async () => {
      try {
        const [progRes, workoutRes, weeklyRes, extrasRes] = await Promise.all([
          programsAPI.getActive(),
          workoutsAPI.getActive(),
          analyticsAPI.weeklyProgress(),
          extrasAPI.status(),
        ]);
        if (progRes) setActiveProgram(progRes);
        const wd = workoutRes;
        setActiveWorkout(wd.status !== 'none' ? wd : null);
        if (weeklyRes) setWeeklyProgress(weeklyRes);
        if (extrasRes) setExtrasStatus(extrasRes);
      } catch (e) { console.log(e); }
      setLoading(false);
    };
    load();
  }, []));

  if (loading) {
    return <SafeAreaView style={st.container}><View style={st.center}><ActivityIndicator size="large" color={Colors.primary} /></View></SafeAreaView>;
  }

  const sessions = weeklyProgress?.sessions_this_week || 0;
  const target = weeklyProgress?.target || 5;
  const progress = target > 0 ? sessions / target : 0;

  return (
    <SafeAreaView style={st.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.scroll}>
        {/* Brand */}
        <View style={st.brand}>
          <View style={st.brandRow}>
            <View style={st.brandIcon}><Ionicons name="barbell" size={18} color={Colors.primary} /></View>
            <Text style={st.brandText}>BURKA<Text style={st.brandAccent}>OS</Text></Text>
          </View>
        </View>

        {/* Weekly Progress Ring */}
        <View style={st.ringCard}>
          <ProgressRing progress={progress} size={130} strokeWidth={10} sessions={sessions} target={target} />
          <View style={st.ringInfo}>
            <Text style={st.ringTitle}>WEEKLY PROGRESS</Text>
            <Text style={st.ringDesc}>
              {sessions === 0 ? "No sessions yet this week. Get after it." :
               sessions >= target ? "Target hit! You earned your rest day." :
               `${target - sessions} more session${target - sessions > 1 ? 's' : ''} to hit your weekly target.`}
            </Text>
            {weeklyProgress?.days?.length > 0 && (
              <View style={st.ringDays}>
                {weeklyProgress.days.map((d: any, i: number) => (
                  <View key={i} style={st.ringDayChip}>
                    <Ionicons name="checkmark-circle" size={12} color={Colors.success} />
                    <Text style={st.ringDayText}>{d.name}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Extras Reminder — subtle nudge */}
        {extrasStatus && (extrasStatus.abs?.needs_reminder || extrasStatus.calves?.needs_reminder) && (
          <TouchableOpacity data-testid="extras-reminder" style={st.extrasReminder} activeOpacity={0.7} onPress={() => router.push('/extras')}>
            <View style={st.extrasReminderIcon}>
              <Ionicons name="fitness-outline" size={16} color="#F59E0B" />
            </View>
            <View style={st.extrasReminderContent}>
              <Text style={st.extrasReminderTitle}>EXTRAS THIS WEEK</Text>
              <Text style={st.extrasReminderText}>
                {[
                  extrasStatus.abs?.remaining > 0 ? `Abs: ${extrasStatus.abs.remaining} left` : null,
                  extrasStatus.calves?.remaining > 0 ? `Calves: ${extrasStatus.calves.remaining} left` : null,
                ].filter(Boolean).join('  ·  ')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={14} color={Colors.muted} />
          </TouchableOpacity>
        )}

        {/* Primary CTA */}
        {activeWorkout ? (
          <TouchableOpacity testID="resume-workout-btn" style={st.ctaResume} activeOpacity={0.8} onPress={() => router.push('/active-workout')}>
            <View style={st.ctaContent}>
              <View style={st.ctaPulse} />
              <View style={st.ctaTextWrap}>
                <Text style={st.ctaLabel}>IN PROGRESS</Text>
                <Text style={st.ctaTitle}>{activeWorkout.day_name}</Text>
                <Text style={st.ctaSub}>{activeWorkout.program_name}</Text>
              </View>
            </View>
            <View style={st.ctaArrow}><Ionicons name="arrow-forward" size={20} color="#FFF" /></View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity testID="start-workout-btn" style={st.ctaStart} activeOpacity={0.8} onPress={() => router.push('/workout')}>
            <View style={st.ctaContent}>
              <View style={st.ctaIconWrap}><Ionicons name="flash" size={22} color="#FFF" /></View>
              <View style={st.ctaTextWrap}>
                <Text style={st.ctaTitle}>START WORKOUT</Text>
                {activeProgram && (() => {
                  const currentDay = activeProgram.current_day || 1;
                  const trainingDays = activeProgram.days?.filter((d: any) => !d.is_rest) || [];
                  const nextDay = trainingDays.find((d: any) => d.day_number === currentDay);
                  return nextDay ? <Text style={st.ctaSub}>Day {nextDay.day_number}: {nextDay.name}</Text> : <Text style={st.ctaSub}>{activeProgram.name}</Text>;
                })()}
              </View>
            </View>
            <View style={st.ctaArrow}><Ionicons name="arrow-forward" size={20} color="#FFF" /></View>
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <Text style={st.secLabel}>QUICK ACCESS</Text>
        <View style={st.quickGrid}>
          {QUICK_ITEMS.map(item => (
            <TouchableOpacity key={item.label} style={st.quickItem} activeOpacity={0.7} onPress={() => router.push(item.route as any)}>
              <View style={[st.quickIcon, { backgroundColor: item.color + '12' }]}><Ionicons name={item.icon} size={20} color={item.color} /></View>
              <Text style={st.quickLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={14} color={Colors.muted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Quote */}
        <View style={st.quoteCard}>
          <Ionicons name="chatbubble-outline" size={14} color={Colors.primary + '60'} />
          <View style={st.quoteContent}>
            <Text style={st.quoteText}>"Stop majoring in the minors. Get to the gym, train hard, eat 200g+ protein, sleep 7-9 hours. It's not complicated."</Text>
            <Text style={st.quoteAuthor}>— Sebastian Burka</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: 100 },
  brand: { marginBottom: Spacing.xl },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  brandIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: Colors.primary + '12', justifyContent: 'center', alignItems: 'center' },
  brandText: { fontSize: 36, fontWeight: '900', color: Colors.text, letterSpacing: 3 },
  brandAccent: { color: Colors.primary },
  // Ring
  ringCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border, gap: Spacing.lg },
  ringInfo: { flex: 1 },
  ringTitle: { fontSize: 10, fontWeight: '700', color: Colors.muted, letterSpacing: 1.5, marginBottom: Spacing.sm },
  ringDesc: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20 },
  ringDays: { flexDirection: 'row', gap: 6, marginTop: Spacing.sm, flexWrap: 'wrap' },
  ringDayChip: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.success + '12', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  ringDayText: { fontSize: 9, fontWeight: '600', color: Colors.success },
  // CTA
  ctaStart: { backgroundColor: Colors.primary, borderRadius: BorderRadius.lg, padding: Spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.xl },
  ctaResume: { backgroundColor: Colors.success, borderRadius: BorderRadius.lg, padding: Spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.xl },
  ctaContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, flex: 1 },
  ctaIconWrap: { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  ctaPulse: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFF' },
  ctaTextWrap: {},
  ctaLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: 1.5 },
  ctaTitle: { fontSize: FontSizes.lg, fontWeight: '800', color: '#FFF', letterSpacing: 0.5 },
  ctaSub: { fontSize: FontSizes.sm, color: 'rgba(255,255,255,0.7)', marginTop: 1 },
  ctaArrow: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  secLabel: { fontSize: 10, fontWeight: '700', color: Colors.muted, letterSpacing: 1.5, marginBottom: Spacing.md },
  quickGrid: { gap: Spacing.sm, marginBottom: Spacing.xxl },
  quickItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: BorderRadius.md, paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, gap: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  quickIcon: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  quickLabel: { fontSize: FontSizes.base, fontWeight: '600', color: Colors.text, flex: 1 },
  quoteCard: { flexDirection: 'row', gap: Spacing.md, paddingVertical: Spacing.lg },
  quoteContent: { flex: 1 },
  quoteText: { fontSize: FontSizes.sm, color: Colors.muted, fontStyle: 'italic', lineHeight: 20 },
  quoteAuthor: { fontSize: FontSizes.xs, color: Colors.muted, marginTop: Spacing.sm, fontWeight: '600', opacity: 0.5 },
  // Extras reminder
  extrasReminder: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md, paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg, borderWidth: 1, borderColor: '#F59E0B20', borderLeftWidth: 3, borderLeftColor: '#F59E0B50' },
  extrasReminderIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#F59E0B12', justifyContent: 'center', alignItems: 'center' },
  extrasReminderContent: { flex: 1 },
  extrasReminderTitle: { fontSize: 9, fontWeight: '700', color: '#F59E0B', letterSpacing: 1 },
  extrasReminderText: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
});
