import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';
import { useState, useEffect } from 'react';
import { programsAPI, exercisesAPI, workoutsAPI, coachAPI, contentAPI, analyticsAPI, extrasAPI, backupAPI, warmupAPI } from '../lib/api';

export default function PhilosophyScreen() {
  const router = useRouter();
  const [philosophy, setPhilosophy] = useState<any>(null);
  const [glossary, setGlossary] = useState<any[]>([]);
  const [tab, setTab] = useState<'principles' | 'troubleshoot' | 'ped' | 'glossary'>('principles');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      contentAPI.philosophy(),
      contentAPI.glossary(),
    ]).then(([phil, gloss]) => {
      setPhilosophy(phil);
      setGlossary(gloss);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const tabs = [
    { key: 'principles' as const, label: 'Principles' },
    { key: 'troubleshoot' as const, label: 'Troubleshoot' },
    { key: 'ped' as const, label: 'PED' },
    { key: 'glossary' as const, label: 'Glossary' },
  ];

  if (loading) return <SafeAreaView style={styles.container}><ActivityIndicator size="large" color={Colors.primary} /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity testID="back-btn" onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PHILOSOPHY</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.tabBar}>
        {tabs.map(t => (
          <TouchableOpacity
            key={t.key}
            testID={`tab-${t.key}`}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            activeOpacity={0.7}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {tab === 'principles' && philosophy?.training_principles?.map((p: any, i: number) => (
          <View key={i} style={styles.card}>
            <Text style={styles.cardTitle}>{p.title}</Text>
            <Text style={styles.cardContent}>{p.content}</Text>
          </View>
        ))}

        {tab === 'troubleshoot' && philosophy?.troubleshooting_hierarchy?.map((t: any, i: number) => (
          <View key={i} style={styles.card}>
            <View style={styles.stepRow}>
              <View style={styles.stepBadge}><Text style={styles.stepNum}>{t.step}</Text></View>
              <Text style={styles.cardTitle}>{t.title}</Text>
            </View>
            <Text style={styles.cardContent}>{t.content}</Text>
          </View>
        ))}

        {tab === 'ped' && philosophy?.ped_education?.map((p: any, i: number) => (
          <View key={i} style={styles.card}>
            <Text style={styles.cardTitle}>{p.title}</Text>
            <Text style={styles.cardContent}>{p.content}</Text>
          </View>
        ))}

        {tab === 'glossary' && glossary.map((g: any, i: number) => (
          <View key={i} style={styles.glossaryCard}>
            <Text style={styles.glossaryTerm}>{g.term}</Text>
            <Text style={styles.glossaryDef}>{g.definition}</Text>
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
  tabBar: {
    flexDirection: 'row', paddingHorizontal: Spacing.xl, gap: Spacing.sm,
    borderBottomWidth: 1, borderBottomColor: Colors.border, paddingBottom: Spacing.md,
  },
  tab: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.sm, backgroundColor: Colors.surface },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.muted },
  tabTextActive: { color: Colors.primaryForeground },
  scroll: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: 100 },
  card: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.xl, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  cardTitle: { fontSize: FontSizes.base, fontWeight: '700', color: Colors.text, marginBottom: Spacing.sm },
  cardContent: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 22 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  stepBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  stepNum: { fontSize: FontSizes.sm, fontWeight: '800', color: Colors.primaryForeground },
  glossaryCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.lg, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  glossaryTerm: { fontSize: FontSizes.base, fontWeight: '700', color: Colors.primary, marginBottom: Spacing.xs },
  glossaryDef: { fontSize: FontSizes.sm, color: Colors.textSecondary, lineHeight: 20 },
});
