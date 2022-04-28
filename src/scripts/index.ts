import '../styles/main.css';
import { loadAllAssets } from './assets';
import {
  addStage,
  addUIDrawableToGameLoop,
  addUpdatableToGameLoop,
  dt,
  getContext,
  getKeyboard,
  HEIGHT,
  setCursor,
  setFullScreen,
  switchStage,
  WIDTH,
} from './r-row';
import { GameStage } from './stages/game';
import { MenuStage } from './stages/menu';

let displayFPS: boolean;

const drawLoadingScreen = () => {
  let ctx = getContext();
  ctx.save();
  ctx.fillStyle = 'White';
  ctx.font = 'normal 30pt Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Loading files, please wait...', WIDTH / 2, HEIGHT / 2);
  ctx.restore();
};

export const load = async () => {
  // Draw a loading screen to inform player
  drawLoadingScreen();
  // Start and wait the assets loading
  await loadAllAssets();

  // Set the cursor
  setCursor('cursor', 2);

  displayFPS = false;
};

export const main = async () => {
  // Set fullscreen on F11 pressed
  const updateListenF11 = (dt: number) => {
    const keyboard = getKeyboard();
    if (keyboard.state['F11'] === 'new_down') setFullScreen();
  };
  addUpdatableToGameLoop({
    update: updateListenF11,
    order: 0,
  });

  // Set display FPS on F3 pressed
  const updateListenF3 = (dt: number) => {
    const keyboard = getKeyboard();
    if (keyboard.state['F3'] === 'new_down') displayFPS = !displayFPS;
  };
  addUpdatableToGameLoop({
    update: updateListenF3,
    order: 0,
  });

  // Add FPS counter
  const drawFPSCounter = (ctx: CanvasRenderingContext2D) => {
    if (!displayFPS) return;
    ctx.save();
    ctx.fillStyle = 'White';
    ctx.font = 'normal 1em compassPro';
    const fps = `FPS: ${Math.round(1 / dt)}`;
    ctx.fillText(fps, 10, 20);
    ctx.restore();
  };
  addUIDrawableToGameLoop({
    draw: drawFPSCounter,
    order: 10,
  });

  // Register stages
  addStage('menu', MenuStage.getStage());
  addStage('game', GameStage.getStage());

  // Set the menu stage
  switchStage('menu', 100);
};
