import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

export const PROMPT_VERSION = "v1";

const ai = new GoogleGenAI({}); // reads GEMINI_API_KEY from env :contentReference[oaicite:3]{index=3}

export const EvaluationSchema = z.object({
    score: z.number().int().min(0).max(10),
    feedback: z.string().min(1),
    idealAnswer: z.string().min(1),
    tags: z.array(z.string()).default([]),
});

export type Evaluation = z.infer<typeof EvaluationSchema>;

export async function evaluateAnswer(params: {
    role: string;
    difficulty: string;
    questionPrompt: string;
    answerText: string;
}): Promise<Evaluation> /*answer return type must be Promise<Evaluation> type*/ {
    const { role, difficulty, questionPrompt, answerText } = params;

    //provide instruction, prompt, question, user's answer, and expected output infos we want to Gemini API
    const systemInstruction =
        "You are an interview evaluator. Be strict, concise, and helpful. Output must match the JSON schema.";

    const prompt = `
Role: ${role}
Difficulty: ${difficulty}

Question:
${questionPrompt}

Candidate answer:
${answerText}

Return JSON with:
- score (0-10)
- feedback (actionable, short)
- idealAnswer (best possible short answer)
- tags (array of short strings)
`.trim();

    // What to send and force output structure to be in EvaluationSchema
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseJsonSchema: zodToJsonSchema(EvaluationSchema), //converting zod schema to json format so that Gemini can understand the output structure we want
            temperature: 0.3,
        },
    });

    // response.text should be JSON string when responseMimeType: "application/json" as instructed to Gemini API
    const raw = response.text ?? "";
    let parsed: unknown; //declare parsed variable so that its accessible both inside try block and outside to use in EvaluationSchema.safeParse(parsed);

    try {
        parsed = JSON.parse(raw);
    } catch {
        // If model returns something odd, fail loudly (we keep v1 minimal)
        throw new Error("Gemini returned invalid JSON");
    }

    const validated = EvaluationSchema.safeParse(parsed); 
    if (!validated.success) {
        throw new Error("Gemini JSON did not match schema");
    }

    return validated.data; //return evaluated  answer
}
