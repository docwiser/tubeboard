import { GoogleGenAI, Type, Schema } from "@google/genai";

export const SCHEMAS = {
  TRANSCRIPTION_ADVANCED: {
    type: Type.OBJECT,
    properties: {
      segments: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            startTime: { type: Type.STRING, description: "Start time of the segment (e.g., 00:00:05)" },
            endTime: { type: Type.STRING, description: "End time of the segment" },
            transcript: { type: Type.STRING, description: "Original transcript text" },
            transcriptionLanguage: { type: Type.STRING, description: "Language code (e.g., en-US)" },
            englishEquivalent: { type: Type.STRING, description: "English translation if applicable" },
            type: { type: Type.STRING, description: "Type of speech (e.g., dialogue, narration)" },
            speakerGender: { type: Type.STRING, description: "Estimated gender of the speaker" },
            speakerInfo: { type: Type.STRING, description: "Brief description of the speaker" },
          },
          required: ["startTime", "endTime", "transcript"],
        },
      },
    },
  },

  SCENE_DESCRIPTION: {
    type: Type.OBJECT,
    properties: {
      scenes: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            startTime: { type: Type.STRING },
            endTime: { type: Type.STRING },
            descriptionText: { type: Type.STRING, description: "Detailed visual description of the scene" },
            keyObjects: { type: Type.ARRAY, items: { type: Type.STRING } },
            mood: { type: Type.STRING },
          },
          required: ["startTime", "endTime", "descriptionText"],
        },
      },
    },
  },

  QUIZ: {
    type: Type.OBJECT,
    properties: {
      questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER },
            questionType: { type: Type.STRING, enum: ["multiple_choice", "single_choice", "short_answer", "long_answer"] },
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.STRING },
            difficulty: { type: Type.STRING, enum: ["easy", "medium", "hard"] },
            explanation: { type: Type.STRING },
          },
          required: ["question", "options", "correctAnswer"],
        },
      },
    },
  },

  FLASHCARDS: {
    type: Type.OBJECT,
    properties: {
      flashcards: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            front: { type: Type.STRING, description: "The question or concept on the front of the card" },
            back: { type: Type.STRING, description: "The answer or definition on the back of the card" },
            tag: { type: Type.STRING, description: "Category or topic tag" },
          },
          required: ["front", "back"],
        },
      },
    },
  },
};

export class GeminiService {
  private client: GoogleGenAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenAI({ apiKey });
  }

  async generate(
    model: string,
    prompt: string,
    videoUrl: string,
    schema?: any,
    systemInstruction?: string
  ) {
    try {
      const config: any = {
        temperature: 0.7,
      };

      if (schema) {
        config.responseMimeType = "application/json";
        config.responseSchema = schema;
      }

      if (systemInstruction) {
        config.systemInstruction = systemInstruction;
      }

      const response = await this.client.models.generateContent({
        model: model,
        contents: {
          role: "user",
          parts: [
            {
              fileData: {
                fileUri: videoUrl,
                mimeType: "video/mp4",
              },
            },
            { text: prompt },
          ],
        },
        config: config,
      });

      return {
        text: response.text,
        usage: response.usageMetadata,
      };
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }

  async chatStream(
    model: string,
    history: any[],
    message: string,
    videoUrl: string
  ) {
    const contents = [
      {
        role: "user",
        parts: [
          {
            fileData: {
              fileUri: videoUrl,
              mimeType: "video/mp4",
            },
          },
          { text: "Analyze this video for our conversation." },
        ],
      },
      {
        role: "model",
        parts: [{ text: "Understood. I have analyzed the video. What would you like to know?" }],
      },
      ...history.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      })),
      {
        role: "user",
        parts: [{ text: message }],
      },
    ];

    return await this.client.models.generateContentStream({
      model: model,
      contents: contents,
    });
  }
}
