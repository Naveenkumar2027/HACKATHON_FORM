import { GoogleGenAI, ThinkingLevel, Modality, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const generateMascot = async (prompt: string, size: "1K" | "2K" | "4K" = "1K") => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [
        {
          text: `A futuristic robotic mascot for a hackathon team. Style: high-end tech, neon accents, cinematic lighting. Prompt: ${prompt}`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: size
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
};

export const editMascot = async (base64Image: string, prompt: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image.split(',')[1],
            mimeType: "image/png",
          },
        },
        {
          text: `Modify this robotic mascot: ${prompt}`,
        },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image edited");
};

export const brainstormProject = async (teamName: string, interests: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `We are team "${teamName}". Our interests are: ${interests}. We are participating in "Wired Weekend" robotics hackathon. Help us brainstorm 3 innovative robotics project ideas that can be built in 48 hours. Provide a detailed breakdown for each.`,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
    }
  });

  return response.text;
};

export const getAssistantResponse = async (query: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: query,
    config: {
      systemInstruction: "You are a helpful assistant for the Wired Weekend Robotics Hackathon. Answer questions about the event, robotics, and coding. Keep it futuristic and encouraging.",
    }
  });

  return response.text;
};
