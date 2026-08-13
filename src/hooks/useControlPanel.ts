import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/appStore';
import GUI from 'lil-gui';

export function useControlPanel(containerRef: React.RefObject<HTMLDivElement>) {
  const guiRef = useRef<GUI | null>(null);
  const config = useAppStore((state) => state.config);
  const setConfig = useAppStore((state) => state.setConfig);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up existing GUI
    if (guiRef.current) {
      guiRef.current.destroy();
      guiRef.current = null;
    }

    const gui = new GUI({ 
      container: containerRef.current,
      title: 'Pixel Art Water',
      width: 280,
    });

    guiRef.current = gui;

    // Seed control
    gui.add(config, 'seed', 0, 99999, 1)
      .name('Seed')
      .onChange((value: number) => setConfig({ seed: value }));

    // Dimensions
    gui.add(config, 'width', 32, 512, 16)
      .name('Width')
      .onChange((value: number) => setConfig({ width: value }));

    gui.add(config, 'height', 32, 512, 16)
      .name('Height')
      .onChange((value: number) => setConfig({ height: value }));

    // Animation settings
    gui.add(config, 'frameCount', 30, 120, 10)
      .name('Frames')
      .onChange((value: number) => setConfig({ frameCount: value }));

    gui.add(config, 'fps', 8, 30, 1)
      .name('FPS')
      .onChange((value: number) => setConfig({ fps: value }));

    // Pixel art settings
    gui.add(config, 'tileResolution', 2, 16, 1)
      .name('Tile Size')
      .onChange((value: number) => setConfig({ tileResolution: value }));

    gui.add(config, 'animationSpeed', 0.1, 3.0, 0.1)
      .name('Speed')
      .onChange((value: number) => setConfig({ animationSpeed: value }));

    gui.add(config, 'turbulence', 0, 1.0, 0.05)
      .name('Turbulence')
      .onChange((value: number) => setConfig({ turbulence: value }));

    gui.add(config, 'flowOffset', 0, 5, 0.5)
      .name('Flow')
      .onChange((value: number) => setConfig({ flowOffset: value }));

    return () => {
      if (guiRef.current) {
        guiRef.current.destroy();
        guiRef.current = null;
      }
    };
  }, [containerRef, setConfig]);

  return { guiRef };
}
