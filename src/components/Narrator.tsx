import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Loader2, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { narrateText, formatProductNarration, releaseAudioUrl, getVoices } from '@/lib/narratorService';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NarratorProps {
  product: any;
  enabled: boolean;
}

interface VoiceOption {
  id: number;
  name: string;
}

// Default voice options until we fetch real ones from Camb.ai
const DEFAULT_VOICES: VoiceOption[] = [
  { id: 1, name: 'Default Voice' }
];

const Narrator: React.FC<NarratorProps> = ({ product, enabled }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<number>(1); // Default to first voice
  const [voices, setVoices] = useState<VoiceOption[]>(DEFAULT_VOICES);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch available voices when component mounts
  useEffect(() => {
    if (enabled) {
      fetchVoices();
    }
  }, [enabled]);

  // Fetch available voices from Camb.ai
  const fetchVoices = async () => {
    try {
      const availableVoices = await getVoices();
      if (availableVoices.length > 0) {
        const voiceOptions = availableVoices.map(voice => ({
          id: voice.id,
          name: voice.voice_name
        }));
        setVoices(voiceOptions);
        
        // Set selected voice to first voice
        setSelectedVoice(voiceOptions[0].id);
      }
    } catch (error) {
      console.error('Error fetching voices:', error);
      // Keep using default voice options
    }
  };

  useEffect(() => {
    return () => {
      // Clean up audio URL when component unmounts
      if (audioUrl) {
        releaseAudioUrl(audioUrl);
      }
    };
  }, [audioUrl]);

  const handlePlayNarration = async () => {
    if (!enabled) {
      toast.error('Please enable narrator and set your API key first');
      return;
    }

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    if (audioUrl && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    setIsLoading(true);

    try {
      const narrationText = formatProductNarration(product);
      // Call narrateText with the selected voice ID as the custom voice ID parameter
      const url = await narrateText(narrationText, 1, 1, selectedVoice);
      
      if (url) {
        setAudioUrl(url);
        
        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.play();
          setIsPlaying(true);
        }
      } else {
        toast.error('Failed to generate narration. Please check your API key.');
      }
    } catch (error) {
      console.error('Error playing narration:', error);
      toast.error('An error occurred while trying to play the narration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleVoiceChange = (voiceIdStr: string) => {
    const voiceId = parseInt(voiceIdStr, 10);
    setSelectedVoice(voiceId);
    // Clear existing audio when voice changes
    if (audioUrl) {
      releaseAudioUrl(audioUrl);
      setAudioUrl(null);
    }
  };

  if (!enabled) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <audio ref={audioRef} onEnded={handleAudioEnded} />

      <div className="w-40">
        <Select value={selectedVoice.toString()} onValueChange={handleVoiceChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select voice" />
          </SelectTrigger>
          <SelectContent>
            {voices.map((voice) => (
              <SelectItem key={voice.id} value={voice.id.toString()}>
                {voice.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={handlePlayNarration}
        disabled={isLoading}
        className="flex items-center gap-2"
        variant="outline"
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Generating...</span>
          </>
        ) : isPlaying ? (
          <>
            <Pause size={18} />
            <span>Pause Narration</span>
          </>
        ) : (
          <>
            <Volume2 size={18} />
            <span>Listen to Description</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default Narrator;
