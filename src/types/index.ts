export interface WaterConfig {
  seed: number;
  width: number;
  height: number;
  frameCount: number;
  fps: number;
  
  // Wave parameters
  waveAmplitude: number;
  waveFrequency: number;
  waveSpeed: number;
  waveDirection: number;
  
  // Multi-layer settings
  layerCount: number;
  layerDepthFactor: number;
  
  // Color settings
  baseColor: string;
  highlightColor: string;
  shadowColor: string;
  
  // Shading
  specularIntensity: number;
  roughness: number;
}

export const defaultWaterConfig: WaterConfig = {
  seed: 12345,
  width: 800,
  height: 600,
  frameCount: 150,
  fps: 30,
  
  waveAmplitude: 30,
  waveFrequency: 0.02,
  waveSpeed: 1.5,
  waveDirection: 0,
  
  layerCount: 3,
  layerDepthFactor: 0.7,
  
  baseColor: '#1a5f7a',
  highlightColor: '#7fd8d8',
  shadowColor: '#0a2f3f',
  
  specularIntensity: 0.8,
  roughness: 0.3,
};
