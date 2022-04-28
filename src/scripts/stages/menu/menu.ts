import { Button } from '../../r-row/types';
import {
  createButton,
  createSound,
  destroyAllSounds,
  destroyButton,
  drawButton,
  drawRoundedRect,
  drawText,
  getStore,
  HEIGHT,
  playSound,
  setVolume,
  Sound,
  stopAllSounds,
  switchStage,
  WIDTH,
} from '../../r-row';

export const getStage = () => {
  return {
    load,
    update,
    draw,
    drawUI,
    clean,
  };
};

let music: Sound;
let playButton: Button;
let score: number;

const load = (params: any[]) => {
  // Create the music and play it
  music = createSound('music', 'musicMenu', true);
  setVolume(music, 0.5);
  playSound(music);

  // Create a play button
  playButton = createButton('playButton', WIDTH / 2, 320, 'Play');
  playButton.width = 80;
  playButton.height = 40;
  playButton.color = {
    normal: '#B0BEC5',
    hovered: '#90A4AE',
    pressed: '#78909C',
    disabled: '#ECEFF1',
  };
  playButton.textColor = {
    normal: 'Black',
    disabled: 'White',
  };
  playButton.font = '2em compassPro';

  // Get score if game ending
  score = null;
  if (params[0] !== undefined) score = params[0];
};

const update = (dt: number) => {
  // Start game
  if (playButton.clicked) switchStage('game');
};

const draw = (ctx: CanvasRenderingContext2D) => {
  ctx.drawImage(getStore().images.menuBackground, 0, 0, WIDTH, HEIGHT);
};

const drawUI = (ctx: CanvasRenderingContext2D) => {
  // Draw a panel
  drawRoundedRect(
    ctx,
    WIDTH / 2,
    HEIGHT / 2,
    500,
    300,
    'rgba(0, 0, 0, 0.7)',
    5
  );

  // Draw title
  drawText(ctx, 'R-ROW Demo Project', WIDTH / 2, 180, 'White', 'center', {
    name: 'compassPro',
    size: '3em',
  });

  // Draw keyboard
  ctx.drawImage(getStore().images.keyboard, 285, 220);
  drawText(ctx, 'F3 to show FPS', 322, 217, '#3333ff', 'right', {
    name: 'arial',
    size: '0.7em',
  });
  drawText(ctx, 'F11 to fullscreen', 385, 217, 'Orange', 'left', {
    name: 'arial',
    size: '0.7em',
  });
  drawText(ctx, 'Space to attack', 362, 282, 'Green', 'right', {
    name: 'arial',
    size: '0.7em',
  });
  drawText(ctx, 'Arrow to move', 400, 282, 'Red', 'left', {
    name: 'arial',
    size: '0.7em',
  });

  // Draw end message if deaths not null
  if (score !== null) {
    const endMessage1 = 'You have been defeated.';
    drawText(ctx, endMessage1, WIDTH / 2, 375, '#ffa500', 'center', {
      name: 'compassPro',
      size: '1.5em',
    });
    const endMessage2 = `Orcs to the grave with you: ${score.toString()}`;
    drawText(ctx, endMessage2, WIDTH / 2, 400, '#ffa500', 'center', {
      name: 'compassPro',
      size: '1.5em',
    });
  }

  // Draw button
  drawButton(ctx, playButton);
};

const clean = () => {
  // Clean sounds
  stopAllSounds();
  destroyAllSounds();

  // Clean button
  destroyButton(playButton);
};
