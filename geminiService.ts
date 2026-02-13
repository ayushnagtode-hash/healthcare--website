
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeHealthCondition = async (
  symptoms: string,
  imageContent?: string // Base64
): Promise<AnalysisResult> => {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `
    You are the AyushLens Symptom Correlation Engine. 
    Your task is to analyze user-reported symptoms and optional visual evidence.
    
    CORE REQUIREMENTS:
    1. Act as a correlation engine: compare symptoms against a medical knowledge database.
    2. Provide a RANKED LIST of potential conditions (Correlation Report).
    3. Each condition must have a likelihood score (0.0 to 1.0) and a brief reason why it matches.
    4. Identify a 'Primary Condition' which is the most likely match.
    5. Assess overall severity: Low, Moderate, High, Emergency.
    
    LEGAL COMPLIANCE:
    - ALWAYS include a prominent medical disclaimer.
    - Explicitly state you are an AI, not a professional medical diagnosis.
  `;

  const prompt = `Symptoms described: ${symptoms}. ${imageContent ? "Analysis of the attached visual evidence is required." : "No visual evidence provided, rely on text description."}`;

  const parts: any[] = [{ text: prompt }];
  if (imageContent) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageContent.split(",")[1] || imageContent,
      },
    });
  }

  const response = await ai.models.generateContent({
    model,
    contents: { parts },
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          primaryCondition: { type: Type.STRING },
          correlationReport: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                likelihood: { type: Type.NUMBER },
                reason: { type: Type.STRING }
              },
              required: ["name", "likelihood", "reason"]
            }
          },
          severity: { type: Type.STRING, enum: ["Low", "Moderate", "High", "Emergency"] },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          disclaimer: { type: Type.STRING },
          summary: { type: Type.STRING }
        },
        required: ["primaryCondition", "correlationReport", "severity", "recommendations", "disclaimer", "summary"]
      },
    },
  });

  const resultStr = response.text;
  if (!resultStr) throw new Error("Correlation Engine failed to return data");
  
  return JSON.parse(resultStr) as AnalysisResult;
};
