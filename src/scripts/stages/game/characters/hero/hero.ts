import {
  createSound,
  createSpriteSheet,
  destroySound,
  getKeyboard,
  playSound,
  setAnimation,
  switchStage,
  updateSpriteSheet,
} from '../../../../r-row';
import { State } from '../EState';
import { Character } from '../ICharacter';
import HeroAnimation from './heroAnimations.json';
import config from '../../../../../config.json';
import { isWalkable } from '../../map/map';
import { dist } from '../../../../math';
import { isInWeaponDirection } from '../utils';
import { addCharacterToDraw, score } from '../../game';

export let hero: Character;

export const createHero = () => {
  hero = {
    life: config.game.heroLife,
    state: State.idle,
    vDirection: null,
    vDirectionOld: 'down',
    hDirection: null,
    hDirectionOld: 'right',
    spritesheet: createSpriteSheet(
      'hero',
      HeroAnimation.animations,
      HeroAnimation.frame
    ),
    position: { x: 180, y: 148 },
    sound: { attack: createSound('attack', 'punch') },
  };
  hero.spritesheet.position = hero.position;
  setAnimation(hero.spritesheet, 'idle_right_down');
  addCharacterToDraw(hero);
};

export const updateHero = (dt: number, orcs: Character[]) => {
  updateStateMachine(dt, orcs);
  updateSpriteSheet(dt, hero.spritesheet);
  if (hero.life < 0) hero.life = 0;
};

export const cleanHero = () => {
  destroySound(hero.sound.attack);
};

const updateStateMachine = (dt: number, orcs: Character[]) => {
  const keyboard = getKeyboard();
  const state = hero.state;
  const animationFinished = hero.spritesheet.animationFinished;
  const animationName = hero.spritesheet.currentAnimation.name;

  // Die
  if (state === State.die) {
    // ending die
    if (animationName.includes('die') && animationFinished) {
      console.log(score);
      switchStage('menu', score);
      return;
    }
    // starting die
    setAnimation(hero.spritesheet, 'die');
    return;
  }

  // Hit
  if (state === State.hit) {
    // hitting
    if (animationName.includes('hit') && !animationFinished) {
      return;
      // ending hit
    } else if (animationName.includes('hit') && animationFinished) {
      hero.state = State.idle;
      return;
    }
    // die?
    if (hero.life <= 0) {
      hero.state = State.die;
      return;
    }
    // starting hit
    const animation = `hit_${hero.hDirection || hero.hDirectionOld}_${
      hero.vDirection || hero.vDirectionOld
    }`;
    setAnimation(hero.spritesheet, animation);
    return;
  }

  // Attack
  if (state === State.attack) {
    // attacking
    if (animationName.includes('attack') && !animationFinished) {
      // orc touching?
      if (hero.spritesheet.currentFrame === 2) {
        orcs.forEach((orc) => {
          const distanceToOrc = dist(hero.position, orc.position);
          if (
            distanceToOrc <= config.game.heroAttackRange &&
            isInWeaponDirection(hero, orc) &&
            orc.state !== State.hit &&
            orc.state !== State.die
          ) {
            orc.state = State.hit;
            orc.life -= config.game.heroDamage;
          }
        });
      }
      return;
      // ending attack
    } else if (animationName.includes('attack') && animationFinished) {
      hero.state = State.idle;
      return;
    }
    // starting attack
    const animation = `attack_${hero.hDirection || hero.hDirectionOld}_${
      hero.vDirection || hero.vDirectionOld
    }`;
    setAnimation(hero.spritesheet, animation);
    playSound(hero.sound.attack);
    return;
  }

  // Walk
  if (state === State.walk) {
    const speed = config.game.heroSpeed;
    let moveX = 0;
    let moveY = 0;
    // attack?
    if (keyboard.state['Space'] === 'new_down') {
      hero.state = State.attack;
      return;
    }
    // keyboard detection
    if (keyboard.keyDown['ArrowUp']) moveY += -1;
    if (keyboard.keyDown['ArrowDown']) moveY += 1;
    if (keyboard.keyDown['ArrowLeft']) moveX += -1;
    if (keyboard.keyDown['ArrowRight']) moveX += 1;
    // no move?
    if (moveX === 0 && moveY === 0) {
      hero.state = State.idle;
      return;
    }
    // move normalisation
    const norm = Math.sqrt(moveX * moveX + moveY * moveY);
    moveX /= norm / (speed * 10 * dt);
    moveY /= norm / (speed * 10 * dt);
    // collide detection & move
    const x = hero.position.x + moveX;
    const y = hero.position.y + moveY;
    if (isWalkable(x - 4, hero.position.y - 4, 7.5, 7.5)) {
      hero.position.x = x;
    }
    if (isWalkable(hero.position.x - 4, y - 4, 7.5, 7.5)) {
      hero.position.y = y;
    }
    // directions
    if (moveY > 0) {
      hero.vDirection = 'down';
      hero.vDirectionOld = 'down';
    } else if (moveY === 0) {
      hero.vDirection = null;
      hero.vDirectionOld = 'down';
    } else if (moveY < 0) {
      hero.vDirection = 'up';
      hero.vDirectionOld = 'up';
    }
    if (moveX > 0) {
      hero.hDirection = 'right';
      hero.hDirectionOld = 'right';
    } else if (moveX === 0) {
      hero.hDirection = null;
    } else if (moveX < 0) {
      hero.hDirection = 'left';
      hero.hDirectionOld = 'left';
    }
    //animation
    const animation = `walk_${hero.hDirection || hero.hDirectionOld}_${
      hero.vDirection || hero.vDirectionOld
    }`;
    setAnimation(hero.spritesheet, animation);
    return;
  }

  // Idle
  // attack?
  if (keyboard.state['Space'] === 'new_down') {
    hero.state = State.attack;
    return;
  }
  // move?
  if (
    (keyboard.keyDown['ArrowUp'] ||
      keyboard.keyDown['ArrowDown'] ||
      keyboard.keyDown['ArrowLeft'] ||
      keyboard.keyDown['ArrowRight']) &&
    !(
      keyboard.keyDown['ArrowUp'] &&
      keyboard.keyDown['ArrowDown'] &&
      !keyboard.keyDown['ArrowLeft'] &&
      !keyboard.keyDown['ArrowRight']
    ) &&
    !(
      keyboard.keyDown['ArrowLeft'] &&
      keyboard.keyDown['ArrowRight'] &&
      !keyboard.keyDown['ArrowUp'] &&
      !keyboard.keyDown['ArrowDown']
    )
  ) {
    hero.state = State.walk;
    return;
  }
  if (state !== State.idle || !animationName.includes('idle')) {
    hero.state = State.idle;
    const animation = `idle_${hero.hDirection || hero.hDirectionOld}_${
      hero.vDirection || hero.vDirectionOld
    }`;
    setAnimation(hero.spritesheet, animation);
  }
};
