import { invokeLLM } from "./_core/llm";
import { z } from "zod";

export async function performSemanticSearch(query: string, clientContext?: any) {
  try {
    // Use GPT-4 to analyze and extract structured information from the search query
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are an expert OSINT analyst. Analyze customer information and extract key intelligence.
          Return structured JSON with the following fields:
          - searchTerms: array of key search terms
          - riskFactors: array of identified risk factors
          - recommendations: array of recommended actions
          - confidence: number between 0-100`,
        },
        {
          role: "user",
          content: `Analyze this customer query and provide intelligence insights:\n${query}\n\nContext: ${JSON.stringify(clientContext || {})}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "osint_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              searchTerms: {
                type: "array",
                items: { type: "string" },
                description: "Key search terms extracted",
              },
              riskFactors: {
                type: "array",
                items: { type: "string" },
                description: "Identified risk factors",
              },
              recommendations: {
                type: "array",
                items: { type: "string" },
                description: "Recommended actions",
              },
              confidence: {
                type: "number",
                description: "Confidence score 0-100",
              },
            },
            required: ["searchTerms", "riskFactors", "recommendations", "confidence"],
            additionalProperties: false,
          },
        },
      },
    });

    // Parse the response
    const content = response.choices[0]?.message.content;
    if (!content) {
      throw new Error("No response from LLM");
    }

    const parsed = typeof content === "string" ? JSON.parse(content) : content;
    return parsed;
  } catch (error) {
    console.error("Error in semantic search:", error);
    throw error;
  }
}

export async function analyzeOSINTResults(results: any) {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are an expert at analyzing OSINT search results. 
          Extract and summarize key information about the person.
          Identify workplace, social media, probable address, and assess risk level.`,
        },
        {
          role: "user",
          content: `Analyze these OSINT results and provide structured intelligence:\n${JSON.stringify(results)}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "osint_summary",
          strict: true,
          schema: {
            type: "object",
            properties: {
              summary: {
                type: "string",
                description: "Overall summary of findings",
              },
              workplace: {
                type: "object",
                properties: {
                  company: { type: "string" },
                  position: { type: "string" },
                  confidence: { type: "number" },
                },
              },
              socialMedia: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    platform: { type: "string" },
                    profile: { type: "string" },
                    confidence: { type: "number" },
                  },
                },
              },
              address: {
                type: "object",
                properties: {
                  location: { type: "string" },
                  confidence: { type: "number" },
                },
              },
              riskLevel: {
                type: "string",
                enum: ["low", "medium", "high"],
              },
            },
            required: ["summary", "workplace", "socialMedia", "address", "riskLevel"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message.content;
    if (!content) {
      throw new Error("No response from LLM");
    }

    return typeof content === "string" ? JSON.parse(content) : content;
  } catch (error) {
    console.error("Error analyzing OSINT results:", error);
    throw error;
  }
}
