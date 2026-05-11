const axios = require('axios');

const HF_ROUTER_CHAT = 'https://router.huggingface.co/v1/chat/completions';

/** When HF_CHAT_MODEL is unset, try these in order (router picks a provider with :fastest). */
const DEFAULT_MODEL_TRY_ORDER = [
  'Qwen/Qwen2.5-1.5B-Instruct:fastest',
  'meta-llama/Llama-3.2-1B-Instruct:fastest',
  'HuggingFaceTB/SmolLM2-360M-Instruct:fastest',
  'google/gemma-2-2b-it:fastest',
];

function huggingFaceToken() {
  return (
    process.env.HF_API_KEY ||
    process.env.HF_TOKEN ||
    process.env.HUGGINGFACEHUB_API_TOKEN ||
    ''
  ).trim();
}

function extractChatReply(data) {
  if (!data || typeof data !== 'object') return '';
  const choice = data.choices && data.choices[0];
  const fromMessage = choice?.message?.content ?? choice?.text;
  if (typeof fromMessage === 'string' && fromMessage.trim()) {
    return fromMessage.trim();
  }
  if (Array.isArray(data) && data[0]?.generated_text) {
    const t = data[0].generated_text;
    return typeof t === 'string' ? t.trim() : '';
  }
  return '';
}

function extractRouterError(errBody, statusText) {
  if (!errBody) return statusText || 'Unknown error';
  if (typeof errBody === 'string') return errBody.slice(0, 500);
  const e = errBody.error;
  if (typeof e === 'string') return e;
  if (e && typeof e.message === 'string') return e.message;
  return statusText || 'Unknown error';
}

const chatWithAi = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || String(message).trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
      });
    }

    const token = huggingFaceToken();
    if (!token) {
      // eslint-disable-next-line no-console
      console.error('Missing Hugging Face token: set HF_API_KEY or HF_TOKEN in backend/.env');
      return res.status(500).json({
        success: false,
        error: 'AI configuration error',
      });
    }

    const userModel = (process.env.HF_CHAT_MODEL || '').trim();
    const modelsToTry = userModel
      ? userModel.includes(':')
        ? [userModel]
        : [userModel, `${userModel}:fastest`]
      : DEFAULT_MODEL_TRY_ORDER;

    const systemPrompt =
      process.env.HF_SYSTEM_PROMPT ||
      'You are the MONEY BANK Internet Banking assistant. Answer clearly and briefly about banking, accounts, cards, and security tips. Never ask for passwords, PINs, OTPs, or full card or account numbers. If the user asks for something unsafe or unrelated to banking, politely decline.';

    const userContent = String(message).trim();
    const bodyBase = {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      max_tokens: 512,
      temperature: 0.7,
    };

    let lastDetail = 'No model succeeded';
    for (const model of modelsToTry) {
      const response = await axios.post(
        HF_ROUTER_CHAT,
        { ...bodyBase, model },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 120000,
          validateStatus: () => true,
        }
      );

      if (response.status >= 200 && response.status < 300) {
        const reply = extractChatReply(response.data);
        if (reply) {
          return res.status(200).json({
            success: true,
            reply,
          });
        }
        // eslint-disable-next-line no-console
        console.error('HF empty reply for model', model, JSON.stringify(response.data).slice(0, 400));
        lastDetail = 'Empty AI response';
        continue;
      }

      lastDetail = extractRouterError(response.data, response.statusText);
      // eslint-disable-next-line no-console
      console.error('HF router error', model, response.status, lastDetail);

      if (response.status === 429) {
        break;
      }
    }

    return res.status(502).json({
      success: false,
      error: 'AI request failed',
      details: lastDetail,
    });
  } catch (error) {
    const detail =
      error.response?.data?.error?.message ||
      error.response?.data?.error ||
      error.response?.data ||
      error.message;
    // eslint-disable-next-line no-console
    console.error('AI ERROR:', detail);
    return res.status(500).json({
      success: false,
      error: 'AI request failed',
      details: detail,
    });
  }
};

module.exports = {
  chatWithAi,
};