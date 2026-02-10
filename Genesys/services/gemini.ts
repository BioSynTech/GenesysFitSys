import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyD9aTyy61zIciMpl8JPr73TWqLq--RW8AM");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const gerarTreinoIA = async (userData: any) => {
  const prompt = `
    És o Personal Trainer do GenesysFit. 
    Gere um treino motivador e curto para:
    Nome: ${userData.username}, Peso: ${userData.peso}kg, Nível: ${userData.level}.
    Dá 3 exercícios, explica a execução e termina com uma frase de motivação "papo reto". 
    Seja direto e use emojis.
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
};