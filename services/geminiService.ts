import { GoogleGenAI } from "@google/genai";
import { MenuItem } from "../types";
import { MENU_ITEMS } from "../constants";

let aiClient: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!aiClient) {
    // In a real scenario, we might handle missing keys more gracefully in the UI
    const apiKey = process.env.API_KEY || '';
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

export const generateMenuRecommendation = async (
  userQuery: string, 
  contextOrders: string[] = []
): Promise<string> => {
  try {
    const client = getAiClient();
    const menuContext = JSON.stringify(MENU_ITEMS.map(item => ({
      name: item.name,
      desc: item.description,
      tags: [
        item.isVegetarian ? 'vegetarian' : '',
        item.isSpicy ? 'spicy' : '',
        item.category
      ].filter(Boolean).join(', '),
      price: item.price
    })));

    const prompt = `
      You are a polite and knowledgeable waiter at a restaurant.
      Here is our Menu Data: ${menuContext}
      
      The customer asks: "${userQuery}"
      
      ${contextOrders.length > 0 ? `The customer has already ordered: ${contextOrders.join(', ')}` : ''}
      
      Provide a short, appetizing recommendation (max 2 sentences) based on the menu. 
      If they ask about dietary restrictions, answer accurately based on the menu data.
      Do not invent items not on the menu.
    `;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "I'm sorry, I couldn't find a recommendation for that.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to the kitchen (AI) right now. Please ask a human waiter!";
  }
};