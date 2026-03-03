import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "dummy-key", // In production, this should be in .env
});

export async function getAIAdvice(context: string) {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Tu es un assistant IA expert pour les artisans et entrepreneurs français. Tu as accès aux données publiques françaises via un serveur MCP. Fournis des conseils pratiques, clairs et exploitables en te basant sur le contexte fourni.",
        },
        {
          role: "user",
          content: context,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });

    return completion.choices[0]?.message?.content || "Désolé, je n'ai pas pu générer de conseils pour le moment.";
  } catch (error) {
    console.error("Groq API Error:", error);
    return "Une erreur est survenue lors de la génération des conseils IA.";
  }
}
