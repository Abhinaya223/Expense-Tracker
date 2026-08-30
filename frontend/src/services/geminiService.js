// Gemini API Service for Ledgerframe AI Finance Assistant
// Note: For any public deployment, this API call should be proxied through a backend server
// so the VITE_GEMINI_API_KEY isn't exposed client-side.

const GEMINI_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-2.5-flash',
  'gemini-flash-latest',
];

const SYSTEM_INSTRUCTION_TEXT =
  "You are Ledgerframe's finance assistant. You may ONLY discuss the user's own expense-tracking data, budgeting, and saving habits within this app, using only the numbers given to you in the user's message — never invent figures. If asked about anything else (general knowledge, coding, unrelated advice, other topics), decline in one short, friendly sentence and steer the conversation back to their spending.";

export async function askGeminiFinanceAssistant(userQuery, spendingData) {
  // 1. Read and sanitize the API key from Vite environment variables
  const rawApiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const apiKey = rawApiKey ? String(rawApiKey).trim().replace(/^["']|["']$/g, '') : '';

  console.log(
    '[Gemini API] Runtime check - Key loaded:',
    apiKey ? `${apiKey.substring(0, 8)}... (length: ${apiKey.length})` : '(none/empty)'
  );

  // 2. Validate placeholder or missing key
  const isPlaceholder =
    !apiKey ||
    apiKey.includes('your-gemini-api-key') ||
    apiKey.includes('your-api-key') ||
    apiKey === 'placeholder';

  if (isPlaceholder) {
    const msg =
      'Gemini API key is missing or set to placeholder in .env. Please set VITE_GEMINI_API_KEY in .env.';
    console.error('[Gemini API Config Error]', msg);
    throw new Error(msg);
  }

  const { total, budget, categories, transactionCount, month, expensesList } = spendingData;

  let contextText = `User's Expense & Budget Summary for ${month}:\n`;
  contextText += `- Total Monthly Spending: $${total.toFixed(2)}\n`;
  if (budget > 0) {
    const remaining = budget - total;
    const pct = ((total / budget) * 100).toFixed(1);
    contextText += `- Monthly Budget Target: $${budget.toFixed(2)}\n`;
    contextText += `- Remaining Budget: $${remaining.toFixed(2)}\n`;
    contextText += `- Budget Utilization: ${pct}%\n`;
  } else {
    contextText += `- Monthly Budget Target: No budget set yet\n`;
  }
  contextText += `- Total Transactions Count: ${transactionCount}\n`;
  contextText += `- Spending Breakdown by Category:\n`;
  const catEntries = Object.entries(categories || {});
  if (catEntries.length > 0) {
    catEntries.forEach(([cat, amt]) => {
      contextText += `  * ${cat}: $${amt.toFixed(2)}\n`;
    });
  } else {
    contextText += `  * No expenses recorded in categories yet.\n`;
  }

  if (expensesList && expensesList.length > 0) {
    contextText += `- Recent Expenses Detail:\n`;
    expensesList.slice(0, 15).forEach((e) => {
      contextText += `  * Date: ${e.date}, Category: ${e.category}, Amount: $${(e.amount || 0).toFixed(2)}${
        e.note ? `, Note: "${e.note}"` : ''
      }\n`;
    });
  }

  const promptText = `Data Context:\n${contextText}\n\nUser Message / Question:\n${
    userQuery ||
    'Please analyze my spending summary and give me concise insights and recommendations based strictly on my numbers.'
  }`;

  const requestBody = {
    system_instruction: {
      parts: [
        {
          text: SYSTEM_INSTRUCTION_TEXT,
        },
      ],
    },
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: promptText,
          },
        ],
      },
    ],
  };

  let lastError = null;

  // Try available Gemini models in sequence
  for (const modelName of GEMINI_MODELS) {
    const endpointUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(
      apiKey
    )}`;

    try {
      const response = await fetch(endpointUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        const textReply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textReply) {
          return textReply;
        }
      } else {
        const errorBody = await response.json().catch(() => ({}));
        console.warn(`[Gemini API] Model ${modelName} returned ${response.status}:`, errorBody);
        lastError = errorBody.error?.message || `HTTP ${response.status}`;
      }
    } catch (netError) {
      console.error(`[Gemini API Network Error] Model ${modelName}:`, netError);
      lastError = netError.message;
    }
  }

  throw new Error(`Gemini API Error: ${lastError || 'Failed to generate response'}`);
}
