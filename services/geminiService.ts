import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { getApiKey, MissingApiKeyError } from './apiKey.ts';

// A client per key: the key can be added or changed in Settings at any time,
// so it is read on every call instead of once when the module loads.
let cached: { key: string; ai: GoogleGenAI } | null = null;
function client(): GoogleGenAI {
    const key = getApiKey();
    if (!key) throw new MissingApiKeyError();
    if (!cached || cached.key !== key) cached = { key, ai: new GoogleGenAI({ apiKey: key }) };
    return cached.ai;
}

export const generateText = async (prompt: string): Promise<GenerateContentResponse> => {
    const ai = client();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 0 } // For lower latency
            }
        });
        return response;
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Failed to generate content from Gemini API.");
    }
};

export const generateGemConfiguration = async (prompt: string, schema: object): Promise<GenerateContentResponse> => {
    const ai = client();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });
        return response;
    } catch (error) {
        console.error("Gemini API (JSON Mode) Error:", error);
        throw new Error("Failed to generate structured content from Gemini API.");
    }
};

export const generateImage = async (prompt: string): Promise<string> => {
    const ai = client();
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        }
        throw new Error("No image was generated.");

    } catch (error) {
        console.error("Gemini Image Generation Error:", error);
        throw new Error("Failed to generate image from Gemini API.");
    }
};
