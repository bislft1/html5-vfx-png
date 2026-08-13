Procedural Frame Effects — Web Prototype SpecificationOverviewBuild a professional-grade React/TypeScript web application that generates complex procedural water animations as pre-rendered frame sequences, then plays them back cheaply as ordinary images. This is NOT a toy—it's a usable production tool for exporting high-quality animated assets.Primary Question to Answer
Can an expensive procedural animation be generated once in the browser, stored as frames, and then played back cheaply as ordinary images?
Core ArchitectureTwo Completely Separate StagesStage 1 — Generation (expensive, one-time cost)simulation configuration
    ↓
procedural rendering pipeline
    ↓
Canvas 2D/WebGL surface
    ↓
frame[] (exportable PNG sequence)Stage 2 — Playback (trivial, repeated)const frame = frames[currentFrameIndex];
ctx.drawImage(frame, x, y);The simulation MUST NOT run during playback. Do not recalculate water, waves, or noise during preview—only select and draw pre-generated frames.

Technology Stack
Required Dependencies
PackagePurposereact + react-domUI frameworktypescriptType safetypixi.js OR three.jsWebGL rendering (recommend Pixi for 2D)zustand or redux-toolkitGlobal state managementdat.gui or lil-guiParameter inspector UIffmpeg.wasmOptional: sprite sheet / video exportpngjsPNG encoding utilities
Project Structureprototype/
├── src/
│   ├── components/
│   │   ├── CanvasView.tsx          # Main rendering canvas
│   │   ├── ParameterPanel.tsx      # Adjustable controls
│   │   ├── PreviewPlayer.tsx       # Playback controls
│   │   └── ExportDialog.tsx        # Frame export UI
│   ├── generators/
│   │   ├── water.ts                # WaterGenerator core logic
│   │   ├── waterTypes.ts           # WaterConfig types
│   │   └── index.ts
│   ├── animation/
│   │   ├── FrameAnimation.ts       # Generic playback class
│   │   └── index.ts
│   ├── utils/
│   │   ├── determinism.ts          # Seeded RNG utilities
│   │   ├── export.ts               # PNG/spritesheet/export helpers
│   │   └── math.ts                 # Wave math helpers
│   ├── hooks/
│   │   ├── useWaterGeneration.ts   # Generation hook
│   │   └── useFramePlayback.ts     # Playback hook
│   ├── state/
│   │   └── store.ts                # Global app state
│   ├── App.tsx
│   └── main.tsx
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
WaterGenerator Specification
Interfaceinterface WaterGenerator {
  constructor(config: WaterConfig): void
  generate(): Promise<CanvasFrame[]>
}

interface CanvasFrame {
  surface: HTMLCanvasElement | OffscreenCanvas
  timestamp: number
  metadata?: {
    width: number
    height: number
    format: 'png' | 'webp' | 'jpeg'
  }
}Usage Exampleconst generator = new WaterGenerator(waterConfig)
const frames = await generator.generate()

// Frames are now ready for playback or export
const animation = new FrameAnimation(frames, fps: 30, loop: true)
animation.draw(ctx, x, y)
Configuration Object
All tunable parameters must live in a single configuration object. Do not hard-code values throughout the algorithm.interface WaterConfig {
  // ========== DIMENSIONALITY ==========
  width: number                  // Frame width in px
  height: number                 // Frame height in px
  fps: number                    // Target framerate (30 or 60 recommended)
  duration: number               // Total animation length in seconds
  seed: number                   // Deterministic random seed

  // ========== WAVE STRUCTURE ==========
  waveCount: number              // Number of wave layers (typically 3-7)
  waveScale: number              // Base wavelength multiplier
  waveSpeed: number              // Base propagation speed
  waveDirection: number          // Degrees (0 = right, 90 = down)
  waveDirectionVariation: number // Per-layer variance in degrees

  // ========== SURFACE BEHAVIOR ==========
  distortion: number             // Domain warping intensity (0-1)
  turbulence: number             // High-frequency variation (0-1)
  surfaceRoughness: number       // Small-scale irregularity (0-1)

  // ========== COLOR SYSTEM ==========
  baseColor: RGB                 // Deep water color
  highlightColor: RGB            // Specular highlight color
  shadowColor: RGB               // Shadow/depth color

  highlightStrength: number      // Specular intensity (0-1)
  highlightThreshold: number     // Normal slope threshold for highlights (0-1)

  // ========== FOAM SYSTEM ==========
  foamEnabled: boolean
  foamThreshold: number          // Height/steepness trigger
  foamStrength: number           // Opacity/intensity (0-1)

  // ========== OPTIONAL EFFECTS ==========
  rippleEnabled: boolean
  rippleDecay: number            // How fast ripples fade
  reflectionStrength: number     // Fake environmental reflection (0-1)
}

