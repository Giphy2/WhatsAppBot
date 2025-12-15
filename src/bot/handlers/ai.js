// src/bot/handlers/ai.js
// Provides an AI response function with a multi-provider fallback system.
// Priority: OpenAI > Google Gemini > Hugging Face.
// A simple local reply is used if no keys are available.

const fetch = global.fetch || require('node-fetch');
console.log("OpenAI key inside handler:", !!process.env.OPENAI_API_KEY);


async function getAIResponse(userId, userName, message) {
    const prompt = `You are a helpful WhatsApp assistant. The user is named ${userName} (ID: ${userId}).
Respond concisely and helpfully in a friendly tone. User: ${message}`;

    // 1) OpenAI - highest priority
    if (process.env.OPENAI_API_KEY) {
        try {
            // Dynamically require so code doesn't fail when package/key not present
            const { OpenAI } = require('openai');
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            
            const completion = await openai.chat.completions.create({
                model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: `You are a helpful WhatsApp assistant. The user is named ${userName}. Respond concisely and helpfully in a friendly tone.` },
                    { role: "user", content: message }
                ],
            });

            if (completion.choices[0].message.content) {
                return completion.choices[0].message.content.trim();
            }
            throw new Error("OpenAI returned an empty response.");
            
        } 
        
        catch (err) {
            console.error('OpenAI AI error (falling back):', err);
            console.error("❌ OPENAI ERROR:", err);
            // Fall through to next option
        }
        console.log("🔍 USING OPENAI...");
        console.log("MODEL:", process.env.OPENAI_MODEL || "gpt-3.5-turbo");
        console.log("OPENAI KEY IS:", process.env.OPENAI_API_KEY ? "LOADED" : "MISSING");

    }

    // 2) Optional Gemini (Google) - only used if explicitly requested and key present
    // Google Gemini
if (process.env.GOOGLE_GENAI_API_KEY && process.env.USE_GEMINI === 'true') {
    try {
        console.log("🔵 Using Google Gemini...");
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);

        // TRY MODELS IN ORDER – first one your account supports will work
        const tryModels = [
            "gemini-1.5-flash",
            "gemini-1.5-flash-8b",
            "gemini-1.5-flash-latest",
            "gemini-1.5-pro",
            "gemini-pro",               // fallback for old accounts
        ];

        let model;

        for (const name of tryModels) {
            try {
                model = genAI.getGenerativeModel({ model: name });
                console.log(`✔ Using model: ${name}`);
                break;
            } catch (err) {
                console.log(`❌ Model not available: ${name}`);
            }
        }

        if (!model) throw new Error("No Gemini model available for your key!");

        const result = await model.generateContent(prompt);

        const text =
            typeof result?.response?.text === "function"
                ? result.response.text()
                : result?.response?.text;

        if (!text) throw new Error("Gemini returned empty response");

        return text.trim();

    } catch (err) {
        console.error("❌ Gemini AI error:", err);
    }
}


    // 3) Hugging Face Inference API (free tier available)
    if (process.env.HUGGINGFACE_API_KEY) {
        try {
            const model = process.env.HF_MODEL || 'gpt2';
            const url = `https://api-inference.huggingface.co/models/${model}`;
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ inputs: prompt, options: { wait_for_model: true, use_cache: false } })
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`HF inference error ${res.status}: ${text}`);
            }

            const json = await res.json();
            if (Array.isArray(json) && json[0]?.generated_text) {
                return json[0].generated_text;
            }
            if (json.generated_text) return json.generated_text;
            if (typeof json === 'string') return json;
            return JSON.stringify(json);
        } catch (err) {
            console.error('Hugging Face AI error (falling back):', err);
            // Fall through to simple fallback
        }
    }

    // 4) Local/simple fallback (no external key available)
    const simpleReplies = [
        `Hi ${userName}, I can help with that — please type a short question or set up an AI key for richer answers.`,
        `Hey ${userName}! I don't have an AI key configured yet. To enable smart replies, add OPENAI_API_KEY, GOOGLE_GENAI_API_KEY, or HUGGINGFACE_API_KEY to your .env.`
    ];
    return `${simpleReplies[Math.floor(Math.random() * simpleReplies.length)]}\n\nYou asked: "${message}"`;
}

module.exports = { getAIResponse };
