import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { useState, useEffect } from 'react';
import { } from '../../constants/theme';
import { programsAPI, exercisesAPI, workoutsAPI, coachAPI, contentAPI, analyticsAPI, extrasAPI, backupAPI, warmupAPI } from '../../lib/api';

const ACCENT_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'];

export default function ProgramsScreen() {
  const router = useRouter();
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    programsAPI.list()
      .then(data => { setPrograms(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const activateProgram = async (id: string) => {
    await programsAPI.activate(id);
    const res = await programsAPI.list();
    setPrograms(res);
  };

  const renderProgram = ({ item, index }: { item: any; index: number }) => {
    const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];
    const dayCount = item.training_days_count || item.days_count || 0;

    return (
      <TouchableOpacity
        testID={`program-card-${item.id}`}
        style={[styles.card, item.is_active && { borderColor: accent + '50' }]}
        activeOpacity={0.7}
        onPress={() => router.push(`/program/${item.id}`)}
      >
        {/* Top accent line */}
        <View style={[styles.accentLine, { backgroundColor: accent }]} />

        <View style={styles.cardBody}>
          <View style={styles.cardTop}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              {item.is_active && (
                <View style={[styles.activePill, { backgroundColor: accent + '20' }]}>
                  <View style={[styles.activeDot, { backgroundColor: accent }]} />
                  <Text style={[styles.activeText, { color: accent }]}>ACTIVE</Text>
                </View>
              )}
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="calendar-outline" size={14} color={Colors.muted} />
              <Text style={styles.statText}>{item.schedule}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="flash-outline" size={14} color={accent} />
              <Text style={[styles.statText, { color: accent }]}>{dayCount} days</Text>
            </View>
          </View>

          {/* Action */}
          {!item.is_active ? (
            <TouchableOpacity
              testID={`activate-program-${item.id}`}
              style={styles.activateBtn}
              activeOpacity={0.7}
              onPress={() => activateProgram(item.id)}
            >
              <Ionicons name="checkmark-circle-outline" size={16} color={Colors.primary} />
              <Text style={styles.activateBtnText}>SET AS ACTIVE</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.activeFooter}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
              <Text style={styles.activeFooterText}>Currently Active</Text>
            </View>
          )}
        </View>

        <View style={styles.cardArrow}>
          <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>PROGRAMS</Text>
        <Text style={styles.subtitle}>{programs.length} training programs available</Text>
      </View>
      {loading ? (
        <View style={styles.loadWrap}><ActivityIndicator size="large" color={Colors.primary} /></View>
      ) : (
        <FlatList
          data={programs}
          renderItem={renderProgram}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.xl },
  title: { fontSize: FontSizes.xxxl, fontWeight: '900', color: Colors.text, letterSpacing: 1 },
  subtitle: { fontSize: FontSizes.sm, color: Colors.muted, marginTop: Spacing.xs },
  loadWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
  card: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border,
    overflow: 'hidden', flexDirection: 'row',
  },
  accentLine: { width: 4, borderTopLeftRadius: BorderRadius.lg, borderBottomLeftRadius: BorderRadius.lg },
  cardBody: { flex: 1, padding: Spacing.lg },
  cardArrow: { justifyContent: 'center', paddingRight: Spacing.lg },
  cardTop: { marginBottom: Spacing.md },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  cardTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.text },
  activePill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
  },
  activeDot: { width: 6, height: 6, borderRadius: 3 },
  activeText: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statDivider: { width: 1, height: 14, backgroundColor: Colors.border },
  statText: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  activateBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.primary + '10', paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm, borderRadius: BorderRadius.sm, alignSelf: 'flex-start',
  },
  activateBtnText: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.primary, letterSpacing: 0.5 },
  activeFooter: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  activeFooterText: { fontSize: FontSizes.xs, color: Colors.success, fontWeight: '600' },
});
