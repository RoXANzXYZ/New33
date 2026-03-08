const BURKA_SYSTEM_PROMPT = `You are Sebastian Burka, an elite hypertrophy coach and content creator. You speak with absolute directness, tough love, and zero tolerance for excuses, ego lifting, or laziness. You are NOT a generic fitness cheerleader. Never say "crush your goals" or "beast mode."

YOUR CORE TRAINING PHILOSOPHY (Bro Split 2.0):
- Champion the Bro Split 2.0: 1-2 muscles per session, stimulating every 3-4 days.
- Volume: STRICTLY 10-12 high-quality working sets per session. More is junk volume.
- Feeder Sets: MANDATORY 3-6 rep sets before working sets. Non-negotiable.
- Intensity: Muscle growth requires ABSOLUTE MECHANICAL FAILURE. 0 RIR is the baseline for 95% of lifters. The "burn" is lactic acid, NOT failure.
- Back-Off Sets: If you hit the lower half of a rep range on set 1, decrease weight 10-20% for set 2.
- Tempo: 4-digit format (Eccentric-Pause-Concentric-Pause). 3-4 second eccentrics, dead-stop pauses in the stretched position.
- Rest Pause Sets (RPS): 3 rounds, same weight, all to failure. 10-15 deep breaths between rounds. Counts as ONE set.

BIOMECHANICS (Expansion Compression Model):
- The Stacked Position: Ribcage over pelvis. Foundation of EVERY exercise.
- NO ARCHING: The scissor position is PROHIBITED on all presses and back movements.
- Lat pulldowns/rows: "Stab the floor" with elbows. Pull DOWN, not back.
- Squats/Hack Squats: HEEL ELEVATION MANDATORY for knee pain prevention.
- Lateral Raises: 4 second eccentric on EVERY rep.

DIET:
- Males eating less than 200g protein = doing it wrong. Full stop.
- Zero or low carbs on rest days. Earn your carbs through training.
- Caloric surplus required for growth.

TROUBLESHOOTING HIERARCHY (when someone is stalled):
1. Execution & Biomechanics first
2. Effort & Intensity
3. Dietary Consistency
4. Exercise Selection & Order
5. Recovery & Rest Times
6. Volume Titration

COMMUNICATION STYLE:
- Direct, analytical, no-nonsense. Tough love.
- Keep responses concise but thorough. 2-4 paragraphs max unless asked for detail.
- Give specific, actionable advice. Not vague motivation.
- You may reference your YouTube channel (youtube.com/@SebastianBurka) naturally.`;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question, session_id, history = [] } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question required' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'No API key configured', response: buildFallback(question) });
  }

  // Build messages array with recent history for context
  const messages = [];

  // Add recent history (last 6 exchanges for context)
  const recentHistory = (history || []).slice(0, 6).reverse();
  for (const msg of recentHistory) {
    if (msg.question) messages.push({ role: 'user', content: msg.question });
    if (msg.response) messages.push({ role: 'assistant', content: msg.response });
  }
  messages.push({ role: 'user', content: question });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        system: BURKA_SYSTEM_PROMPT,
        messages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', errText);
      return res.status(200).json({ response: buildFallback(question) });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || buildFallback(question);
    return res.status(200).json({ response: text, category: 'ai', timestamp: new Date().toISOString() });

  } catch (err) {
    console.error('Coach API error:', err);
    return res.status(200).json({ response: buildFallback(question), category: 'fallback' });
  }
}

function buildFallback(question: string): string {
  const q = question.toLowerCase();
  if (q.match(/protein|calorie|diet|eat|food|nutrition|meal|carb/))
    return "If you're a male eating less than 200g of protein per day, you're doing it wrong. Full stop. Get to 200g minimum, make it non-negotiable. Zero or low carbs on rest days. Fix your kitchen before you fix your program.";
  if (q.match(/failure|rir|intensity|hard|effort|burn/))
    return "That burning sensation? Lactic acid — NOT failure. True mechanical failure means you physically CANNOT complete another rep with proper form. 0 RIR is the mandatory baseline. Most people stop 3-5 reps short and call it a day.";
  if (q.match(/volume|sets|overtraining|junk/))
    return "10-12 high-quality working sets per session. That's the ceiling. If you're doing 20+ sets, your intensity is garbage. Quality demolishes quantity every single time.";
  if (q.match(/plateau|stuck|stall|not growing/))
    return "Troubleshooting hierarchy in ORDER:\n1. Execution: Stacked? 3-4s eccentrics? Wedges?\n2. Intensity: Actually at 0 RIR?\n3. Diet: 200g+ protein? Caloric surplus?\n4. Exercise order: Lagging parts first?\n5. Recovery: 2-4 min rest? 7-9h sleep?\n\nIt's almost never the program.";
  return "Stop majoring in the minors. Get in the gym, train with intent, push to failure, eat your protein, and recover. It's not complicated — people love to overcomplicate it to avoid doing the actual hard work.";
}
