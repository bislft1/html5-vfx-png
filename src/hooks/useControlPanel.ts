import { useEffect, useRef } from 'react';
import GUI from 'lil-gui';
import { useAppStore } from '../store/appStore';
import { defaultWaterConfig } from '../types';

/**
 * Hook to create and manage lil-gui control panel
 */
export function useControlPanel() {
  const guiRef = useRef<GUI | null>(null);
  const config = useAppStore((state) => state.config);
  const setConfig = useAppStore((state) => state.setConfig);
  const resetConfig = useAppStore((state) => state.resetConfig);

  useEffect(() => {
    if (!guiRef.current) {
      guiRef.current = new GUI({ title: 'Water Parameters', width: 300 });
    }

    const gui = guiRef.current;
    
    // Clear existing controllers
    while (gui.children.length > 0) {
      const child = gui.children[0];
      child.destroy();
    }

    // Seed section
    const seedFolder = gui.addFolder('🎲 Seed & Output');
    seedFolder.add(config, 'seed', 0, 99999, 1).name('Seed').onChange((value: number) => {
      setConfig({ seed: value });
    });
    seedFolder.add(config, 'frameCount', 60, 300, 30).name('Frames').onChange((value: number) => {
      setConfig({ frameCount: value });
    });
    seedFolder.add(config, 'fps', 15, 60, 5).name('FPS').onChange((value: number) => {
      setConfig({ fps: value });
    });
    seedFolder.open();

    // Wave parameters
    const waveFolder = gui.addFolder('🌊 Wave Settings');
    waveFolder.add(config, 'waveAmplitude', 5, 100, 1).name('Amplitude').onChange((value: number) => {
      setConfig({ waveAmplitude: value });
    });
    waveFolder.add(config, 'waveFrequency', 0.005, 0.1, 0.001).name('Frequency').onChange((value: number) => {
      setConfig({ waveFrequency: value });
    });
    waveFolder.add(config, 'waveSpeed', 0.1, 5, 0.1).name('Speed').onChange((value: number) => {
      setConfig({ waveSpeed: value });
    });
    waveFolder.add(config, 'waveDirection', 0, 360, 5).name('Direction (°)').onChange((value: number) => {
      setConfig({ waveDirection: value });
    });
    waveFolder.open();

    // Layer settings
    const layerFolder = gui.addFolder('📚 Layers');
    layerFolder.add(config, 'layerCount', 1, 6, 1).name('Layer Count').onChange((value: number) => {
      setConfig({ layerCount: value });
    });
    layerFolder.add(config, 'layerDepthFactor', 0.3, 0.9, 0.05).name('Depth Factor').onChange((value: number) => {
      setConfig({ layerDepthFactor: value });
    });
    layerFolder.open();

    // Color settings
    const colorFolder = gui.addFolder('🎨 Colors');
    colorFolder.addColor(config, 'baseColor').name('Base').onChange((value: string) => {
      setConfig({ baseColor: value });
    });
    colorFolder.addColor(config, 'highlightColor').name('Highlight').onChange((value: string) => {
      setConfig({ highlightColor: value });
    });
    colorFolder.addColor(config, 'shadowColor').name('Shadow').onChange((value: string) => {
      setConfig({ shadowColor: value });
    });
    colorFolder.open();

    // Shading
    const shadingFolder = gui.addFolder('💡 Shading');
    shadingFolder.add(config, 'specularIntensity', 0, 1, 0.05).name('Specular').onChange((value: number) => {
      setConfig({ specularIntensity: value });
    });
    shadingFolder.add(config, 'roughness', 0, 1, 0.05).name('Roughness').onChange((value: number) => {
      setConfig({ roughness: value });
    });
    shadingFolder.open();

    // Reset button
    gui.add({ reset: resetConfig }, 'reset').name('🔄 Reset to Defaults');

    return () => {
      gui.destroy();
      guiRef.current = null; // Set to null immediately after destroying
    };
  }, [config, setConfig, resetConfig]);

  return guiRef.current;
}
