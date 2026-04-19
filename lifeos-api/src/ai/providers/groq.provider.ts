import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import type { AiService, FitnessContext, FitnessPlan } from '../ai.service';

const SYSTEM_PROMPT = `Eres un entrenador personal experto en fitness y nutrición. Responde SIEMPRE con JSON válido que siga EXACTAMENTE este esquema:
{
  "summary": "string (2-3 frases)",
  "workoutPlan": {
    "days": [
      {
        "day": "Lunes",
        "focus": "string (ej. pecho y tríceps)",
        "exercises": [
          { "name": "string", "sets": 4, "reps": "8-12", "rest": "60s" }
        ]
      }
    ]
  },
  "mealPlan": {
    "breakfast": "string",
    "lunch": "string",
    "dinner": "string",
    "snacks": ["string"],
    "kcalEstimate": 2400
  }
}
Sin markdown, sin texto adicional, solo JSON.`;

@Injectable()
export class GroqProvider implements AiService {
  private readonly logger = new Logger(GroqProvider.name);
  private readonly client: Groq;

  constructor(config: ConfigService) {
    this.client = new Groq({ apiKey: config.get<string>('GROQ_API_KEY') });
  }

  async generateFitnessPlan(context: FitnessContext): Promise<FitnessPlan> {
    const userPrompt = this.buildPrompt(context);
    this.logger.log(`GROQ generateFitnessPlan — goal: ${context.goal}`);

    try {
      const completion = await this.client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error('empty response');
      return JSON.parse(content) as FitnessPlan;
    } catch (err) {
      this.logger.error(`GROQ error: ${err}`);
      throw new InternalServerErrorException('AI generation failed');
    }
  }

  private buildPrompt(ctx: FitnessContext): string {
    const goalText = {
      gain: 'ganar masa muscular',
      lose: 'perder grasa',
      maintain: 'mantener el estado físico',
    }[ctx.goal];

    const lines: string[] = [`Genera un plan de entrenamiento semanal (4-5 días) y plan de alimentación para una persona con objetivo: ${goalText}.`];
    if (ctx.heightCm) lines.push(`Altura: ${ctx.heightCm}cm`);
    if (ctx.weightKg) lines.push(`Peso: ${ctx.weightKg}kg`);
    if (ctx.age) lines.push(`Edad: ${ctx.age} años`);
    if (ctx.notes) lines.push(`Notas: ${ctx.notes}`);
    return lines.join('\n');
  }
}
