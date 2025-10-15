import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Initialize the GoogleGenAI client once.
// The API key MUST be obtained from the environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


export const generateText = async (prompt: string): Promise<GenerateContentResponse> => {
    if (!process.env.API_KEY) throw new Error("API Key is missing from environment variables.");
    
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
    if (!process.env.API_KEY) throw new Error("API Key is missing from environment variables.");

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
    if (!process.env.API_KEY) throw new Error("API Key is missing from environment variables.");

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
