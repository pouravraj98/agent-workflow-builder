import { useState, useEffect, useRef, useCallback } from 'react';
import { Phone, PhoneOff, Mic, MicOff, AudioWaveform } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getRandomTranscription, getMockResponse } from '@/data/mockData';

type CallState = 'idle' | 'connecting' | 'connected' | 'agent_speaking' | 'user_speaking' | 'ended';

interface TranscriptEntry {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

interface VoiceCallPanelProps {
  agentName: string;
  agentColor: string;
}

export default function VoiceCallPanel({ agentName, agentColor }: VoiceCallPanelProps) {
  const [callState, setCallState] = useState<CallState>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const durationRef = useRef<ReturnType<typeof setInterval>>();
  const turnRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Duration timer
  useEffect(() => {
    if (callState !== 'idle' && callState !== 'ended' && callState !== 'connecting') {
      durationRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    }
    return () => clearInterval(durationRef.current);
  }, [callState]);

  const addTranscript = useCallback((role: 'user' | 'agent', content: string) => {
    setTranscript(prev => [...prev, {
      id: `t_${Date.now()}_${role}`,
      role,
      content,
      timestamp: new Date(),
    }]);
  }, []);

  const runMockTurn = useCallback(() => {
    // User speaks
    setCallState('user_speaking');
    const userText = getRandomTranscription();

    turnRef.current = setTimeout(() => {
      addTranscript('user', userText);

      // Agent responds
      setCallState('agent_speaking');
      const { response } = getMockResponse(userText);
      const agentText = response.split('\n')[0].slice(0, 120);

      turnRef.current = setTimeout(() => {
        addTranscript('agent', agentText);
        setCallState('connected');

        // Schedule next turn
        turnRef.current = setTimeout(() => {
          runMockTurn();
        }, 2000 + Math.random() * 2000);
      }, 1500 + Math.random() * 1500);
    }, 1500 + Math.random() * 1000);
  }, [addTranscript]);

  const startCall = useCallback(() => {
    setCallState('connecting');
    setDuration(0);
    setTranscript([]);
    setIsMuted(false);

    setTimeout(() => {
      setCallState('agent_speaking');
      addTranscript('agent', `Hello! This is ${agentName}. How can I help you today?`);

      setTimeout(() => {
        setCallState('connected');
        turnRef.current = setTimeout(() => runMockTurn(), 2000);
      }, 1500);
    }, 1500);
  }, [agentName, addTranscript, runMockTurn]);

  const endCall = useCallback(() => {
    clearTimeout(turnRef.current);
    clearInterval(durationRef.current);
    setCallState('ended');
  }, []);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const statusText: Record<CallState, string> = {
    idle: '',
    connecting: 'Connecting...',
    connected: 'Connected',
    agent_speaking: 'Agent speaking...',
    user_speaking: 'Listening...',
    ended: 'Call ended',
  };

  // Idle state
  if (callState === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
          <Phone className="h-7 w-7 text-muted-foreground" />
        </div>
        <h4 className="text-[14px] font-semibold mb-1">Voice Call</h4>
        <p className="text-[12px] text-muted-foreground max-w-[220px] mb-5">
          Start a simulated voice call with your agent to test the conversation flow.
        </p>
        <Button size="sm" className="h-9 text-[13px] gap-2 px-5" onClick={startCall}>
          <Phone className="h-3.5 w-3.5" /> Start Voice Call
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Call visualization */}
      <div className="flex flex-col items-center pt-8 pb-4 shrink-0">
        <div className="text-[11px] text-muted-foreground mb-4 h-4">
          {statusText[callState]}
        </div>

        {/* Avatar with pulse rings */}
        <div className="relative mb-4">
          {(callState === 'agent_speaking' || callState === 'connecting') && (
            <>
              <div
                className="absolute inset-[-12px] rounded-full voice-pulse-ring"
                style={{ backgroundColor: agentColor + '15' }}
              />
              <div
                className="absolute inset-[-24px] rounded-full voice-pulse-ring"
                style={{ backgroundColor: agentColor + '10', animationDelay: '0.5s' }}
              />
            </>
          )}
          <div
            className="relative flex h-20 w-20 items-center justify-center rounded-full"
            style={{ backgroundColor: agentColor + '15' }}
          >
            <AudioWaveform className="h-8 w-8" style={{ color: agentColor }} />
          </div>
        </div>

        <div className="text-[14px] font-semibold mb-0.5">{agentName}</div>
        <div className="text-[13px] text-muted-foreground font-mono">
          {formatDuration(duration)}
        </div>
      </div>

      {/* Transcript */}
      <div className="flex-1 overflow-y-auto px-4 py-2 min-h-0">
        {transcript.length > 0 && (
          <div className="space-y-2">
            {transcript.map((entry) => (
              <div key={entry.id} className="flex gap-2">
                <span className={`text-[10px] font-medium shrink-0 w-11 pt-0.5 ${
                  entry.role === 'agent' ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {entry.role === 'agent' ? 'Agent' : 'You'}
                </span>
                <span className="text-[12px] text-foreground leading-relaxed">{entry.content}</span>
              </div>
            ))}
            <div ref={transcriptEndRef} />
          </div>
        )}
      </div>

      {/* Controls */}
      {callState !== 'ended' ? (
        <div className="flex items-center justify-center gap-4 px-4 py-5 border-t shrink-0">
          <Button
            variant={isMuted ? 'secondary' : 'outline'}
            size="icon"
            className={`h-11 w-11 rounded-full ${isMuted ? 'bg-muted' : ''}`}
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Button
            variant="destructive"
            size="icon"
            className="h-11 w-11 rounded-full"
            onClick={endCall}
          >
            <PhoneOff className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 px-4 py-5 border-t shrink-0">
          <div className="text-[12px] text-muted-foreground">
            Call ended · {formatDuration(duration)}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 text-[12px] gap-1.5" onClick={startCall}>
              <Phone className="h-3 w-3" /> Call Again
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-[12px]" onClick={() => setCallState('idle')}>
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
