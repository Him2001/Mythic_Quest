import React, { useState, useEffect } from 'react';
import { VoiceConfigService, VoiceConfig } from '../../utils/voiceConfigService';
import { Volume2, VolumeX, Settings, Zap, Globe } from 'lucide-react';
import Button from '../ui/Button';

interface VoiceSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const VoiceSettings: React.FC<VoiceSettingsProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<VoiceConfig>(VoiceConfigService.getConfig());
  const [voiceStatus, setVoiceStatus] = useState(VoiceConfigService.getVoiceStatus());

  // Update state when configuration changes
  useEffect(() => {
    if (isOpen) {
      setConfig(VoiceConfigService.getConfig());
      setVoiceStatus(VoiceConfigService.getVoiceStatus());
    }
  }, [isOpen]);

  const handleToggleVoice = () => {
    const newEnabled = VoiceConfigService.toggleVoice();
    setConfig(prev => ({ ...prev, enabled: newEnabled }));
    setVoiceStatus(VoiceConfigService.getVoiceStatus());
  };

  const handleToggleService = () => {
    const newService = VoiceConfigService.toggleVoiceService();
    setConfig(prev => ({ ...prev, useElevenLabs: newService === 'elevenlabs' }));
    setVoiceStatus(VoiceConfigService.getVoiceStatus());
  };

  const handleVolumeChange = (volume: number) => {
    VoiceConfigService.setVolume(volume);
    setConfig(prev => ({ ...prev, volume }));
  };

  const handleSpeedChange = (speed: number) => {
    VoiceConfigService.setSpeed(speed);
    setConfig(prev => ({ ...prev, speed }));
  };

  const handleReset = () => {
    VoiceConfigService.resetToDefault();
    setConfig(VoiceConfigService.getConfig());
    setVoiceStatus(VoiceConfigService.getVoiceStatus());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Settings className="text-amber-400" size={24} />
            <h2 className="text-xl font-cinzel text-amber-100">Voice Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Voice Status */}
        <div className="mb-6 p-4 bg-slate-900/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300">Status:</span>
            <div className="flex items-center gap-2">
              {voiceStatus.available ? (
                <Volume2 className="text-green-400" size={16} />
              ) : (
                <VolumeX className="text-red-400" size={16} />
              )}
              <span className={voiceStatus.available ? 'text-green-400' : 'text-red-400'}>
                {voiceStatus.available ? 'Available' : 'Unavailable'}
              </span>
            </div>
          </div>
          
          {voiceStatus.available && (
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Service:</span>
              <div className="flex items-center gap-2">
                {voiceStatus.service === 'elevenlabs' ? (
                  <Zap className="text-amber-400" size={16} />
                ) : (
                  <Globe className="text-blue-400" size={16} />
                )}
                <span className="text-slate-200 capitalize">
                  {voiceStatus.service === 'elevenlabs' ? 'Eleven Labs' : 'Browser Voice'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="space-y-4">
          {/* Enable/Disable Voice */}
          <div className="flex items-center justify-between">
            <label className="text-slate-200">Enable Voice Narration</label>
            <button
              onClick={handleToggleVoice}
              className={`w-12 h-6 rounded-full transition-colors ${
                config.enabled ? 'bg-amber-500' : 'bg-slate-600'
              } relative`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5 ${
                  config.enabled ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {config.enabled && (
            <>
              {/* Voice Service Toggle */}
              <div className="flex items-center justify-between">
                <label className="text-slate-200">Use Eleven Labs</label>
                <button
                  onClick={handleToggleService}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    config.useElevenLabs ? 'bg-amber-500' : 'bg-slate-600'
                  } relative`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5 ${
                      config.useElevenLabs ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Volume Control */}
              <div>
                <label className="text-slate-200 block mb-2">
                  Volume: {Math.round(config.volume * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={config.volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              {/* Speed Control */}
              <div>
                <label className="text-slate-200 block mb-2">
                  Speed: {config.speed.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={config.speed}
                  onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Button
            onClick={handleReset}
            variant="secondary"
            className="flex-1"
          >
            Reset to Default
          </Button>
          <Button
            onClick={onClose}
            variant="primary"
            className="flex-1"
          >
            Save Changes
          </Button>
        </div>

        {/* Info */}
        <div className="mt-4 text-xs text-slate-400 text-center">
          Voice narration enhances your Mythic Quest experience with immersive storytelling.
        </div>
      </div>
    </div>
  );
};

export default VoiceSettings;