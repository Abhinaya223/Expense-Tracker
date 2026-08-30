import { askGeminiFinanceAssistant } from './geminiService';

export { askGeminiFinanceAssistant };

// Legacy / Helper wrapper using Gemini API
export async function getInsights(spendingData) {
  return await askGeminiFinanceAssistant(
    'Please analyze my spending summary and provide concise insights and actionable tips based strictly on these numbers.',
    spendingData
  );
}