type RGB = [r: number, g: number, b: number] // 0-255 each
Procedural Techniques (Encouraged to Combine)
You may implement ANY combination of these techniques:
TechniqueDescriptionHeight Fields2D elevation map as base surfaceLayered Sine WavesSuperimposed sinusoidal patternsGerstner WavesPhysically-inspired wave motion (recommended)Domain DistortionPerlin/Simplex noise warped through spaceProcedural NoiseValue, Perlin, Simplex, Worley, FBmInterference PatternsWave collision/constructive/destructiveRipple PropagationRadial disturbance diffusionNormal EstimationDerive surface normals from height derivativesFake ReflectionScreen-space environmental mapping approximationHighlight/Shadow MappingGouraud-style shading based on normalsFoam ThresholdingBinary or gradient foam on steep surfaces
Visual Target: The result should contain multiple visual layers:

Large-scale wave movement
Mid-frequency surface detail
High-frequency texture
Directional wave structure
Moving specular highlights
Dark/light variation across crests/troughs
Optional foam accumulation
Optional ripple interference

Avoid simplistic solutions like "blue rectangle + sine wave."

Determinism Requirement
Identical inputs must produce identical outputs:const config1 = {...baseConfig, seed: 42}
const config2 = {...baseConfig, seed: 42}

const gen1 = new WaterGenerator(config1)
const gen2 = new WaterGenerator(config2)

const frames1 = await gen1.generate()
const frames2 = await gen2.generate()

// frames1 and frames2 MUST be pixel-identical
assertPixelsEqual(frames1, frames2)Implementation: Use a seeded PRNG (e.g., seedrandom, mulberry32). Never rely on global Math.random().

Seamless Looping
The final frame should transition naturally back to the first frame without visible discontinuity.
Recommended technique: Use periodic mathematical functions where:visual_state(t=duration) ≈ visual_state(t=0)Example: If waves advance phase proportionally to time, ensure total phase shift over duration equals a multiple of 2π.// In wave phase calculation:
phase = (t / duration) * (periodicFactor * Math.PI * 2)
// periodicFactor should be integer to ensure cycle completionDO NOT simply duplicate the first frame at the end—create genuinely continuous motion.

FrameAnimation Class (Playback)
This class knows NOTHING about water. It works with arbitrary pre-rendered frames.class FrameAnimation {
  private frames: CanvasFrame[]
  private fps: number
  private loop: boolean
  private currentTime: number
  private isPlaying: boolean

  constructor(frames: CanvasFrame[], fps: number, loop: boolean = true)

  update(dt: number): void        // Advance animation state
  draw(ctx: CanvasRenderingContext2D, x: number, y: number): void
  goToFrame(index: number): void
  play(): void
  pause(): void
  reset(): void

  // Properties
  get currentFrameIndex(): number
  get isLooping(): boolean
}Playback must be trivial: Only frame selection, timing, looping, and blitting. No calculations, no simulation.

Export System
PNG Sequence Export
Export frames as numbered PNG files:exports/
├── water_0000.png
├── water_0001.png
├── water_0002.png
└── ...interface ExportOptions {
  format: 'png-sequence' | 'spritesheet' | 'webp-animation' | 'video'
  prefix: string
  padding: number              // Filename padding (e.g., 4 → "0000")
  compressionLevel: number     // 0-9 for PNG
  quality: number              // 0-1 for lossy formats
}

async function exportFrames(
  frames: CanvasFrame[],
  options: ExportOptions
): Promise<void>Spritesheet Export
Optional horizontal/vertical tile sheet:water_spritesheet.png  (e.g., 1920×120 for 64×60 frames at 32×20 grid)Include metadata JSON with frame dimensions/timing:{
  "frames": [
    { "index": 0, "x": 0, "y": 0, "width": 32, "height": 20 },
    { "index": 1, "x": 32, "y": 0, "width": 32, "height": 20 }
  ],
  "fps": 30,
  "loop": true
}Implementation Notes

HTMLCanvasElement.toDataURL('image/png') or toBlob()
For batch downloads: use <a download> links dynamically
For spritesheets: draw all frames onto a larger canvas once
For WebP/video: consider ffmpeg.wasm or Whammy.js


UI Requirements
Parameter Panel
Real-time adjustable controls that regenerate frames when changed:

