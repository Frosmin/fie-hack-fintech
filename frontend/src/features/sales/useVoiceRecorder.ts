import { useState, useCallback, useRef, useEffect } from 'react';
import type { VoiceState } from './types';

export function useVoiceRecorder() {
  const [state, setState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const timeoutRef = useRef<number | null>(null);

  const startListening = useCallback(() => {
    setState('listening');
    setTranscript('');
    setInterimTranscript('');

    const phrases = [
      'Vendi un kit de plantas',
      'Vendi un kit de plantas por 38',
      'Vendi un kit de plantas por 38 soles',
      'Vendi un kit de plantas por 38 soles en efectivo',
      'Vendi un kit de plantas por 38 soles en efectivo por WhatsApp',
    ];

    let index = 0;
    const simulateSpeech = () => {
      if (index < phrases.length) {
        setInterimTranscript(phrases[index]);
        index++;
        timeoutRef.current = window.setTimeout(simulateSpeech, 800);
      }
    };

    simulateSpeech();

    timeoutRef.current = window.setTimeout(() => {
      setState('processing');
      setTranscript('Vendi un kit de plantas por 38 soles en efectivo por WhatsApp');
      setInterimTranscript('');

      timeoutRef.current = window.setTimeout(() => {
        setState('success');
      }, 1500);
    }, 5000);
  }, []);

  const stopListening = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (state === 'listening') {
      setState('idle');
      setInterimTranscript('');
    }
  }, [state]);

  const reset = useCallback(() => {
    setState('idle');
    setTranscript('');
    setInterimTranscript('');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    state,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    reset,
    isListening: state === 'listening',
    isProcessing: state === 'processing',
  };
}