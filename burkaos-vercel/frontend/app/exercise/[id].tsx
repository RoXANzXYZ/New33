import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { useState, useEffect } from 'react';
import { programsAPI, exercisesAPI, workoutsAPI, coachAPI, contentAPI, analyticsAPI, extrasAPI, backupAPI, warmupAPI } from '../../lib/api';

export default function ExerciseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [exercise, setExercise] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    exercisesAPI.detail(id).then(data => { setExercise(data); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <SafeAreaView style={styles.container}><ActivityIndicator size="large" color={Colors.primary} /></SafeAreaView>;
  if (!exercise) return <SafeAreaView style={styles.container}><Text style={styles.errorText}>Exercise not found</Text></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity testID="back-btn" onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{exercise.name}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Video Section */}
        {exercise.video_url && (
          <TouchableOpacity
            testID="watch-video-btn"
            style={styles.videoCard}
            activeOpacity={0.7}
            onPress={() => Linking.openURL(exercise.video_url)}
          >
            <View style={styles.videoIcon}>
              <Ionicons name="logo-youtube" size={40} color="#CC0000" />
            </View>
            <Text style={styles.videoText}>{exercise.video_title || 'Watch Form Demo'}</Text>
            <Text style={styles.videoSub}>Sebastian Burka • YouTube</Text>
          </TouchableOpacity>
        )}

        {/* Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}><Text style={styles.label}>Equipment</Text><Text style={styles.value}>{exercise.equipment}</Text></View>
          <View style={styles.infoRow}><Text style={styles.label}>Default Tempo</Text><Text style={styles.value}>{exercise.tempo_default}</Text></View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Muscles</Text>
            <View style={styles.tags}>
              {exercise.muscle_groups?.map((m: string) => (
                <View key={m} style={styles.tag}><Text style={styles.tagText}>{m}</Text></View>
              ))}
            </View>
          </View>
          {exercise.aliases?.length > 0 && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Also Known As</Text>
              <Text style={styles.value}>{exercise.aliases.join(', ')}</Text>
            </View>
          )}
        </View>

        {/* Cues */}
        {exercise.cues?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EXECUTION CUES</Text>
            {exercise.cues.map((cue: string, i: number) => (
              <View key={i} style={styles.cueRow}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                <Text style={styles.cueText}>{cue}</Text>
              </View>
            ))}
          </View>
        )}

        {/* History */}
        {exercise.history?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>RECENT HISTORY</Text>
            {exercise.history.slice(0, 10).map((h: any, i: number) => (
              <View key={i} style={styles.historyRow}>
                <Text style={styles.histWeight}>{h.weight} lbs</Text>
                <Text style={styles.histReps}>x {h.reps}</Text>
                <Text style={styles.histVol}>{Math.round(h.weight * h.reps)} vol</Text>
                <Text style={styles.histDate}>{new Date(h.timestamp).toLocaleDateString()}</Text>
              </View>
            ))}
          </View>
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
  videoCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.xxl,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.xl,
  },
  videoIcon: { marginBottom: Spacing.md },
  videoText: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.text },
  videoSub: { fontSize: FontSizes.sm, color: Colors.muted, marginTop: Spacing.xs },
  infoCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.xl, marginBottom: Spacing.xl, borderWidth: 1, borderColor: Colors.border },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm },
  label: { fontSize: FontSizes.sm, color: Colors.muted },
  value: { fontSize: FontSizes.sm, color: Colors.text, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  tags: { flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap' },
  tag: { backgroundColor: Colors.primary + '20', paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm },
  tagText: { fontSize: 10, fontWeight: '700', color: Colors.primary },
  section: { marginBottom: Spacing.xl },
  sectionTitle: { fontSize: FontSizes.xs, fontWeight: '600', color: Colors.muted, letterSpacing: 1.5, marginBottom: Spacing.md },
  cueRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md, alignItems: 'flex-start' },
  cueText: { flex: 1, fontSize: FontSizes.base, color: Colors.text, lineHeight: 22 },
  historyRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: BorderRadius.sm,
    padding: Spacing.md, marginBottom: Spacing.xs, borderWidth: 1, borderColor: Colors.border, gap: Spacing.lg,
  },
  histWeight: { fontSize: FontSizes.base, fontWeight: '700', color: Colors.text, width: 80 },
  histReps: { fontSize: FontSizes.base, color: Colors.textSecondary, width: 50 },
  histVol: { fontSize: FontSizes.sm, color: Colors.muted, flex: 1 },
  histDate: { fontSize: FontSizes.xs, color: Colors.muted },
  errorText: { color: Colors.error, textAlign: 'center', marginTop: 100, fontSize: FontSizes.lg },
});
