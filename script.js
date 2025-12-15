import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);

async function listModels() {
    const models = await genAI.listModels();
    console.log(models);
}

listModels();
