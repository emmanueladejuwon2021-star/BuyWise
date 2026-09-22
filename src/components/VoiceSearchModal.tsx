import React, { useState, useEffect } from 'react';
import { Mic, MicOff, X, Sparkles, Volume2 } from 'lucide-react';

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (transcript: string) => void;
}

export const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({ isOpen, onClose, onSearch }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setIsListening(false);
      setTranscript('');
      setErrorMessage('');
      return;
    }

    // Check for native SpeechRecognition
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-NG'; // Nigerian English preference

        recognition.onstart = () => {
          setIsListening(true);
          setErrorMessage('');
        };

        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const text = event.results[current][0].transcript;
          setTranscript(text);
        };

        recognition.onerror = (event: any) => {
          setIsListening(false);
          if (event.error !== 'no-speech') {
            setErrorMessage(`Microphone error: ${event.error}. You can also type or use quick prompts below.`);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();

        return () => {
          recognition.abort();
        };
      } catch (err) {
        setIsListening(false);
      }
    } else {
      // Fallback simulation timer if browser doesn't support Web Speech API
      setIsListening(true);
      const timer = setTimeout(() => {
        setIsListening(false);
        setTranscript('iPhone 15 Pro Max 256GB');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const quickPrompts = [
    'iPhone 15 Pro Max',
    'Samsung 55 inch Smart TV',
    'PlayStation 5 Console',
    'MacBook Air M2',
    'Nike Air Jordan 1',
  ];

  const handleConfirm = () => {
    if (transcript.trim()) {
      onSearch(transcript.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl relative border border-gray-100 text-center">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        >
          <X size={18} />
        </button>

        {/* Pulse Orb */}
        <div className="my-3 flex justify-center">
          <div className="relative flex items-center justify-center">
            {isListening && (
              <>
                <span className="animate-ping absolute inline-flex h-20 w-20 rounded-full bg-indigo-400 opacity-30"></span>
                <span className="animate-pulse absolute inline-flex h-16 w-16 rounded-full bg-purple-400 opacity-40"></span>
              </>
            )}
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${
                isListening
                  ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 scale-105'
                  : 'bg-gray-400'
              }`}
            >
              {isListening ? <Mic size={24} className="animate-pulse" /> : <MicOff size={22} />}
            </div>
          </div>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
          {isListening ? 'Listening for product...' : 'Voice Search'}
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          {isListening
            ? 'Speak clearly (e.g., "Find lowest price on PS5")'
            : 'Click a suggested query or submit transcript below'}
        </p>

        {/* Transcript Box */}
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 mb-4 min-h-[50px] flex items-center justify-center">
          {transcript ? (
            <p className="text-sm font-semibold text-gray-900 italic">"{transcript}"</p>
          ) : (
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Volume2 size={13} /> Say a product or brand name...
            </p>
          )}
        </div>

        {errorMessage && (
          <p className="text-[11px] text-amber-600 mb-3 bg-amber-50 p-2 rounded-lg">{errorMessage}</p>
        )}

        {/* Quick voice suggestions */}
        <div className="mb-4 text-left">
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5 flex items-center gap-1">
            <Sparkles size={11} className="text-indigo-500" /> Popular Voice Queries
          </p>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map(prompt => (
              <button
                key={prompt}
                onClick={() => {
                  setTranscript(prompt);
                  onSearch(prompt);
                  onClose();
                }}
                className="text-[11px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full font-medium transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {transcript && (
          <button
            onClick={handleConfirm}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Search for "{transcript}"
          </button>
        )}
      </div>
    </div>
  );
};
