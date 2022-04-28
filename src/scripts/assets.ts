// This file will load all assets file in browser
import { loadAssets, logger } from './r-row';

// Fonts
import tinyNostalgia from '../fonts/tiny-nostalgia.ttf';
import compassPro from '../fonts/CompassPro.ttf';

// Images
import cliff from '../images/cliff.png';
import cursor from '../images/cursor.png';
import floor from '../images/floor.png';
import hero from '../images/hero.png';
import orc from '../images/orc.png';
import props from '../images/props.png';
import torch from '../images/torch.png';
import torchLight from '../images/torch_light.png';
import wall from '../images/wall.png';
import keyboard from '../images/keyboard.png';
import menuBackground from '../images/menu_background.jpg';

// Sounds
import death from '../sounds/death.wav';
import fall from '../sounds/fall.wav';
import gameOver from '../sounds/game_over.wav';
import gameStart from '../sounds/game_start.wav';
import hurt from '../sounds/hurt.wav';
import musicGame from '../sounds/music_game.mp3';
import musicMenu from '../sounds/music_menu.mp3';
import punch from '../sounds/punch.wav';

// Create assets arrays
const fonts = [
  { name: 'tinyNostalgia', url: tinyNostalgia },
  { name: 'compassPro', url: compassPro },
];

const images = [
  { name: 'cliff', url: cliff },
  { name: 'cursor', url: cursor },
  { name: 'floor', url: floor },
  { name: 'hero', url: hero },
  { name: 'orc', url: orc },
  { name: 'props', url: props },
  { name: 'torch', url: torch },
  { name: 'torchLight', url: torchLight },
  { name: 'wall', url: wall },
  { name: 'keyboard', url: keyboard },
  { name: 'menuBackground', url: menuBackground },
];

const sounds = [
  { name: 'death', url: death },
  { name: 'fall', url: fall },
  { name: 'gameOver', url: gameOver },
  { name: 'gameStart', url: gameStart },
  { name: 'hurt', url: hurt },
  { name: 'musicGame', url: musicGame },
  { name: 'musicMenu', url: musicMenu },
  { name: 'punch', url: punch },
];

// Create a function to load all assets
export const loadAllAssets = async () => {
  await loadAssets(images, sounds, fonts);
  logger.debug('All assets was loaded.');
};
