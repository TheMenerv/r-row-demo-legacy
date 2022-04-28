import { Sound, SpriteSheet } from '../../../r-row';
import { State } from './EState';

export interface Character {
  life: number;
  state: State;
  vDirection: 'up' | 'down' | null;
  vDirectionOld: 'up' | 'down';
  hDirection: 'right' | 'left' | null;
  hDirectionOld: 'right' | 'left';
  spritesheet: SpriteSheet;
  position: { x: number; y: number };
  sound: { attack: Sound };
  timerNextAttack?: number;
  timerNextSpawn?: number;
  spawnPosition?: { x: number; y: number };
}
