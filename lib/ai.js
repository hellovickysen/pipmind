const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

function model() {
  return process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';
}

const SYSTEM = `You are an elite forex trading coach reviewing a single trade from a trader's journal. Be specific, honest, and constructive — a sharp mentor, not a cheerleader. Identify real mistakes with evidence from the data provided, acknowledge what was done well, and give one clear, actionable fix. Never invent numbers or facts that are not in the data. If the journal is sparse, infer cautiously and say so.

Respond with ONLY valid JSON (no markdown, no commentary) matching exactly this shape:
{
  "grade": "A" | "B" | "C" | "D" | "F",
  "execution_score": <integer 0-100>,
  "summary": "<one or two sentence verdict>",
  "mistakes": [ { "title": "<short label>", "severity": "critical" | "high" | "medium" | "low", "detail": "<one sentence referencing the data>" } ],
  "went_well": [ "<short point>" ],
  "fix": "<the single most important actionable fix>"
}`;

function tradeToText(trade, journal) {
  const L = [];
  L.push('Pair: ' + (trade.pair || '?'));
  L.push('Direction: ' + (trade.direction || '?'));
  if (trade.entry_price != null) L.push('Entry: ' + trade.entry_price);
  if (trade.exit_price != null) L.push('Exit: ' + trade.exit_price);
  if (trade.stop_loss != null) L.push('Stop loss: ' + trade.stop_loss);
  if (trade.take_profit != null) L.push('Take profit: ' + trade.take_profit);
  if (trade.lot_size != null) L.push('Lot size: ' + trade.lot_size);
  if (trade.pnl != null) L.push('Result P&L ($): ' + trade.pnl);
  if (trade.r_multiple != null) L.push('R multiple: ' + trade.r_multiple);
  if (trade.setup) L.push('Setup/strategy: ' + trade.setup);
  if (trade.timeframe) L.push('Timeframe: ' + trade.timeframe);
  if (trade.opened_at) L.push('Opened: ' + trade.opened_at);
  if (trade.closed_at) L.push('Closed: ' + trade.closed_at);
  if (journal) {
    if (journal.confidence != null) L.push('Confidence at entry (1-5): ' + journal.confidence);
    const emo = Array.isArray(journal.emotions) ? journal.emotions : [];
    L.push('Emotions tagged: ' + (emo.length ? emo.join(', ') : 'none'));
    L.push('Trader note: ' + (journal.note ? journal.note : '(none)'));
  } else {
    L.push('Journal: (none provided)');
  }
  return L.join('\n');
}

function extractJson(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (e) {}
  const a = text.indexOf('{');
  const b = text.lastIndexOf('}');
  if (a >= 0 && b > a) {
    try {
      return JSON.parse(text.slice(a, b + 1));
    } catch (e) {}
  }
  return null;
}

export async function analyzeTradeWithAI(trade, journal) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    throw new Error('AI is not configured yet (missing OpenRouter API key in environment).');
  }
  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + key,
      'Content-Type': 'application/json',
      'X-Title': 'PipMind',
    },
    body: JSON.stringify({
      model: model(),
      temperature: 0.4,
      max_tokens: 900,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: 'Analyze this trade:\n\n' + tradeToText(trade, journal) },
      ],
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error('AI request failed (' + res.status + '): ' + t.slice(0, 200));
  }
  const data = await res.json();
  const content = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  const parsed = extractJson(content);
  if (!parsed) {
    throw new Error('Could not parse the AI response.');
  }
  return parsed;
}
