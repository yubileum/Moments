import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { createPcmBlob, decodeAudioData, base64ToUint8Array } from "./audioUtils";

const apiKey = process.env.API_KEY || ""; 
const ai = new GoogleGenAI({ apiKey });

// --- Live API Management ---
let session: any = null;
let inputAudioContext: AudioContext | null = null;
let outputAudioContext: AudioContext | null = null;
let stream: MediaStream | null = null;
let processor: ScriptProcessorNode | null = null;
let source: MediaStreamAudioSourceNode | null = null;
let nextStartTime = 0;
const sources = new Set<AudioBufferSourceNode>();

export const connectLiveSession = async (
  onOpen: () => void,
  onClose: () => void,
  onError: (e: any) => void,
  onAudioData: (isPlaying: boolean) => void
) => {
  if (!apiKey) {
    onError(new Error("API Key missing"));
    return;
  }

  // Cleanup existing
  await disconnectLiveSession();

  inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
  outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  
  const outputNode = outputAudioContext.createGain();
  outputNode.connect(outputAudioContext.destination);

  stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  const sessionPromise = ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    callbacks: {
      onopen: () => {
        onOpen();
        if (!inputAudioContext || !stream) return;
        source = inputAudioContext.createMediaStreamSource(stream);
        processor = inputAudioContext.createScriptProcessor(4096, 1, 1);
        
        processor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          const pcmBlob = createPcmBlob(inputData);
          sessionPromise.then(sess => sess.sendRealtimeInput({ media: pcmBlob }));
        };

        source.connect(processor);
        processor.connect(inputAudioContext.destination);
      },
      onmessage: async (message: LiveServerMessage) => {
        if (message.serverContent?.modelTurn?.parts?.[0]?.inlineData) {
          onAudioData(true);
          const base64Audio = message.serverContent.modelTurn.parts[0].inlineData.data;
          
          if (outputAudioContext) {
            nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
            const audioBuffer = await decodeAudioData(
              base64ToUint8Array(base64Audio),
              outputAudioContext
            );
            
            const bufferSource = outputAudioContext.createBufferSource();
            bufferSource.buffer = audioBuffer;
            bufferSource.connect(outputNode);
            
            bufferSource.addEventListener('ended', () => {
                sources.delete(bufferSource);
                if (sources.size === 0) onAudioData(false);
            });
            
            bufferSource.start(nextStartTime);
            nextStartTime += audioBuffer.duration;
            sources.add(bufferSource);
          }
        }
        
        if (message.serverContent?.interrupted) {
          sources.forEach(s => s.stop());
          sources.clear();
          nextStartTime = 0;
          onAudioData(false);
        }
      },
      onclose: () => {
        onClose();
      },
      onerror: (err) => {
        onError(err);
      }
    },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
      },
      systemInstruction: "You are 'Memoria', a warm and romantic AI companion for a couple's photo album. You help them reminisce about their photos, suggest date ideas based on locations, and provide fun facts about where they've been. Keep responses concise and conversational."
    }
  });

  session = sessionPromise;
  return sessionPromise;
};

export const disconnectLiveSession = async () => {
  if (session) {
    try {
        const s = await session;
        if(s && typeof s.close === 'function') {
            s.close();
        }
    } catch(e) { console.error("Error closing session", e)}
  }
  
  if (processor) {
    processor.disconnect();
    processor.onaudioprocess = null;
  }
  if (source) source.disconnect();
  if (stream) stream.getTracks().forEach(t => t.stop());
  if (inputAudioContext) inputAudioContext.close();
  if (outputAudioContext) outputAudioContext.close();
  
  processor = null;
  source = null;
  stream = null;
  inputAudioContext = null;
  outputAudioContext = null;
  session = null;
  sources.clear();
};

// --- TTS Functionality ---
export const speakText = async (text: string): Promise<void> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Fenrir' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return;

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioBuffer = await decodeAudioData(base64ToUint8Array(base64Audio), ctx);
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    source.start();

  } catch (error) {
    console.error("TTS Error:", error);
  }
};

// --- Search & Grounding (Thinking Mode) ---
export const getLocationInfo = async (locationName: string): Promise<{ text: string, links: any[] }> => {
    try {
        // Updated to use gemini-3-pro-preview with thinking capability
        // This generates a high-quality date plan or deep insight
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: `Act as a world-class romance consultant and travel expert.
            I want you to think deeply about the location: ${locationName}.
            
            Please provide a curated "Perfect Date" plan for this location.
            1. Analyze the vibe (cozy, adventurous, classic, etc.).
            2. Suggest a specific hidden gem or activity.
            3. Recommend a dining spot with a brief reason why it's romantic.
            4. Include a fascinating historical or cultural fact about the place.
            
            Keep the tone warm, inviting, and magical.`,
            config: {
                thinkingConfig: { thinkingBudget: 32768 },
                tools: [{ googleSearch: {} }, { googleMaps: {} }],
            }
        });
        
        const text = response.text;
        const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        
        return { text, links };
    } catch (e) {
        console.error("Grounding error", e);
        return { text: "I'm having a little trouble dreaming up a plan right now. Please try again in a moment! ✨", links: [] };
    }
}