export type TabId = 'home' | 'assistant' | 'contacts' | 'settings';

export type Verbosity = 'brief' | 'standard' | 'detailed';

export interface UserSettings {
  stepLengthCm: number;
  speechRate: number;
  verbosity: Verbosity;
  voiceEnabled: boolean;
  vibrationEnabled: boolean;
}

export const DEFAULT_SETTINGS: UserSettings = {
  stepLengthCm: 65,
  speechRate: 1,
  verbosity: 'standard',
  voiceEnabled: true,
  vibrationEnabled: true,
};
