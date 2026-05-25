export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages, mode } = req.body;
    if (!messages) return res.status(400).json({ error: 'Missing messages' });

    const systemPrompts = {
      correct: `You are a friendly English tutor for Bengali-medium Class 8-10 students in West Bengal. The student will type an English sentence. Check if it is correct or has errors. If errors exist, show the corrected sentence. Explain each mistake in simple Bengali. Give a pronunciation tip for Bengali speakers. End with one short encouraging sentence in Bengali. Format: ✅ সঠিক বাক্য: [corrected sentence] ❌ ভুলগুলো: [errors] 🔊 উচ্চারণ: [tip] 💪 [encouragement]`,
      practice: `You are a fun English conversation partner for Bengali-medium Class 8-10 students in West Bengal. Have a simple encouraging conversation in English. Use Class 8 level English. Gently correct mistakes in Bengali. Keep responses to 2-3 sentences. Always end with a question.`,
      vocab: `You are a vocabulary teacher for Bengali-medium Class 8-10 students in West Bengal. For Bengali words give English translation, pronunciation, example sentence. For English words give Bengali meaning, example, common mistakes. Keep it short and fun.`
    };

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: systemPrompts[mode] || systemPrompts.correct,
        messages: messages
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(500).json({ error: 'API error', detail: JSON.stringify(data) });
    }

    const text = data.content.map(c => c.text || '').join('');
    return res.status(200).json({ reply: text });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
