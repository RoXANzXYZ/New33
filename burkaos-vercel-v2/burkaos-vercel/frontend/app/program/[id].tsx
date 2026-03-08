import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { useState, useEffect } from 'react';
import { programsAPI, exercisesAPI, workoutsAPI, coachAPI, contentAPI, analyticsAPI, extrasAPI, backupAPI, warmupAPI } from '../../lib/api';

export default function ProgramDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [program, setProgram] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    programsAPI.detail(id).then(data => { setProgram(data); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <SafeAreaView style={styles.container}><ActivityIndicator size="large" color={Colors.primary} /></SafeAreaView>;
  if (!program) return <SafeAreaView style={styles.container}><Text style={styles.errorText}>Program not found</Text></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity testID="back-btn" onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{program.name}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Split Type</Text>
            <Text style={styles.infoValue}>{program.split_type}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Schedule</Text>
            <Text style={styles.infoValue}>{program.schedule}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Source</Text>
            <Text style={styles.infoValue}>{program.source_pdf}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, { backgroundColor: Colors.success }]} />
              <Text style={styles.statusText}>{program.import_status === 'exact_pdf_import' ? 'Exact PDF Import' : 'Needs Review'}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>TRAINING DAYS</Text>
        {program.days?.map((day: any) => (
          <View key={day.day_number} style={[styles.dayCard, day.is_rest && styles.restCard]}>
            <View style={styles.dayHeader}>
              <View style={styles.dayNumBadge}>
                <Text style={styles.dayNumText}>D{day.day_number}</Text>
              </View>
              <Text style={styles.dayName}>{day.name}</Text>
              {!day.is_rest && <Text style={styles.daySetCount}>{day.target_sets} sets</Text>}
            </View>
            {!day.is_rest && day.muscle_groups?.length > 0 && (
              <Text style={styles.dayMuscles}>{day.muscle_groups.join(' • ')}</Text>
            )}
            {!day.is_rest && day.exercises?.map((ex: any) => (
              <View key={ex.order} style={styles.exerciseRow}>
                <Text style={styles.exOrder}>{ex.order}</Text>
                <View style={styles.exInfo}>
                  <Text style={styles.exName}>{ex.name}</Text>
                  <Text style={styles.exDetail}>
                    {ex.sets_config?.map((sc: any) => sc.reps).join(', ')} • {ex.tempo}
                    {ex.set_type !== 'standard' ? ` • ${ex.set_type.toUpperCase()}` : ''}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ))}
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
  infoCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.xl, marginBottom: Spacing.xxl, borderWidth: 1, borderColor: Colors.border },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm },
  infoLabel: { fontSize: FontSizes.sm, color: Colors.muted },
  infoValue: { fontSize: FontSizes.sm, color: Colors.text, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: FontSizes.sm, color: Colors.success, fontWeight: '600' },
  sectionTitle: { fontSize: FontSizes.xs, fontWeight: '600', color: Colors.muted, letterSpacing: 1.5, marginBottom: Spacing.lg },
  dayCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  restCard: { opacity: 0.5 },
  dayHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  dayNumBadge: { backgroundColor: Colors.primary + '20', paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm },
  dayNumText: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.primary },
  dayName: { flex: 1, fontSize: FontSizes.base, fontWeight: '700', color: Colors.text },
  daySetCount: { fontSize: FontSizes.xs, color: Colors.muted },
  dayMuscles: { fontSize: FontSizes.xs, color: Colors.primary, marginTop: Spacing.sm, marginBottom: Spacing.md },
  exerciseRow: { flexDirection: 'row', gap: Spacing.md, paddingVertical: Spacing.sm, borderTopWidth: 0.5, borderTopColor: Colors.border },
  exOrder: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.muted, width: 20, textAlign: 'center' },
  exInfo: { flex: 1 },
  exName: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.text },
  exDetail: { fontSize: FontSizes.xs, color: Colors.muted, marginTop: 2 },
  errorText: { color: Colors.error, textAlign: 'center', marginTop: 100, fontSize: FontSizes.lg },
});
