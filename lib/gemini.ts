import axios from 'axios';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export async function askGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    console.error('Gemini API key is missing.');
    throw new Error('Gemini API key is missing.');
  }
  try {
    console.log('Sending prompt to Gemini:', prompt);
    const { data } = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] },
      { headers: { 'Content-Type': 'application/json' } }
    );
    console.log('Gemini API response:', data);
    const candidates = data?.candidates;
    if (candidates?.length) {
      return candidates[0].content.parts[0].text;
    }
    return 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return 'Sorry, there was an error processing your request.';
  }
}
