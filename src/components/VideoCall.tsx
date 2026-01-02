import { useState, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, PhoneOff, MessageSquare } from 'lucide-react';
import type { Doctor } from '../App';

interface VideoCallProps {
  doctor: Doctor;
  onEnd: () => void;
}

export function VideoCall({ doctor, onEnd }: VideoCallProps) {
  const [duration, setDuration] = useState(0);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 relative">
      {/* Doctor Video - Full Screen */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-6xl">👨‍⚕️</span>
          </div>
          <h2 className="text-white text-xl mb-1">{doctor.name}</h2>
          <p className="text-purple-200 text-sm mb-4">{doctor.specialty}</p>
          <div className="text-white text-lg">{formatDuration(duration)}</div>
        </div>
      </div>

      {/* User Video - Small */}
      <div className="absolute top-6 right-6 w-24 h-32 bg-gray-800 rounded-2xl overflow-hidden border-2 border-white/20">
        <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
          <span className="text-3xl">👤</span>
        </div>
      </div>

      {/* Call Info */}
      <div className="absolute top-6 left-6 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2">
        <div className="text-white text-sm">{formatDuration(duration)}</div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-6 py-8">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setVideoEnabled(!videoEnabled)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                videoEnabled ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {videoEnabled ? (
                <Video className="w-6 h-6 text-white" />
              ) : (
                <VideoOff className="w-6 h-6 text-white" />
              )}
            </button>

            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                audioEnabled ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {audioEnabled ? (
                <Mic className="w-6 h-6 text-white" />
              ) : (
                <MicOff className="w-6 h-6 text-white" />
              )}
            </button>

            <button
              onClick={onEnd}
              className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <PhoneOff className="w-7 h-7 text-white" />
            </button>

            <button className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
              <MessageSquare className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
