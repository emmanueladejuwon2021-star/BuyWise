import React, { useState, useEffect } from 'react';
import { Mic, MicOff, X, Volume2 } from 'lucide-react';

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

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-NG';
        recognition.onstart = () => {
          setIsListening(true);
          setErrorMessage('');
        };
        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          setTranscript(event.results[current][0].transcript);
        };
        recognition.onerror = (event: any) => {
          setIsListening(false);
          if (event.error !== 'no-speech') {
            setErrorMessage(`Microphone error: ${event.error}`);
          }
        };
        recognition.onend = () => setIsListening(false);
        recognition.start();
        return () => recognition.abort();
      } catch {
        setIsListening(false);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative text-center">
        <button onClick={onClose} className="absolute top-3 right-3 p-1 text-gray-400" aria-label="Close">
          <X size={18} />
        </button>
        <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center text-white ${isListening ? 'bg-indigo-600' : 'bg-gray-400'}`}>
          {isListening ? <Mic size={24} /> : <MicOff size={22} />}
        </div>
        <h3 className="text-lg font-bold text-gray-900 mt-3">{isListening ? 'Listening' : 'Voice search'}</h3>
        <p className="text-sm text-gray-500 mt-1">Say a product name. No sample queries are suggested.</p>
        <div className="bg-gray-50 rounded-xl p-3 border mt-4 min-h-[50px] flex items-center justify-center">
          {transcript ? (
            <p className="text-sm font-semibold text-gray-900">{transcript}</p>
          ) : (
            <p className="text-xs text-gray-400 flex items-center gap-1"><Volume2 size={13} /> Waiting for speech</p>
          )}
        </div>
        {errorMessage && <p className="text-xs text-amber-600 mt-3">{errorMessage}</p>}
        {transcript && (
          <button
            onClick={() => { onSearch(transcript.trim()); onClose(); }}
            className="w-full mt-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold"
          >
            Search
          </button>
        )}
      </div>
    </div>
  );
};
