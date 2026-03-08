import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { useState, useEffect } from 'react';
import { } from '../../constants/theme';
import { programsAPI, exercisesAPI, workoutsAPI, coachAPI, contentAPI, analyticsAPI, extrasAPI, backupAPI, warmupAPI } from '../../lib/api';

export default function ExercisesScreen() {
  const router = useRouter();
  const [exercises, setExercises] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    exercisesAPI.list(search || undefined).then(data => { setExercises(data); setLoading(false); }).catch(() => setLoading(false));
  }, [search]);

  const muscleColor = (muscle: string) => {
    const map: Record<string, string> = {
      'Chest': '#EF4444', 'Back': '#3B82F6', 'Shoulders': '#F59E0B', 'Biceps': '#8B5CF6',
      'Triceps': '#EC4899', 'Quads': '#22C55E', 'Hamstrings': '#14B8A6', 'Calves': '#06B6D4',
      'Core': '#F97316', 'Glutes': '#A855F7', 'Lats': '#3B82F6',
    };
    return map[muscle] || Colors.muted;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>EXERCISE LIBRARY</Text>
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={Colors.muted} />
          <TextInput
            testID="exercise-search-input"
            style={styles.searchInput}
            placeholder="Search exercises, muscles..."
            placeholderTextColor={Colors.muted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity testID="clear-search-btn" onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={Colors.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {loading ? <ActivityIndicator size="large" color={Colors.primary} /> : (
        <FlatList
          data={exercises}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }: { item: any }) => (
            <TouchableOpacity
              testID={`exercise-${item.id}`}
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => router.push(`/exercise/${item.id}`)}
            >
              <View style={styles.cardRow}>
                <View style={styles.cardInfo}>
                  <Text style={styles.exName}>{item.name}</Text>
                  <View style={styles.tags}>
                    {item.muscle_groups?.map((m: string) => (
                      <View key={m} style={[styles.tag, { backgroundColor: muscleColor(m) + '20' }]}>
                        <Text style={[styles.tagText, { color: muscleColor(m) }]}>{m}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={styles.equipment}>{item.equipment} • Tempo: {item.tempo_default}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.muted} />
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg, paddingBottom: Spacing.md },
  title: { fontSize: FontSizes.xxl, fontWeight: '800', color: Colors.text, letterSpacing: 1, marginBottom: Spacing.lg },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md, paddingHorizontal: Spacing.lg, gap: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  searchInput: { flex: 1, height: 48, color: Colors.text, fontSize: FontSizes.base },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
  card: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.lg,
    marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  cardInfo: { flex: 1 },
  exName: { fontSize: FontSizes.base, fontWeight: '600', color: Colors.text },
  tags: { flexDirection: 'row', gap: Spacing.xs, marginTop: Spacing.xs, flexWrap: 'wrap' },
  tag: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm },
  tagText: { fontSize: 10, fontWeight: '700' },
  equipment: { fontSize: FontSizes.xs, color: Colors.muted, marginTop: Spacing.xs },
});
