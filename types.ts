export interface LivestockTask {
  day: string;
  tasks: {
    time: string;
    activity: string;
    details: string;
  }[];
}

export interface CurrentWeather {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
}

export interface ForecastDay {
    day: string;
    high: number;
    low: number;
    condition: string;
}

export interface WeatherData {
    location: string;
    current: CurrentWeather;
    forecast: ForecastDay[];
}

export interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
    image?: string; // base64 string for display
}