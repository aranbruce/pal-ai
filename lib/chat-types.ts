export interface Model {
  provider: string;
  name: string;
  id: string;
}

export interface ConversationDemoProps {
  models: Model[];
  defaultModel?: string;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
}
