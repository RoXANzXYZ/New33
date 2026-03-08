import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, Linking, PanResponder } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../constants/theme';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { programsAPI, exercisesAPI, workoutsAPI, coachAPI, contentAPI, analyticsAPI, extrasAPI, backupAPI, warmupAPI } from '../lib/api';

// Plate calculator logic
const PLATES = [45, 35, 25, 10, 5, 2.5];
const PLATE_COLORS: Record<number, string> = {
  45: '#EF4444', 35: '#F59E0B', 25: '#22C55E', 10: '#3B82F6', 5: '#8B5CF6', 2.5: '#EC4899',
};
const PLATE_WIDTHS: Record<number, number> = { 45: 28, 35: 24, 25: 20, 10: 16, 5: 14, 2.5: 12 };
const BAR_WEIGHT = 45;

const calcPlates = (totalWeight: number): number[] => {
  if (totalWeight <= BAR_WEIGHT) return [];
  let perSide = (totalWeight - BAR_WEIGHT) / 2;
  const plates: number[] = [];
  for (const plate of PLATES) {
    while (perSide >= plate) {
      plates.push(plate);
      perSide -= plate;
    }
  }
  return plates;
};

const isBarExercise = (name: string): boolean => {
  const lower = name.toLowerCase();
  return ['press', 'squat', 'bench', 'deadlift', 'rdl', 'overhead', 'barbell', 'hip hinge', 'close grip'].some(k => lower.includes(k));
};

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const [workout, setWorkout] = useState<any>(null);
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [loading, setLoading] = useState(true);
  const [restTimer, setRestTimer] = useState(0);
  const [restActive, setRestActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showAlts, setShowAlts] = useState(false);
  const [alternatives, setAlternatives] = useState<any[]>([]);
  const [altsLoading, setAltsLoading] = useState(false);
  const [showPlateCalc, setShowPlateCalc] = useState(false);
  const [setTimer, setSetTimer] = useState(0);
  const [setTimerActive, setSetTimerActive] = useState(false);
  // RPS state
  const [rpsRound, setRpsRound] = useState(1);
  const [rpsWeights, setRpsWeights] = useState<{ weight: number; reps: number }[]>([]);
  // Superset transition state
  const [ssTransition, setSsTransition] = useState(false);
  const [ssTransitionTimer, setSsTransitionTimer] = useState(0);
  const [ssPartnerIdx, setSsPartnerIdx] = useState<number | null>(null);
  const timerRef = useRef<any>(null);
  const elapsedRef = useRef<any>(null);
  const ssTimerRef = useRef<any>(null);

  const fetchWorkout = useCallback(async () => {
    try {
      const res = await workoutsAPI.getActive();
      const data = res;
      if (data.status !== 'none') { setWorkout(data); }
      else { router.back(); }
    } catch (e) { console.log(e); }
    setLoading(false);
  }, [router]);

  useEffect(() => { fetchWorkout(); }, [fetchWorkout]);

  useEffect(() => {
    elapsedRef.current = setInterval(() => setElapsedTime(t => t + 1), 1000);
    return () => clearInterval(elapsedRef.current);
  }, []);

  useEffect(() => {
    if (restActive && restTimer > 0) {
      timerRef.current = setTimeout(() => setRestTimer(t => t - 1), 1000);
    } else if (restTimer === 0 && restActive) {
      setRestActive(false);
    }
    return () => clearTimeout(timerRef.current);
  }, [restTimer, restActive]);

  // Set timer - counts up after each set log
  const setTimerRef = useRef<any>(null);
  useEffect(() => {
    if (setTimerActive) {
      setTimerRef.current = setInterval(() => setSetTimer(t => t + 1), 1000);
    } else {
      clearInterval(setTimerRef.current);
    }
    return () => clearInterval(setTimerRef.current);
  }, [setTimerActive]);

  // Superset transition countdown
  useEffect(() => {
    if (ssTransition && ssTransitionTimer > 0) {
      ssTimerRef.current = setTimeout(() => setSsTransitionTimer(t => t - 1), 1000);
    } else if (ssTransition && ssTransitionTimer === 0) {
      // Auto-navigate to partner exercise
      if (ssPartnerIdx !== null) {
        setCurrentExIdx(ssPartnerIdx);
        setWeight('');
        setReps('');
      }
      setSsTransition(false);
      setSsPartnerIdx(null);
    }
    return () => clearTimeout(ssTimerRef.current);
  }, [ssTransitionTimer, ssTransition, ssPartnerIdx]);

  const exercises = workout?.exercises || [];
  const currentEx = exercises[currentExIdx];
  const setLogs = workout?.set_logs?.filter((s: any) => s.exercise_order === currentEx?.order) || [];
  const totalSetsLogged = workout?.set_logs?.length || 0;
  const totalSetsTarget = exercises.reduce((sum: number, ex: any) => sum + (ex.sets_config?.length || 0), 0);
  const progressPct = totalSetsTarget > 0 ? Math.min(100, Math.round((totalSetsLogged / totalSetsTarget) * 100)) : 0;
  const isRPS = currentEx?.set_type === 'rest_pause' || currentEx?.set_type === 'rps';
  const isAlternating = currentEx?.set_type === 'alternating';
  const showBarCalc = currentEx ? isBarExercise(currentEx.name) : false;
  const plateList = weight ? calcPlates(parseFloat(weight) || 0) : [];

  // Superset detection
  const getSupersetPartner = (exIdx: number): number | null => {
    const ex = exercises[exIdx];
    if (!ex?.superset_group) return null;
    const partnerIdx = exercises.findIndex((e: any, i: number) => i !== exIdx && e.superset_group === ex.superset_group);
    return partnerIdx >= 0 ? partnerIdx : null;
  };
  const ssPartner = getSupersetPartner(currentExIdx);
  const isSupersetEx = currentEx?.superset_group != null;
  const partnerEx = ssPartner !== null ? exercises[ssPartner] : null;

  // Swipe gesture
  const exercisesRef = useRef(exercises);
  exercisesRef.current = exercises;
  const panResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 30 && Math.abs(gs.dy) < 30,
    onPanResponderRelease: (_, gs) => {
      const maxIdx = Math.max(0, (exercisesRef.current?.length || 1) - 1);
      if (gs.dx < -80) setCurrentExIdx(i => Math.min(i + 1, maxIdx));
      else if (gs.dx > 80) setCurrentExIdx(i => Math.max(i - 1, 0));
    },
  }), []);

  const fetchAlternatives = async (exName: string) => {
    setAltsLoading(true);
    try {
      const res = await exercisesAPI.alternatives(exName);
      const data = res;
      setAlternatives(data.alternatives || []);
    } catch { setAlternatives([]); }
    setAltsLoading(false);
  };

  const toggleAlts = () => {
    if (!showAlts && currentEx) {
      fetchAlternatives(currentEx.name);
    }
    setShowAlts(!showAlts);
  };

  const logSet = async () => {
    if (!weight || !reps || !workout || !currentEx) return;
    try {
      await workoutsAPI.logSet(workout.id, {
          exercise_order: currentEx.order,
          set_number: setLogs.length + 1,
          weight: parseFloat(weight), reps: parseInt(reps),
          set_type: currentEx.set_type || 'working',
        });
      setReps('');
      // Keep weight for next set, start set timer
      setSetTimer(0); setSetTimerActive(true);
      await fetchWorkout();
      // Superset: transition to partner instead of normal rest
      const partner = getSupersetPartner(currentExIdx);
      if (partner !== null) {
        const transTime = currentEx.superset_transition || 15;
        setSsPartnerIdx(partner);
        setSsTransitionTimer(transTime);
        setSsTransition(true);
      } else {
        startRest();
      }
    } catch (e) { console.log(e); }
  };

  const swapExercise = (altName: string) => {
    if (!currentEx) return;
    // Update exercise name locally in the workout state
    const updated = { ...workout };
    const ex = updated.exercises[currentExIdx];
    if (ex) {
      ex.name = altName;
      ex.swapped = true;
      setWorkout(updated);
      setShowAlts(false);
    }
  };

  const adjustWeight = (delta: number) => {
    const current = parseFloat(weight) || 0;
    const newVal = Math.max(0, current + delta);
    setWeight(newVal.toString());
  };

  const logRpsRound = async () => {
    if (!weight || !reps || !workout || !currentEx) return;
    const w = parseFloat(weight);
    const r = parseInt(reps);
    setRpsWeights([...rpsWeights, { weight: w, reps: r }]);
    try {
      await workoutsAPI.logSet(workout.id, {
          exercise_order: currentEx.order, set_number: setLogs.length + 1,
          weight: w, reps: r, set_type: 'rps', rps_round: rpsRound,
        });
    } catch (e) { console.log(e); }
    setReps('');
    await fetchWorkout();
    if (rpsRound < 3) {
      setRpsRound(rpsRound + 1);
      setRestTimer(25); setRestActive(true);
    } else {
      setRpsRound(1); setRpsWeights([]); setWeight('');
      startRest();
    }
  };

  const startRest = () => {
    const minutes = parseInt(currentEx?.rest) || 2;
    setRestTimer(minutes * 60); setRestActive(true);
  };

  const completeWorkout = async () => {
    if (!workout) return;
    Alert.alert('Complete Workout?', 'Finalize this session.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Complete', style: 'default', onPress: async () => {
          try {
            const res = await workoutsAPI.complete(workout.id);
            const data = res;
            const nextInfo = data.next_day;
            const volComp = data.volume_comparison;
            let msg = `Sets: ${data.total_sets}\nVolume: ${Math.round(data.total_volume).toLocaleString()} lbs`;
            if (volComp) {
              const arrow = volComp.change_pct >= 0 ? '↑' : '↓';
              msg += `\n${arrow} ${Math.abs(volComp.change_pct)}% vs last time (${volComp.previous.toLocaleString()} lbs)`;
            }
            if (data.prs_hit?.length) msg += `\n\nPRs: ${data.prs_hit.join(', ')}`;
            if (nextInfo) msg += `\n\nNext Up: Day ${nextInfo.day_number} — ${nextInfo.name}${nextInfo.muscle_groups?.length ? `\n(${nextInfo.muscle_groups.join(', ')})` : ''}`;
            Alert.alert('Workout Complete! 💪', msg, [{ text: 'Done', onPress: () => router.back() }]);
          } catch (e) { console.log(e); }
        }
      },
    ]);
  };

  const cancelWorkout = () => {
    Alert.alert('Cancel Workout?', 'This will discard the session.', [
      { text: 'Keep Going', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: async () => {
          await workoutsAPI.delete(workout.id); router.back();
      }},
    ]);
  };

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const fmtElapsed = (s: number) => {
    const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); const sec = s % 60;
    return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}` : `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (loading || !workout) {
    return <SafeAreaView style={s.container}><View style={s.loadWrap}><ActivityIndicator size="large" color={Colors.primary} /><Text style={s.loadText}>Loading workout...</Text></View></SafeAreaView>;
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Top Bar */}
      <View style={s.topBar}>
        <TouchableOpacity onPress={cancelWorkout} style={s.topBtn}><Ionicons name="close" size={22} color={Colors.error} /></TouchableOpacity>
        <View style={s.topCenter}>
          <Text style={s.topTitle} numberOfLines={1}>{workout.day_name}</Text>
          <View style={s.topMeta}>
            <View style={s.liveDot} /><Text style={s.topTime}>{fmtElapsed(elapsedTime)}</Text>
            <Text style={s.topDiv}>·</Text><Text style={s.topProg}>{progressPct}%</Text>
          </View>
        </View>
        <TouchableOpacity onPress={completeWorkout} style={s.topDoneBtn}><Text style={s.topDoneText}>DONE</Text></TouchableOpacity>
      </View>
      <View style={s.progOuter}><View style={[s.progInner, { width: `${progressPct}%` }]} /></View>

      {/* Superset Transition Banner */}
      {ssTransition && (
        <View style={s.ssBanner} data-testid="ss-transition-banner">
          <View style={s.restLeft}>
            <Ionicons name="swap-horizontal" size={18} color="#FFF" />
            <Text style={s.restTime}>{ssTransitionTimer}s</Text>
            <Text style={s.restLabel}>TRANSITION{partnerEx ? ` → ${partnerEx.name.split(' ').slice(0, 2).join(' ')}` : ''}</Text>
          </View>
          <TouchableOpacity onPress={() => {
            if (ssPartnerIdx !== null) { setCurrentExIdx(ssPartnerIdx); setWeight(''); setReps(''); }
            setSsTransition(false); setSsPartnerIdx(null);
          }} style={s.skipBtn}>
            <Text style={s.skipText}>GO NOW</Text><Ionicons name="arrow-forward" size={14} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Rest Timer */}
      {restActive && !ssTransition && (
        <View style={[s.restBanner, isRPS && rpsRound <= 3 && { backgroundColor: '#7C3AED' }]}>
          <View style={s.restLeft}>
            <Ionicons name="timer-outline" size={18} color="#FFF" />
            <Text style={s.restTime}>{fmtTime(restTimer)}</Text>
            {isRPS && rpsRound > 1 ? <Text style={s.restLabel}>BREATHE · R{rpsRound}</Text> : <Text style={s.restLabel}>REST</Text>}
          </View>
          <TouchableOpacity onPress={() => { setRestActive(false); setRestTimer(0); }} style={s.skipBtn}>
            <Text style={s.skipText}>SKIP</Text><Ionicons name="play-forward" size={14} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Exercise Nav */}
      <View style={s.exNav}>
        <TouchableOpacity disabled={currentExIdx === 0} onPress={() => { setCurrentExIdx(i => i - 1); setShowAlts(false); setShowPlateCalc(false); setRpsRound(1); setRpsWeights([]); }} style={[s.navChevron, currentExIdx === 0 && s.navOff]}>
          <Ionicons name="chevron-back" size={20} color={currentExIdx === 0 ? Colors.muted : Colors.text} />
        </TouchableOpacity>
        <View style={s.exPills}>
          {exercises.map((_: any, idx: number) => {
            const exL = workout?.set_logs?.filter((sl: any) => sl.exercise_order === exercises[idx].order) || [];
            const exT = exercises[idx].sets_config?.length || 0;
            const done = exL.length >= exT && exT > 0;
            const ssGroup = exercises[idx].superset_group;
            const isSSPill = !!ssGroup;
            // Check if next exercise is same SS group (for connector)
            const nextIsSS = idx < exercises.length - 1 && exercises[idx + 1]?.superset_group === ssGroup && !!ssGroup;
            return (
              <View key={idx} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => { setCurrentExIdx(idx); setShowAlts(false); setShowPlateCalc(false); setRpsRound(1); setRpsWeights([]); }}
                  style={[s.pill, idx === currentExIdx && s.pillActive, done && s.pillDone, isSSPill && s.pillSS]}>
                  {done ? <Ionicons name="checkmark" size={12} color={Colors.success} /> : <Text style={[s.pillText, idx === currentExIdx && s.pillTextAct]}>{idx + 1}</Text>}
                </TouchableOpacity>
                {nextIsSS && <View style={s.ssConnector}><Ionicons name="swap-horizontal" size={8} color="#F59E0B" /></View>}
              </View>
            );
          })}
        </View>
        <TouchableOpacity disabled={currentExIdx === exercises.length - 1} onPress={() => { setCurrentExIdx(i => i + 1); setShowAlts(false); setShowPlateCalc(false); setRpsRound(1); setRpsWeights([]); }}
          style={[s.navChevron, currentExIdx === exercises.length - 1 && s.navOff]}>
          <Ionicons name="chevron-forward" size={20} color={currentExIdx === exercises.length - 1 ? Colors.muted : Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll} {...panResponder.panHandlers}>
        {currentEx && (
          <>
            {/* Exercise Header */}
            <View style={s.exCard}>
              <View style={s.exCardTop}>
                <View style={s.exCardLeft}>
                  <Text style={s.exName}>{currentEx.name}</Text>
                  <View style={s.exBadges}>
                    {isSupersetEx && <View style={[s.typeBadge, { backgroundColor: '#F59E0B20' }]}><Ionicons name="swap-horizontal" size={10} color="#F59E0B" /><Text style={[s.typeBadgeText, { color: '#F59E0B' }]}>SUPERSET</Text></View>}
                    {isRPS && <View style={[s.typeBadge, { backgroundColor: '#7C3AED20' }]}><Ionicons name="repeat" size={10} color="#7C3AED" /><Text style={[s.typeBadgeText, { color: '#7C3AED' }]}>RPS</Text></View>}
                    {isAlternating && <View style={[s.typeBadge, { backgroundColor: '#F59E0B20' }]}><Ionicons name="swap-horizontal" size={10} color="#F59E0B" /><Text style={[s.typeBadgeText, { color: '#F59E0B' }]}>ALT</Text></View>}
                    <View style={s.metaBadge}><Ionicons name="speedometer-outline" size={10} color={Colors.primaryLight} /><Text style={s.metaBadgeText}>{currentEx.tempo}</Text></View>
                    <View style={s.metaBadge}><Ionicons name="time-outline" size={10} color={Colors.primaryLight} /><Text style={s.metaBadgeText}>{currentEx.rest}</Text></View>
                  </View>
                </View>
                <View style={s.exProg}><Text style={s.exProgNum}>{setLogs.length}</Text><Text style={s.exProgDenom}>/{currentEx.sets_config?.length || 0}</Text></View>
              </View>
              {/* Action buttons row */}
              <View style={s.exActions}>
                <TouchableOpacity testID="toggle-alts" onPress={toggleAlts} style={[s.exActBtn, showAlts && s.exActBtnActive]}>
                  <Ionicons name="swap-horizontal-outline" size={14} color={showAlts ? Colors.primary : Colors.muted} />
                  <Text style={[s.exActText, showAlts && { color: Colors.primary }]}>Alternatives</Text>
                </TouchableOpacity>
                {showBarCalc && (
                  <TouchableOpacity testID="toggle-calc" onPress={() => setShowPlateCalc(!showPlateCalc)} style={[s.exActBtn, showPlateCalc && s.exActBtnActive]}>
                    <Ionicons name="calculator-outline" size={14} color={showPlateCalc ? Colors.primary : Colors.muted} />
                    <Text style={[s.exActText, showPlateCalc && { color: Colors.primary }]}>Plate Calc</Text>
                  </TouchableOpacity>
                )}
                {currentEx.video_url && (
                  <TouchableOpacity onPress={() => Linking.openURL(currentEx.video_url)} style={s.exActBtn}>
                    <Ionicons name="logo-youtube" size={14} color="#FF0000" />
                    <Text style={s.exActText}>Demo</Text>
                  </TouchableOpacity>
                )}
              </View>
              {/* Previous Performance */}
              {currentEx.prev_last && (
                <View style={s.prevPerf}>
                  <Ionicons name="time-outline" size={12} color={Colors.muted} />
                  <Text style={s.prevPerfText}>Last: </Text>
                  <Text style={s.prevPerfVal}>{currentEx.prev_last.weight} lbs × {currentEx.prev_last.reps}</Text>
                  {currentEx.prev_best_weight && (
                    <><Text style={s.prevPerfText}> · Best: </Text><Text style={s.prevPerfVal}>{currentEx.prev_best_weight} lbs</Text></>
                  )}
                </View>
              )}
            </View>

            {/* Alternatives Panel */}
            {showAlts && (
              <View style={s.altPanel}>
                <Text style={s.altTitle}>ALTERNATIVES</Text>
                {altsLoading ? <ActivityIndicator size="small" color={Colors.primary} style={{ padding: 12 }} /> : (
                  alternatives.length > 0 ? alternatives.map((alt, i) => (
                    <View key={i} style={[s.altRow, i > 0 && s.altBorder]}>
                      <View style={s.altInfo}>
                        <Text style={s.altName}>{alt.name}</Text>
                        <Text style={s.altMeta}>{alt.equipment} · {alt.shared_muscles?.join(', ')}</Text>
                      </View>
                      <TouchableOpacity onPress={() => swapExercise(alt.name)} style={s.swapBtn}>
                        <Text style={s.swapBtnText}>SWAP</Text>
                      </TouchableOpacity>
                      {alt.video_url ? (
                        <TouchableOpacity onPress={() => Linking.openURL(alt.video_url)} style={s.altVideoBtn}>
                          <Ionicons name="play-circle" size={20} color="#FF0000" />
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  )) : <Text style={s.altEmpty}>No alternatives found</Text>
                )}
              </View>
            )}

            {/* Plate Calculator Visual */}
            {showPlateCalc && showBarCalc && (
              <View style={s.plateCalcCard}>
                <Text style={s.plateCalcTitle}>PLATE CALCULATOR</Text>
                <Text style={s.plateCalcSub}>{BAR_WEIGHT}lb bar · Enter weight below</Text>
                {weight && parseFloat(weight) > BAR_WEIGHT ? (
                  <>
                    {/* Barbell visual */}
                    <View style={s.barbellWrap}>
                      {/* Left collar */}
                      <View style={s.barCollar} />
                      {/* Left plates (reversed) */}
                      <View style={s.platesLeft}>
                        {[...plateList].reverse().map((p, i) => (
                          <View key={`l${i}`} style={[s.plateVisual, { backgroundColor: PLATE_COLORS[p], width: PLATE_WIDTHS[p], height: 28 + p * 0.6 }]} />
                        ))}
                      </View>
                      {/* Bar */}
                      <View style={s.barShaft}>
                        <Text style={s.barLabel}>{BAR_WEIGHT}</Text>
                      </View>
                      {/* Right plates */}
                      <View style={s.platesRight}>
                        {plateList.map((p, i) => (
                          <View key={`r${i}`} style={[s.plateVisual, { backgroundColor: PLATE_COLORS[p], width: PLATE_WIDTHS[p], height: 28 + p * 0.6 }]} />
                        ))}
                      </View>
                      {/* Right collar */}
                      <View style={s.barCollar} />
                    </View>
                    {/* Plate legend */}
                    <View style={s.plateLegend}>
                      <Text style={s.plateLegendTitle}>Each side:</Text>
                      {plateList.length === 0 ? <Text style={s.plateLegendText}>Just the bar!</Text> : (
                        <View style={s.plateLegendRow}>
                          {plateList.map((p, i) => (
                            <View key={i} style={[s.plateLegendChip, { backgroundColor: PLATE_COLORS[p] + '25', borderColor: PLATE_COLORS[p] + '60' }]}>
                              <Text style={[s.plateLegendChipText, { color: PLATE_COLORS[p] }]}>{p}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  </>
                ) : (
                  <Text style={s.plateCalcEmpty}>{weight ? `${weight} lbs is at or below bar weight` : 'Enter a weight to see plates'}</Text>
                )}
              </View>
            )}

            {/* RPS Banner */}
            {isRPS && (
              <View style={s.rpsBanner}>
                <View style={s.rpsHeader}><Ionicons name="repeat" size={16} color="#7C3AED" /><Text style={s.rpsTitle}>Rest-Pause Set</Text></View>
                <View style={s.rpsRounds}>
                  {[1, 2, 3].map(r => (
                    <View key={r} style={[s.rpsItem, rpsRound === r && s.rpsItemAct, r < rpsRound && s.rpsItemDone]}>
                      {r < rpsRound ? <Ionicons name="checkmark" size={14} color={Colors.success} /> : <Text style={[s.rpsItemText, rpsRound === r && s.rpsItemTextAct]}>R{r}</Text>}
                    </View>
                  ))}
                </View>
                <Text style={s.rpsDesc}>{rpsRound <= 3 ? `Round ${rpsRound}: Go to failure → 10-15 breaths → next` : 'Complete!'}</Text>
              </View>
            )}

            {/* Prescribed Sets */}
            <View style={s.section}>
              <Text style={s.secLabel}>PRESCRIBED</Text>
              <View style={s.prescCard}>
                {currentEx.sets_config?.map((sc: any, i: number) => {
                  const logged = i < setLogs.length;
                  return (
                    <View key={i} style={[s.prescRow, i > 0 && s.prescBorder]}>
                      <View style={[s.setCircle, logged && s.setCircleDone]}>
                        {logged ? <Ionicons name="checkmark" size={12} color="#FFF" /> : <Text style={s.setCircleText}>{sc.set_num}</Text>}
                      </View>
                      <View style={s.prescInfo}><Text style={[s.prescReps, logged && s.prescRepsDone]}>{sc.reps} reps</Text><Text style={s.prescInst}>{sc.instruction}</Text></View>
                      {logged && setLogs[i] && (
                        <View style={s.loggedInline}><Text style={s.liW}>{setLogs[i].weight}</Text><Text style={s.liU}>lbs</Text><Text style={s.liX}>×</Text><Text style={s.liR}>{setLogs[i].reps}</Text></View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Log Input */}
            <View style={s.logSec}>
              <Text style={s.secLabel}>{isRPS ? `RPS ROUND ${rpsRound} OF 3` : `LOG SET ${setLogs.length + 1}`}</Text>
              <View style={[s.logCard, isRPS && { borderColor: '#7C3AED30' }]}>
                {/* Set timer indicator */}
                {setTimerActive && setLogs.length > 0 && (
                  <View style={s.setTimerRow}>
                    <Ionicons name="stopwatch-outline" size={14} color={Colors.primary} />
                    <Text style={s.setTimerText}>Time since last set: <Text style={s.setTimerVal}>{fmtTime(setTimer)}</Text></Text>
                  </View>
                )}
                {isRPS && rpsWeights.length > 0 && (
                  <View style={s.rpsLogged}>{rpsWeights.map((rw, i) => (
                    <View key={i} style={s.rpsLogRow}><Text style={s.rpsLogLabel}>R{i + 1}</Text><Text style={s.rpsLogVal}>{rw.weight} × {rw.reps}</Text></View>
                  ))}</View>
                )}
                <View style={s.inputRow}>
                  <View style={s.inputCol}>
                    <Text style={s.inputLabel}>WEIGHT (lbs)</Text>
                    <View style={s.inputWithBtns}>
                      <TouchableOpacity onPress={() => adjustWeight(-5)} style={s.incBtn}><Text style={s.incBtnText}>−5</Text></TouchableOpacity>
                      <TextInput testID="weight-input" style={s.inputCenter} value={weight} onChangeText={setWeight} keyboardType="numeric" placeholder="—" placeholderTextColor={Colors.muted} />
                      <TouchableOpacity onPress={() => adjustWeight(5)} style={s.incBtn}><Text style={s.incBtnText}>+5</Text></TouchableOpacity>
                    </View>
                  </View>
                  <View style={s.inputX}><Text style={s.inputXText}>×</Text></View>
                  <View style={s.inputCol}><Text style={s.inputLabel}>REPS</Text>
                    <TextInput testID="reps-input" style={s.input} value={reps} onChangeText={setReps} keyboardType="numeric" placeholder="—" placeholderTextColor={Colors.muted} />
                  </View>
                </View>
                <TouchableOpacity testID="log-set-btn" style={[s.logBtn, isRPS && { backgroundColor: '#7C3AED' }, (!weight || !reps) && s.logBtnOff]} activeOpacity={0.7} onPress={isRPS ? logRpsRound : logSet} disabled={!weight || !reps}>
                  <Ionicons name={isRPS ? "repeat" : "checkmark-circle"} size={20} color="#FFF" />
                  <Text style={s.logBtnText}>{isRPS ? (rpsRound < 3 ? `LOG R${rpsRound} → REST` : 'LOG R3 → DONE') : 'LOG SET'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Stats */}
            <View style={s.statsRow}>
              <View style={s.statBox}><Text style={s.statVal}>{totalSetsLogged}</Text><Text style={s.statLbl}>Sets</Text></View>
              <View style={s.statBox}><Text style={s.statVal}>{(workout?.set_logs?.reduce((sum: number, l: any) => sum + (l.weight * l.reps), 0) || 0).toLocaleString()}</Text><Text style={s.statLbl}>Volume</Text></View>
              <View style={s.statBox}><Text style={s.statVal}>{exercises.length - currentExIdx}</Text><Text style={s.statLbl}>Left</Text></View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  loadText: { fontSize: FontSizes.sm, color: Colors.muted },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  topBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  topCenter: { flex: 1, alignItems: 'center' },
  topTitle: { fontSize: FontSizes.base, fontWeight: '700', color: Colors.text },
  topMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
  topTime: { fontSize: FontSizes.xs, color: Colors.textSecondary, fontWeight: '600', fontVariant: ['tabular-nums'] },
  topDiv: { fontSize: FontSizes.xs, color: Colors.muted },
  topProg: { fontSize: FontSizes.xs, color: Colors.primary, fontWeight: '700' },
  topDoneBtn: { backgroundColor: Colors.success, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.sm },
  topDoneText: { fontSize: FontSizes.xs, fontWeight: '800', color: '#FFF', letterSpacing: 1 },
  progOuter: { height: 3, backgroundColor: Colors.border },
  progInner: { height: 3, backgroundColor: Colors.primary },
  restBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.primaryDark, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  restLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  restTime: { fontSize: FontSizes.xl, fontWeight: '800', color: '#FFF', fontVariant: ['tabular-nums'] },
  restLabel: { fontSize: FontSizes.xs, fontWeight: '600', color: 'rgba(255,255,255,0.6)', letterSpacing: 1 },
  skipBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.sm },
  skipText: { fontSize: FontSizes.xs, fontWeight: '700', color: '#FFF' },
  exNav: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, gap: Spacing.xs },
  navChevron: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center' },
  navOff: { opacity: 0.3 },
  exPills: { flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 6, flexWrap: 'wrap' },
  pill: { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  pillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  pillDone: { backgroundColor: Colors.success + '20', borderColor: Colors.success + '60' },
  pillText: { fontSize: 11, fontWeight: '700', color: Colors.muted },
  pillTextAct: { color: '#FFF' },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: 120, paddingTop: Spacing.sm },
  exCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  exCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  exCardLeft: { flex: 1, marginRight: Spacing.md },
  exName: { fontSize: FontSizes.xl, fontWeight: '800', color: Colors.text, letterSpacing: -0.3 },
  exBadges: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm, flexWrap: 'wrap' },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  metaBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primary + '12', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  metaBadgeText: { fontSize: 10, fontWeight: '600', color: Colors.primaryLight },
  exProg: { alignItems: 'center' },
  exProgNum: { fontSize: FontSizes.xxxl, fontWeight: '900', color: Colors.primary },
  exProgDenom: { fontSize: FontSizes.sm, color: Colors.muted, fontWeight: '600', marginTop: -4 },
  exActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.md },
  exActBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: Colors.surfaceHighlight },
  exActBtnActive: { backgroundColor: Colors.primary + '15', borderWidth: 1, borderColor: Colors.primary + '30' },
  exActText: { fontSize: 11, fontWeight: '600', color: Colors.muted },
  // Alternatives
  altPanel: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  altTitle: { fontSize: 10, fontWeight: '700', color: Colors.muted, letterSpacing: 1.5, padding: Spacing.md, paddingBottom: 0 },
  altRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.sm },
  altBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  altInfo: { flex: 1 },
  altName: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.text },
  altMeta: { fontSize: 10, color: Colors.muted, marginTop: 2 },
  altVideoBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  swapBtn: { backgroundColor: Colors.primary + '15', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 1, borderColor: Colors.primary + '30' },
  swapBtnText: { fontSize: 10, fontWeight: '700', color: Colors.primary, letterSpacing: 0.5 },
  altEmpty: { fontSize: FontSizes.sm, color: Colors.muted, padding: Spacing.md },
  // Previous Performance
  prevPerf: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.md, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border },
  prevPerfText: { fontSize: FontSizes.xs, color: Colors.muted },
  prevPerfVal: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.textSecondary },
  // Plate Calc
  plateCalcCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  plateCalcTitle: { fontSize: 10, fontWeight: '700', color: Colors.muted, letterSpacing: 1.5 },
  plateCalcSub: { fontSize: FontSizes.xs, color: Colors.muted, marginTop: 2, marginBottom: Spacing.md },
  plateCalcEmpty: { fontSize: FontSizes.sm, color: Colors.muted, textAlign: 'center', paddingVertical: Spacing.md },
  barbellWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.lg, gap: 0 },
  barCollar: { width: 6, height: 18, backgroundColor: '#666', borderRadius: 2 },
  barShaft: { height: 10, backgroundColor: '#888', minWidth: 60, justifyContent: 'center', alignItems: 'center', borderRadius: 2 },
  barLabel: { fontSize: 8, fontWeight: '700', color: '#FFF' },
  platesLeft: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  platesRight: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  plateVisual: { borderRadius: 3 },
  plateLegend: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.md },
  plateLegendTitle: { fontSize: FontSizes.xs, fontWeight: '600', color: Colors.text, marginBottom: Spacing.sm },
  plateLegendText: { fontSize: FontSizes.sm, color: Colors.muted },
  plateLegendRow: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  plateLegendChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  plateLegendChipText: { fontSize: FontSizes.sm, fontWeight: '700' },
  // RPS
  rpsBanner: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.lg, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border, borderLeftWidth: 3, borderLeftColor: '#7C3AED40' },
  rpsHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  rpsTitle: { fontSize: FontSizes.sm, fontWeight: '700', color: '#7C3AED' },
  rpsRounds: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  rpsItem: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surfaceHighlight, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: Colors.border },
  rpsItemAct: { borderColor: '#7C3AED', backgroundColor: '#7C3AED15' },
  rpsItemDone: { backgroundColor: Colors.success + '20', borderColor: Colors.success + '60' },
  rpsItemText: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.muted },
  rpsItemTextAct: { color: '#7C3AED' },
  rpsDesc: { fontSize: FontSizes.xs, color: Colors.muted, lineHeight: 18 },
  rpsLogged: { marginBottom: Spacing.md, gap: 4 },
  rpsLogRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  rpsLogLabel: { fontSize: 11, fontWeight: '700', color: Colors.success, width: 24 },
  rpsLogVal: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  // Prescribed
  section: { marginBottom: Spacing.md },
  secLabel: { fontSize: 10, fontWeight: '700', color: Colors.muted, letterSpacing: 1.5, marginBottom: Spacing.sm },
  prescCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  prescRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.md },
  prescBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  setCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.surfaceHighlight, justifyContent: 'center', alignItems: 'center' },
  setCircleDone: { backgroundColor: Colors.success },
  setCircleText: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.primary },
  prescInfo: { flex: 1 },
  prescReps: { fontSize: FontSizes.base, fontWeight: '600', color: Colors.text },
  prescRepsDone: { color: Colors.muted, textDecorationLine: 'line-through' },
  prescInst: { fontSize: 11, color: Colors.muted, marginTop: 1 },
  loggedInline: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  liW: { fontSize: FontSizes.base, fontWeight: '700', color: Colors.success },
  liU: { fontSize: 10, color: Colors.muted },
  liX: { fontSize: 10, color: Colors.muted, marginHorizontal: 2 },
  liR: { fontSize: FontSizes.base, fontWeight: '700', color: Colors.success },
  // Log
  logSec: { marginBottom: Spacing.lg },
  logCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.primary + '30' },
  setTimerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md, backgroundColor: Colors.primary + '08', padding: Spacing.sm, borderRadius: BorderRadius.sm },
  setTimerText: { fontSize: FontSizes.xs, color: Colors.muted },
  setTimerVal: { fontWeight: '700', color: Colors.primary, fontVariant: ['tabular-nums'] as any },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  inputCol: { flex: 1 },
  inputLabel: { fontSize: 9, fontWeight: '700', color: Colors.muted, letterSpacing: 1, marginBottom: 4 },
  inputWithBtns: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  incBtn: { width: 36, height: 52, backgroundColor: Colors.surfaceHighlight, borderRadius: BorderRadius.sm, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  incBtnText: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.primary },
  inputCenter: { flex: 1, height: 52, backgroundColor: Colors.background, borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: Colors.border, textAlign: 'center', fontSize: FontSizes.xxl, fontWeight: '800', color: Colors.text },
  input: { height: 52, backgroundColor: Colors.background, borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: Colors.border, textAlign: 'center', fontSize: FontSizes.xxl, fontWeight: '800', color: Colors.text },
  inputX: { paddingTop: 16 },
  inputXText: { fontSize: FontSizes.lg, color: Colors.muted, fontWeight: '300' },
  logBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingVertical: Spacing.lg, marginTop: Spacing.md },
  logBtnOff: { opacity: 0.3 },
  logBtnText: { fontSize: FontSizes.base, fontWeight: '800', color: '#FFF', letterSpacing: 1 },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xxl },
  statBox: { flex: 1, backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  statVal: { fontSize: FontSizes.lg, fontWeight: '800', color: Colors.text },
  statLbl: { fontSize: 9, color: Colors.muted, fontWeight: '600', letterSpacing: 0.5, marginTop: 2 },
  // Superset
  pillSS: { borderWidth: 1.5, borderColor: '#F59E0B50' },
  ssConnector: { width: 14, height: 14, justifyContent: 'center', alignItems: 'center', marginHorizontal: -2 },
  ssBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: 10, backgroundColor: '#D97706' },
});
