import {
  createSound,
  destroyAllSounds,
  drawRoundedRect,
  drawSpriteSheet,
  drawText,
  HEIGHT,
  playSound,
  setVolume,
  Sound,
  stopAllSounds,
  WIDTH,
} from '../../r-row';
import {
  cleanHero,
  createHero,
  hero,
  updateHero,
} from './characters/hero/hero';
import { createMap, drawGround, drawWall, updateMap } from './map/map';
import config from '../../../config.json';
import { cleanOrcs, createOrc, orcs, updateOrcs } from './characters/orc/orc';
import { Character } from './characters/ICharacter';

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
export let score: number;
let characters: Character[] = [];

export const addCharacterToDraw = (char: Character) => {
  characters.push(char);
  characters.sort((c1, c2) => c1.position.y - c2.position.y);
};

export const removeCharacter = (char: Character) => {
  characters.filter((c) => c !== char);
};

export const addScore = () => {
  score++;
};

const load = () => {
  // Create the music and play it
  music = createSound('music', 'musicGame', true);
  setVolume(music, 0.5);
  playSound(music);
  createHero();
  createMap();
  for (let i = 0; i < 10; i++) {
    createOrc(40, 50);
  }
  for (let i = 0; i < 5; i++) {
    createOrc(35, 135);
  }
  for (let i = 0; i < 10; i++) {
    createOrc(200, 60);
  }
  // createOrc(35, 135);
  score = 0;
};

const update = (dt: number) => {
  updateMap(dt);
  updateHero(dt, orcs);
  updateOrcs(dt, hero);
  characters.sort((c1, c2) => c1.position.y - c2.position.y);
};

const draw = (ctx: CanvasRenderingContext2D) => {
  ctx.save();
  ctx.scale(config.game.globalScale, config.game.globalScale);
  drawGround(ctx);
  drawCharacters(ctx);
  drawWall(ctx);
  ctx.restore();
};

const drawUI = (ctx: CanvasRenderingContext2D) => {
  drawLifeOrc(ctx);
  drawLifeHero(ctx);
  drawScore(ctx);
};

const clean = () => {
  // Clean sounds
  stopAllSounds();
  destroyAllSounds();
  // Clean characters
  characters = [];
  cleanHero();
  cleanOrcs();
};

const drawCharacters = (ctx: CanvasRenderingContext2D) => {
  characters.forEach((char) => {
    drawSpriteSheet(ctx, char.spritesheet);
  });
};

const drawScore = (ctx: CanvasRenderingContext2D) => {
  const scoreText = `Score: ${score.toString()}`;
  drawText(ctx, scoreText, WIDTH / 2, HEIGHT - 5, 'White', 'center', {
    name: 'compassPro',
    size: '2em',
  });
};

const drawLifeHero = (ctx: CanvasRenderingContext2D) => {
  const x = hero.position.x * config.game.globalScale;
  const y = (hero.position.y - 5.5) * config.game.globalScale;
  drawRoundedRect(ctx, x - 0.7, y - 4, 20, 12, 'rgba(0, 0, 0, 0.6)', 5);
  const heroLife = hero.life;
  let heroColor = '#00FF00';
  if (heroLife <= config.game.heroLife / 5) heroColor = '#ff0000';
  else if (heroLife <= config.game.heroLife / 2.5) heroColor = '#ffa500';
  else if (heroLife <= config.game.heroLife / 1.5) heroColor = '#ffff00';
  drawText(ctx, heroLife.toString(), x, y, heroColor, 'center', {
    name: 'tinyNostalgia',
    size: '1em',
  });
};

const drawLifeOrc = (ctx: CanvasRenderingContext2D) => {
  orcs.forEach((orc) => {
    if (orc.life <= 0) return;
    const x = orc.position.x * config.game.globalScale;
    const y = (orc.position.y - 5) * config.game.globalScale;
    drawRoundedRect(ctx, x - 0.5, y - 3.5, 17, 10, 'rgba(0, 0, 0, 0.6)', 5);
    const orcLife = orc.life;
    let orcColor = '#00FF00';
    if (orcLife <= config.game.orcLife / 5) orcColor = '#ff0000';
    else if (orcLife <= config.game.orcLife / 2.5) orcColor = '#ffa500';
    else if (orcLife <= config.game.orcLife / 1.5) orcColor = '#ffff00';
    drawText(ctx, orcLife.toString(), x, y, orcColor, 'center', {
      name: 'tinyNostalgia',
      size: '0.8em',
    });
  });
};
