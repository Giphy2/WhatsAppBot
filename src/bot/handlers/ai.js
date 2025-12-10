// src/bot/handlers/ai.js
const { GoogleGenerativeAI } = require("@google/generative-ai")

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY)

async function getAIResponse(userId, userName, message) {
    try {
        // Personalize the prompt
        const prompt = `This is a WhatsApp chat. The user is named ${userName} (ID: ${userId}). Respond helpfully and conversationally.\nUser: ${message}`
        const model = genAI.getGenerativeModel({ model: "gemini-pro" })
        const result = await model.generateContent(prompt)
        const response = result.response.text()
        return response
    } catch (err) {
        console.error("AI error:", err)
        return "⚠️ Sorry, I couldn't get a response from the AI right now."
    }
}

module.exports = { getAIResponse }
