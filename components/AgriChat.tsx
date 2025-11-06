import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, Chat } from "@google/genai";
import { analyzeImage, getComplexAdvice } from '../services/geminiService';
import { ChatMessage } from '../types';
import Card from './common/Card';
import Spinner from './common/Spinner';
import ChatIcon from './icons/ChatIcon';
import UploadIcon from './icons/UploadIcon';
import MicIcon from './icons/MicIcon';
import StopIcon from './icons/StopIcon';
import SparklesIcon from './icons/SparklesIcon';

// Helper: base64 encode
function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

// Helper: base64 decode
function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

// Helper: Decode raw PCM audio data
async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}


const AgriChat: React.FC = () => {
    const [ai, setAi] = useState<GoogleGenAI | null>(null);
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [image, setImage] = useState<{ b64: string; file: File } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isThinkingMode, setIsThinkingMode] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [sessionPromise, setSessionPromise] = useState<Promise<any> | null>(null);
    
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Audio Refs
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    
    useEffect(() => {
        const initAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
        setAi(initAi);
        setChat(initAi.chats.create({ model: 'gemini-2.5-flash' }));
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!userInput.trim() && !image) return;
        setError('');
        setIsLoading(true);

        const userMessage: ChatMessage = {
            role: 'user',
            parts: [{ text: userInput }],
            image: image?.b64,
        };
        setMessages(prev => [...prev, userMessage]);

        const currentInput = userInput;
        const currentImage = image;
        setUserInput('');
        setImage(null);
        
        try {
            let responseText = '';
            if (currentImage) {
                responseText = await analyzeImage(currentInput, currentImage.b64, currentImage.file.type);
            } else if (isThinkingMode && ai) {
                const history = messages.filter(m => m.role !== 'user' || m.parts[0].text !== currentInput).map(m => ({role: m.role, parts: m.parts}));
                responseText = await getComplexAdvice(currentInput, history);
            } else if(chat) {
                const stream = await chat.sendMessageStream({ message: currentInput });
                let tempResponseText = '';
                let modelMessageAdded = false;
                for await (const chunk of stream) {
                    tempResponseText += chunk.text;
                    if (!modelMessageAdded) {
                        setMessages(prev => [...prev, { role: 'model', parts: [{ text: tempResponseText }] }]);
                        modelMessageAdded = true;
                    } else {
                        setMessages(prev => {
                            const newMessages = [...prev];
                            newMessages[newMessages.length - 1].parts[0].text = tempResponseText;
                            return newMessages;
                        });
                    }
                }
                responseText = tempResponseText;
            }

            if (!isThinkingMode && currentImage) {
                 setMessages(prev => [...prev, { role: 'model', parts: [{ text: responseText }] }]);
            } else if(isThinkingMode) {
                setMessages(prev => [...prev, { role: 'model', parts: [{ text: responseText }] }]);
            }

        } catch (err) {
            console.error(err);
            setError('An error occurred while getting a response.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = (reader.result as string).split(',')[1];
                setImage({ b64: base64String, file: file });
            };
            reader.readAsDataURL(file);
        }
        e.target.value = ''; // Allow re-uploading the same file
    };

    const stopRecording = useCallback(async () => {
        setIsRecording(false);
        if (sessionPromise) {
            const session = await sessionPromise;
            session.close();
            setSessionPromise(null);
        }
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        scriptProcessorRef.current?.disconnect();
        mediaStreamSourceRef.current?.disconnect();
        
        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            inputAudioContextRef.current.close();
        }
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            outputAudioContextRef.current.close();
        }
    }, [sessionPromise]);

    const handleToggleRecording = async () => {
        if (isRecording) {
            stopRecording();
            return;
        }

        if (!ai) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            setIsRecording(true);
            setUserInput(''); // Clear input on record start

            // FIX: Cast window to any to access vendor-prefixed webkitAudioContext for broader browser support.
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            // FIX: Cast window to any to access vendor-prefixed webkitAudioContext for broader browser support.
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            const newSessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                },
                callbacks: {
                    onopen: () => {
                        if (!inputAudioContextRef.current || !mediaStreamRef.current) return;
                        mediaStreamSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
                        scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);

                        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            newSessionPromise.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };

                        mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            setUserInput(prev => prev + message.serverContent.inputTranscription.text);
                        }
                        // Ignore audio output and output transcription as per user request
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live session error:', e);
                        setError('A microphone connection error occurred.');
                        stopRecording();
                    },
                    onclose: (e: CloseEvent) => {
                        console.log('Live session closed');
                    },
                }
            });
            setSessionPromise(newSessionPromise);
        } catch (err) {
            console.error('Failed to get microphone access:', err);
            setError('Microphone access denied. Please enable it in your browser settings.');
            setIsRecording(false);
        }
    };

    function createBlob(data: Float32Array): Blob {
        const l = data.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
            int16[i] = data[i] * 32768;
        }
        return {
            data: encode(new Uint8Array(int16.buffer)),
            mimeType: 'audio/pcm;rate=16000',
        };
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            <Card title="Agri-Chat" icon={<ChatIcon/>}>
                <div className="flex-1 flex flex-col">
                    <div className="flex-grow overflow-y-auto p-4 bg-gray-900/50 rounded-lg min-h-[300px] space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-lg p-3 rounded-xl ${msg.role === 'user' ? 'bg-green-700 text-white' : 'bg-gray-700 text-gray-200'}`}>
                                    {msg.image && <img src={`data:image/jpeg;base64,${msg.image}`} alt="User upload" className="rounded-lg mb-2 max-w-xs"/>}
                                    <p className="whitespace-pre-wrap">{msg.parts[0].text}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && <Spinner/>}
                        <div ref={chatEndRef} />
                    </div>
                    {error && <div className="mt-2 text-center text-red-400">{error}</div>}
                    <div className="mt-4">
                        {image && (
                            <div className="relative inline-block mb-2">
                                <img src={`data:image/jpeg;base64,${image.b64}`} alt="Preview" className="h-20 w-20 object-cover rounded-lg"/>
                                <button onClick={() => setImage(null)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">&times;</button>
                            </div>
                        )}
                        <div className="flex items-center gap-2 p-2 bg-gray-800 rounded-lg">
                            <label htmlFor="image-upload" className="p-2 text-gray-400 hover:text-green-400 cursor-pointer rounded-full hover:bg-gray-700">
                                <UploadIcon/>
                            </label>
                            <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange}/>
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                                placeholder={isRecording ? "Listening..." : "Ask a question or describe the image..."}
                                className="flex-1 bg-transparent focus:outline-none text-white disabled:text-gray-500"
                                disabled={isLoading || isRecording}
                            />
                            <button onClick={handleSendMessage} disabled={isLoading || isRecording || (!userInput.trim() && !image)} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg disabled:bg-gray-600">
                                Send
                            </button>
                             <button onClick={handleToggleRecording} disabled={isLoading} className={`p-2 rounded-full transition-colors ${isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-700 text-green-400 hover:bg-gray-600'}`}>
                                {isRecording ? <StopIcon/> : <MicIcon/>}
                            </button>
                        </div>
                         <div className="flex items-center justify-end mt-2">
                            <label htmlFor="thinking-mode" className="flex items-center cursor-pointer">
                                <div className="relative">
                                    <input id="thinking-mode" type="checkbox" className="sr-only" checked={isThinkingMode} onChange={() => setIsThinkingMode(!isThinkingMode)} />
                                    <div className="block bg-gray-600 w-10 h-6 rounded-full"></div>
                                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isThinkingMode ? 'translate-x-full bg-green-400' : ''}`}></div>
                                </div>
                                <div className="ml-3 text-gray-300 text-sm font-medium flex items-center">
                                    <SparklesIcon className={`mr-1 ${isThinkingMode ? 'text-green-400' : 'text-gray-500'}`} />
                                    Thinking Mode
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default AgriChat;