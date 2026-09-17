import { GameEngine } from './engine/GameEngine';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  if (!canvas) return;

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', resize);
  resize();

  const engine = new GameEngine(canvas, {
    onUpdateMetrics: (m) => {
      const stats = document.getElementById('engine-stats');
      if (stats) {
        stats.innerText = `FPS: ${m.fps} | FrameTime: ${m.frameTimeMs}ms | VRAM: ${m.vramMB}MB`;
      }
    }
  });

  // Keyboard controls
  const keys: Record<string, boolean> = {};
  window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    if (e.key === ' ' || e.code === 'Space') {
      engine.jump();
    }
    if (e.key.toLowerCase() === 'f') {
      engine.shootDonut();
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const chars: ('head' | 'heels' | 'combined')[] = ['head', 'heels', 'combined'];
      const nextIdx = (chars.indexOf(engine.activeCharType) + 1) % chars.length;
      engine.setCharacter(chars[nextIdx]);
    }
  });

  window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
  });

  // Input poll loop
  setInterval(() => {
    let dx = 0;
    let dy = 0;
    if (keys['w'] || keys['arrowup']) { dx -= 0.707; dy -= 0.707; }
    if (keys['s'] || keys['arrowdown']) { dx += 0.707; dy += 0.707; }
    if (keys['a'] || keys['arrowleft']) { dx -= 0.707; dy += 0.707; }
    if (keys['d'] || keys['arrowright']) { dx += 0.707; dy -= 0.707; }
    engine.handleInput(dx, dy, 0.016);
  }, 16);

  engine.start();
});
