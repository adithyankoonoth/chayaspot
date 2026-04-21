const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function getCoordinatesFromGroq(name, address) {
  if (!GROQ_API_KEY) {
    console.warn('No Groq API key set');
    return null;
  }
  try {
    const response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        max_tokens: 100,
        temperature: 0,
        messages: [{
          role: 'user',
          content: `What are the GPS coordinates of "${name}" at "${address}" in Kerala, India? Return ONLY a JSON object like {"lat": 11.2588, "lng": 75.7804} with no explanation, no markdown, nothing else.`
        }]
      }),
    });

    if (!response.ok) {
      console.error('Groq API error:', response.status, await response.text());
      return null;
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim() || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    if (parsed.lat && parsed.lng) return { lat: parsed.lat, lng: parsed.lng };
    return null;
  } catch (err) {
    console.error('Groq error:', err);
    return null;
  }
}