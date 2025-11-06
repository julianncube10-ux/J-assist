import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getCropAdvice = async (soil: string, ph: string, location: string) => {
    const prompt = `
        You are an expert agronomist providing advice to a farmer. You have access to Google Search and Google Maps for the most up-to-date information.
        
        Farmer's Details:
        - Soil Type: ${soil}
        - Soil pH: ${ph}
        - Location: ${location}

        Task:
        Based on these details, recommend the top 3 most profitable and suitable crops to grow. For each crop, provide:
        1.  **Crop Name:**
        2.  **Reason for Recommendation:** Why it's suitable for the given soil, pH, and location.
        3.  **Planting Guide:** Brief, essential steps for planting.
        4.  **Expected Yield:** e.g., in tonnes per hectare.
        5.  **Potential Challenges:** Common pests, diseases, or issues.
        6.  **Recent Market Trends:** Use Google Search to find recent market information, demand, or prices for this crop relevant to the farmer's region.
        7.  **Local Resources:** Use Google Maps to find 1-2 nearby farm supply stores or markets relevant to this crop.

        Format the response clearly in Markdown.
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            tools: [{googleSearch: {}}, {googleMaps: {}}]
        }
    });

    return {
        text: response.text,
        groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? []
    };
};

export const analyzeImage = async (prompt: string, imageBase64: string, mimeType: string) => {
    const imagePart = {
        inlineData: {
            data: imageBase64,
            mimeType: mimeType,
        },
    };
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
    });
    return response.text;
};

export const getComplexAdvice = async (prompt: string, history: any[]) => {
     const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
        config: {
            thinkingConfig: { thinkingBudget: 32768 }
        },
    });
    return response.text;
}

export const getLivestockSchedule = async (type: string, count: number, stage: string) => {
    const prompt = `
        You are an expert in animal husbandry. Create a detailed weekly management schedule for a farm with ${count} ${type} at the ${stage} stage.
        The schedule should cover key activities for each day of the week (Monday to Sunday). 
        Include details on feeding (what and when), health checks, hygiene/cleaning, and any other relevant management practices to ensure high productivity and animal welfare.
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                description: "A weekly schedule with tasks for each day.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        day: { type: Type.STRING, description: "Day of the week (e.g., Monday)." },
                        tasks: {
                            type: Type.ARRAY,
                            description: "A list of tasks for the day.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    time: { type: Type.STRING, description: "Time of the activity (e.g., 6:00 AM)." },
                                    activity: { type: Type.STRING, description: "Name of the activity (e.g., Morning Feeding)." },
                                    details: { type: Type.STRING, description: "Specific instructions for the activity." }
                                },
                                required: ['time', 'activity', 'details']
                            }
                        }
                    },
                    required: ['day', 'tasks']
                }
            }
        }
    });
    return response.text;
};

export const getBudgetAnalysis = async (income: string, expenses: string) => {
    const prompt = `
        You are a farm financial advisor. Analyze the following farm budget and provide actionable advice.
        
        Farm's Monthly Financials:
        - **Income Sources & Amounts:** ${income}
        - **Expense Items & Costs:** ${expenses}

        Task:
        1.  Calculate the Net Monthly Profit/Loss.
        2.  Provide a brief analysis of the financial situation.
        3.  Offer 5 actionable, specific tips to optimize the budget. These tips should focus on reducing costs, increasing revenue streams, or improving financial management for this specific farm context.
        
        Format the response clearly with headings for each section (Analysis, Actionable Tips).
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text;
};

export const getWeatherData = async (location: string) => {
    const prompt = `
        Act as a weather API. For the location "${location}", provide the current weather and a 7-day forecast.
        Use standard metric units (Celsius, km/h).
        The condition string should be one of: "Sunny", "Partly Cloudy", "Cloudy", "Rain", "Thunderstorm", "Snow".
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    location: { type: Type.STRING, description: "The name of the location provided." },
                    current: {
                        type: Type.OBJECT,
                        description: "The current weather conditions.",
                        properties: {
                            temperature: { type: Type.NUMBER, description: "Current temperature in Celsius." },
                            condition: { type: Type.STRING, description: "A brief description of the weather (e.g., Sunny, Cloudy)." },
                            humidity: { type: Type.NUMBER, description: "Humidity percentage." },
                            windSpeed: { type: Type.NUMBER, description: "Wind speed in km/h." }
                        },
                        required: ["temperature", "condition", "humidity", "windSpeed"]
                    },
                    forecast: {
                        type: Type.ARRAY,
                        description: "A 7-day weather forecast.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                day: { type: Type.STRING, description: "Day of the week (e.g., Monday)." },
                                high: { type: Type.NUMBER, description: "Highest temperature for the day in Celsius." },
                                low: { type: Type.NUMBER, description: "Lowest temperature for the day in Celsius." },
                                condition: { type: Type.STRING, description: "Forecasted weather condition." }
                            },
                            required: ["day", "high", "low", "condition"]
                        }
                    }
                },
                required: ["location", "current", "forecast"]
            }
        }
    });
    return response.text;
};