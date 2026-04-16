import { Injectable, Logger } from '@nestjs/common';
import Groq from 'groq-sdk';

export interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

@Injectable()
export class NutritionService {
  private readonly logger = new Logger(NutritionService.name);
  private readonly groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  async analyze(description: string): Promise<NutritionData | null> {
    if (!description?.trim()) return null;
    try {
      const completion = await this.groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        max_tokens: 128,
        messages: [
          {
            role: 'user',
            content: `Estima los valores nutricionales aproximados de esta comida. Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional, con las claves: calories (kcal), protein (g), carbs (g), fat (g), fiber (g). Todos valores numéricos enteros.\n\nComida: ${description}`,
          },
        ],
      });

      const text = completion.choices[0]?.message?.content?.trim() ?? '';
      const json = JSON.parse(text.replace(/```json?|```/g, '').trim());
      return {
        calories: Math.round(json.calories ?? 0),
        protein:  Math.round(json.protein  ?? 0),
        carbs:    Math.round(json.carbs    ?? 0),
        fat:      Math.round(json.fat      ?? 0),
        fiber:    Math.round(json.fiber    ?? 0),
      };
    } catch (err) {
      this.logger.warn(`Nutrition analysis failed: ${err.message}`);
      return null;
    }
  }
}
