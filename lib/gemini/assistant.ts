import { askGemini } from './gemini';
import { PRODUCT_CONTEXT } from './prompt';

export const SECTION_KEYWORDS: { [key: string]: string } = {
  overview: 'section-overview',
  features: 'section-features',
  pricing: 'section-pricing',
  faq: 'section-faq',
  integrations: 'section-integrations',
  support: 'section-support',
  contact: 'section-contact',
  onboarding: 'section-onboarding',
  security: 'section-security',
};

export async function getAssistantResponse(message: string): Promise<{ type: 'scroll' | 'answer', data: string }> {
  for (const keyword in SECTION_KEYWORDS) {
    if (message.toLowerCase().includes(keyword)) {
      return { type: 'scroll', data: SECTION_KEYWORDS[keyword] };
    }
  }
  const prompt = `${PRODUCT_CONTEXT}\nUser: ${message}\nAssistant:`;
  try {
    const answer = await askGemini(prompt);
    return { type: 'answer', data: answer };
  } catch (error) {
    return { type: 'answer', data: 'Sorry, there was an error processing your request.' };
  }
} 