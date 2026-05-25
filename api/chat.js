export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages, mode } = req.body;
  if (!messages) return res.status(400).json({ error: 'Missing messages' });

  const systemPrompts = {
    correct: `You are a friendly English tutor for Bengali-medium Class 8-10 students in West Bengal. 
The student will type an English sentence. You must:
1. Check if it's correct or has errors
2. If errors exist, show the corrected sentence
3. Explain each mistake in SIMPLE Bengali
4. Give a pronunciation tip for Bengali speakers
5. End with one short encouraging sentence in Bengali

Format your response clearly with these sections:
✅ সঠিক বাক্য: [corrected sentence]
❌ ভুলগুলো: [list each error simply]  
🔊 উচ্চারণ: [one pronunciation tip]
💪 [encouragement in Bengali]

If the sentence is already perfect, say so enthusiastically in Bengali.`,

    practice: `You are a fun English conversation partner for Bengali-medium Class 8-10 students in West Bengal.
Have a simple, encouraging conversation in English.
- Use very simple English (Class 8 level)
- When the student makes a grammar mistake, gently correct it in Bengali then continue
- Ask simple follow-up questions to keep them talking
- Keep responses SHORT (2-3 sentences max)
- Always end with a question to keep the conversation going`,

    vocab: `You are a vocabulary teacher for Bengali-medium Class 8-10 students in West Bengal.
When the student sends a Bengali word: give English word, pronunciation guide, one example sentence.
When they send an English word: give Bengali meaning, example sentence, common mistakes Bengali speakers make.
Keep everything short, fun, and encouraging.`
  };

  try {
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
        messages
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(500).json({ error: 'API error' });

    const text = data.content.map(c => c.text || '').join('');
    return res.status(200).json({ reply: text });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
