import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Settings, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";

interface VoiceSettingsProps {
  onSettingsChange?: (settings: VoiceSettings) => void;
}

export interface VoiceSettings {
  voiceName: string;
  speechRate: number;
  speechPitch: number;
  speechVolume: number;
  autoListen: boolean;
  voiceFeedback: boolean;
  wakeWord: string;
}

const defaultSettings: VoiceSettings = {
  voiceName: "",
  speechRate: 0.9,
  speechPitch: 1,
  speechVolume: 0.8,
  autoListen: false,
  voiceFeedback: true,
  wakeWord: "Hey AIRA"
};

export function VoiceSettings({ onSettingsChange }: VoiceSettingsProps) {
  const [settings, setSettings] = useState<VoiceSettings>(defaultSettings);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    // Load saved settings
    const savedSettings = localStorage.getItem('aira-voice-settings');
    if (savedSettings) {
      setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
    }

    // Load available voices
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices.filter(voice => voice.lang.startsWith('en')));
      
      // Set default voice if none selected
      if (!settings.voiceName && voices.length > 0) {
        const defaultVoice = voices.find(voice => voice.default) || voices[0];
        setSettings(prev => ({ ...prev, voiceName: defaultVoice.name }));
      }
    };

    loadVoices();
    
    // Some browsers load voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  useEffect(() => {
    // Save settings to localStorage
    localStorage.setItem('aira-voice-settings', JSON.stringify(settings));
    onSettingsChange?.(settings);
  }, [settings, onSettingsChange]);

  const testVoice = () => {
    if (window.speechSynthesis) {
      setIsTesting(true);
      const utterance = new SpeechSynthesisUtterance(
        "Hello! This is AIRA, your personal AI assistant. How can I help you today?"
      );
      
      const selectedVoice = availableVoices.find(voice => voice.name === settings.voiceName);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      utterance.rate = settings.speechRate;
      utterance.pitch = settings.speechPitch;
      utterance.volume = settings.speechVolume;
      
      utterance.onend = () => setIsTesting(false);
      utterance.onerror = () => setIsTesting(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const updateSetting = <K extends keyof VoiceSettings>(
    key: K, 
    value: VoiceSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Voice Assistant Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Voice Selection */}
        <div className="space-y-2">
          <Label htmlFor="voice-select">Voice</Label>
          <Select 
            value={settings.voiceName} 
            onValueChange={(value) => updateSetting('voiceName', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a voice" />
            </SelectTrigger>
            <SelectContent>
              {availableVoices.map((voice) => (
                <SelectItem key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Speech Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Speech Rate</Label>
            <span className="text-sm text-muted-foreground">
              {Math.round(settings.speechRate * 100)}%
            </span>
          </div>
          <Slider
            value={[settings.speechRate]}
            onValueChange={([value]) => updateSetting('speechRate', value)}
            max={2}
            min={0.5}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Speech Pitch */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Speech Pitch</Label>
            <span className="text-sm text-muted-foreground">
              {Math.round(settings.speechPitch * 100)}%
            </span>
          </div>
          <Slider
            value={[settings.speechPitch]}
            onValueChange={([value]) => updateSetting('speechPitch', value)}
            max={2}
            min={0.5}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Speech Volume */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Speech Volume</Label>
            <span className="text-sm text-muted-foreground">
              {Math.round(settings.speechVolume * 100)}%
            </span>
          </div>
          <Slider
            value={[settings.speechVolume]}
            onValueChange={([value]) => updateSetting('speechVolume', value)}
            max={1}
            min={0}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Auto Listen */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Auto Listen</Label>
            <p className="text-sm text-muted-foreground">
              Automatically start listening when voice assistant is opened
            </p>
          </div>
          <Switch
            checked={settings.autoListen}
            onCheckedChange={(checked) => updateSetting('autoListen', checked)}
          />
        </div>

        {/* Voice Feedback */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Voice Feedback</Label>
            <p className="text-sm text-muted-foreground">
              Provide voice responses for commands and actions
            </p>
          </div>
          <Switch
            checked={settings.voiceFeedback}
            onCheckedChange={(checked) => updateSetting('voiceFeedback', checked)}
          />
        </div>

        {/* Wake Word */}
        <div className="space-y-2">
          <Label htmlFor="wake-word">Wake Word</Label>
          <input
            id="wake-word"
            type="text"
            value={settings.wakeWord}
            onChange={(e) => updateSetting('wakeWord', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
            placeholder="Hey AIRA"
          />
          <p className="text-xs text-muted-foreground">
            The phrase to activate voice commands (coming soon)
          </p>
        </div>

        {/* Test Voice Button */}
        <Button 
          onClick={testVoice} 
          disabled={isTesting}
          className="w-full"
          variant="outline"
        >
          {isTesting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
              Testing Voice...
            </>
          ) : (
            <>
              <Volume2 className="h-4 w-4 mr-2" />
              Test Voice Settings
            </>
          )}
        </Button>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSettings(defaultSettings)}
          >
            Reset to Default
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              localStorage.removeItem('aira-voice-settings');
              setSettings(defaultSettings);
            }}
          >
            Clear Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 