Sliders for numeric values
Color pickers for RGB values
Checkboxes for booleans
Reset button to defaults
"Generate" button (debounced)
Display generation time
Display memory usage estimate

Preview Player
Standard playback controls:

Play/Pause toggle
Step forward/backward
Speed control (0.5×, 1×, 2×, etc.)
Current frame indicator
Timeline scrubber
Loop toggle

Export Dialog

Choose format (PNG sequence, spritesheet, WebP, video)
Specify output directory/filename prefix
Compression settings
Progress indicator for large exports
Download all / Download individual


Performance Metrics (Track & Display)
During development, measure:
MetricTargetMeasurement MethodGeneration time (5 sec @ 30fps)< 30 secperformance.now()Per-frame memory~2-4 MB @ 1080pnew Blob(size)Total RAM (150 frames @ 30fps × 5sec)< 600 MBTrack cumulative sizePlayback FPS≥ 55 FPS on mid-tier laptopRequestAnimationFrame deltaGPU upload time per frame< 5 msWebGL timestamp queries
Display these in a diagnostic panel during prototyping.

Experiment Questions (Answer Through Testing)
The prototype should help answer:

Can browsers generate visually convincing procedural water?
How expensive is generation (wall-clock time)?
How much RAM do frames consume?
How many frames are needed for smooth motion (30 vs 60 FPS)?
Does 60 FPS provide meaningful visual improvement over 30 FPS?
Which parameters have greatest visual impact (via sensitivity testing)?
Can animations loop seamlessly (verified by eye and pixel comparison)?
Is frame playback essentially trivial compared to generation?
Can frames be exported to web-friendly formats (WebP, AVIF)?
Are exported frames suitable for external use (video editors, game engines)?


What NOT to Build
Avoid scope creep:

❌ Not a general VFX framework
❌ Not a shader authoring tool (though you may use shaders internally)
❌ Not a fluid physics engine (procedural only)
❌ Not a node editor / visual programming
❌ Not a cloud processing service
❌ Not a full game engine integration
❌ Not real-time interactive water (this is PRE-rendered)


Quality Over Architecture
Prioritization hierarchy:

Better water visuals > Cleaner code architecture
More useful parameters > Minimal abstraction
Working prototype > Perfect design patterns
Usable export pipeline > Fancy UI polish

Keep code understandable, but do not over-engineer.

Acceptance Criteria
The prototype is successful if:

✅ Generates at least 5 seconds of water animation at 30 FPS (150 frames)
✅ All parameters are editable via UI
✅ Same seed produces identical output (verifiable via checksum)
✅ Animation loops seamlessly (no visible jump)
✅ Playback runs smoothly at target FPS
✅ Can export PNG sequence and/or spritesheet
✅ Generation happens ONCE, playback reuses frames
✅ Code demonstrates the trade-off: expensive generation → trivial playback


Starter Dependencies (package.json excerpt){
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "pixi.js": "^7.4.0",
    "zustand": "^4.4.0",
    "lil-gui": "^0.19.0",
    "@types/node": "^20.0.0",
    "seedrandom": "^3.0.5",
    "simplex-noise": "^4.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
Development Phases
Phase 1 — Core Generator (1-2 days)

Implement WaterGenerator with basic Gerstner waves
Single configurable wave layer
Render to canvas
Verify determinism

Phase 2 — Multi-Layer Water (2-3 days)

Add 3-5 wave layers with varying frequency/speed
Add normal estimation and basic shading
Add highlights
Tune parameters for visual quality

Phase 3 — Animation & Playback (1 day)

Generate multi-frame sequences
Implement FrameAnimation playback class
Ensure seamless looping

Phase 4 — Export Pipeline (1-2 days)

PNG sequence export
Spritesheet export option
Download mechanism

Phase 5 — UI Polish (1-2 days)

Parameter panel with live preview
Playback controls
Export dialog
Performance diagnostics

Phase 6 — Testing & Iteration (ongoing)

Run all experiment questions
Compare 30 vs 60 FPS quality
Test export compatibility with external tools
Document findings


Final Note
This specification intentionally avoids prescribing specific algorithms for water generation. The goal is to experiment and discover which procedural techniques yield the most convincing results. The framework must support flexibility while ensuring clean separation between generation and playback.
The ultimate success metric is answering "yes" to:

Can an expensive procedural effect be generated once and subsequently treated as ordinary frame animation?

If yes, this tool becomes a reusable asset pipeline for any procedurally-generated effects—not just water.
