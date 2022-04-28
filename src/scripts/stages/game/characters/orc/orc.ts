import {
  createSound,
  createSpriteSheet,
  destroySound,
  playSound,
  randomRange,
  setAnimation,
  updateSpriteSheet,
} from '../../../../r-row';
import { State } from '../EState';
import { Character } from '../ICharacter';
import OrcAnimation from './orcAnimations.json';
import { dist } from '../../../../math';
import config from '../../../../../config.json';
import { isWalkable } from '../../map/map';
import { isInDirection, isInWeaponDirection } from '../utils';
import { addCharacterToDraw, addScore } from '../../game';

export let orcs: Character[] = [];

export const createOrc = (x: number, y: number) => {
  let orc: Character = {
    life: config.game.orcLife,
    state: State.chooseDirection,
    vDirection: null,
    vDirectionOld: 'down',
    hDirection: null,
    hDirectionOld: 'right',
    spritesheet: createSpriteSheet(
      'orc',
      OrcAnimation.animations,
      OrcAnimation.frame
    ),
    position: { x, y },
    sound: { attack: createSound('attack', 'punch') },
    timerNextAttack: 0,
    timerNextSpawn: config.game.orcSpawnTimer,
    spawnPosition: { x, y },
  };
  orc.spritesheet.position = orc.position;
  setAnimation(orc.spritesheet, 'idle_right_down');
  orcs.push(orc);
  addCharacterToDraw(orc);
};

export const updateOrcs = (dt: number, hero: Character) => {
  orcs.forEach((orc) => {
    updateStateMachine(dt, orc, hero);
    updateSpriteSheet(dt, orc.spritesheet);
    if (orc.life < 0) orc.life = 0;
  });
};

const cleanOrc = (orc: Character) => {
  destroySound(orc.sound.attack);
};

export const cleanOrcs = () => {
  orcs.forEach((orc) => {
    cleanOrc(orc);
  });
  orcs = [];
};

const updateStateMachine = (dt: number, orc: Character, hero: Character) => {
  const state = orc.state;
  const animationFinished = orc.spritesheet.animationFinished;
  const animationName = orc.spritesheet.currentAnimation.name;
  const distanceToPlayer = dist(orc.position, hero.position);

  // Die
  if (state === State.die) {
    // ending die
    if (animationName.includes('die') && animationFinished) {
      // increase score
      if (orc.timerNextSpawn === config.game.orcSpawnTimer) {
        addScore();
      }
      // re-spawn
      orc.timerNextSpawn -= dt;
      if (orc.timerNextSpawn <= 0) {
        createOrc(orc.spawnPosition.x, orc.spawnPosition.y);
        cleanOrc(orc);
        orcs = orcs.filter((o) => o !== orc);
      }
      return;
    }
    // starting die
    setAnimation(orc.spritesheet, 'die');
    return;
  }

  // Hit
  if (state === State.hit) {
    // hitting
    if (animationName.includes('hit') && !animationFinished) {
      return;
      // ending hit
    } else if (animationName.includes('hit') && animationFinished) {
      // die?
      if (orc.life <= 0) {
        orc.state = State.die;
        return;
      }
      orc.state = State.idle;
      return;
    }
    // starting hit
    const animation = `hit_${orc.hDirection || orc.hDirectionOld}_${
      orc.vDirection || orc.vDirectionOld
    }`;
    setAnimation(orc.spritesheet, animation);
    return;
  }

  // Attack
  if (state === State.attack) {
    orc.timerNextAttack -= dt;
    // attacking
    if (animationName.includes('attack') && !animationFinished) {
      // hero touching?
      if (
        orc.spritesheet.currentFrame === 2 &&
        distanceToPlayer <= config.game.orcAttackRange &&
        isInWeaponDirection(orc, hero) &&
        hero.state !== State.hit &&
        hero.state !== State.die
      ) {
        hero.state = State.hit;
        hero.life -= config.game.orcDamage;
      }
      return;
      // ending attack
    } else if (animationName.includes('attack') && animationFinished) {
      // in attack range?
      if (distanceToPlayer <= config.game.orcAttackRange) {
        startAttack(orc, hero);
        return;
      }
      orc.state = State.idle;
      return;
    }
    // starting attack
    startAttack(orc, hero);
    return;
  }

  // Chase
  if (state === State.chase) {
    // hero in attack range?
    if (distanceToPlayer <= config.game.orcAttackRange) {
      orc.state = State.attack;
      orc.timerNextAttack = 0;
      return;
      // hero in chase range?
    } else if (distanceToPlayer <= config.game.orcChaseRange) {
      directionToHero(orc, hero);
      if (!animationName.includes('walk')) {
        resetAnimation(orc);
        const animation = `walk_${orc.hDirection || orc.hDirectionOld}_${
          orc.vDirection || orc.vDirectionOld
        }`;
        setAnimation(orc.spritesheet, animation);
      }
      move(dt, orc);
      return;
    }
    // hero out chase range?
    orc.state = State.idle;
    return;
  }

  // Walk
  if (state === State.walk) {
    // in chase range?
    if (distanceToPlayer <= config.game.orcChaseRange) {
      orc.state = State.chase;
      return;
    }
    // change direction?
    if (randomRange(new Date().getMilliseconds().toString(), 0, 1000) <= 5) {
      orc.state = State.chooseDirection;
      return;
    }
    // idle?
    if (randomRange(new Date().getMilliseconds().toString(), 0, 1000) <= 5) {
      orc.state = State.idle;
      return;
    }
    // walk
    const walked = move(dt, orc);

    // blocked?
    if (!walked) {
      orc.state = State.chooseDirection;
      return;
    }
    return;
  }

  // Choose direction
  if (orc.state === State.chooseDirection) {
    switch (randomRange(new Date().getMilliseconds().toString(), 0, 7)) {
      case 0:
        orc.hDirection = null;
        orc.vDirection = 'up';
        orc.vDirectionOld = 'up';
        break;
      case 1:
        orc.hDirection = 'right';
        orc.hDirectionOld = 'right';
        orc.vDirection = 'up';
        orc.vDirectionOld = 'up';
        break;
      case 2:
        orc.hDirection = 'right';
        orc.hDirectionOld = 'right';
        orc.vDirection = null;
        orc.vDirectionOld = 'down';
        break;
      case 3:
        orc.hDirection = 'right';
        orc.hDirectionOld = 'right';
        orc.vDirection = 'down';
        orc.vDirectionOld = 'down';
        break;
      case 4:
        orc.hDirection = null;
        orc.vDirection = 'down';
        orc.vDirectionOld = 'down';
        break;
      case 5:
        orc.hDirection = 'left';
        orc.hDirectionOld = 'left';
        orc.vDirection = 'down';
        orc.vDirectionOld = 'down';
        break;
      case 6:
        orc.hDirection = 'left';
        orc.hDirectionOld = 'left';
        orc.vDirection = null;
        break;
      case 7:
        orc.hDirection = 'left';
        orc.hDirectionOld = 'left';
        orc.vDirection = 'up';
        orc.vDirectionOld = 'up';
        break;
    }
    // in chase range?
    if (distanceToPlayer <= config.game.orcChaseRange) {
      orc.state = State.chase;
      return;
    }
    orc.state = State.walk;
    return;
  }

  // Idle
  // in chase range?
  if (distanceToPlayer <= config.game.orcChaseRange) {
    orc.state = State.chase;
    return;
  }
  // want to walk?
  if (randomRange(new Date().getMilliseconds().toString(), 0, 1000) <= 10) {
    orc.state = State.walk;
    return;
  }
  // idle
  if (!animationName.includes('idle')) {
    const animation = `idle_${orc.hDirection || orc.hDirectionOld}_${
      orc.vDirection || orc.vDirectionOld
    }`;
    setAnimation(orc.spritesheet, animation);
  }
};

const directionToHero = (orc: Character, hero: Character) => {
  // is already in good direction?
  if (isInDirection(orc, hero)) {
    return;
  }

  const orcX = orc.position.x;
  const orcY = orc.position.y;
  const heroX = hero.position.x;
  const heroY = hero.position.y;

  // horizontal
  if (orcX < heroX) {
    orc.hDirection = 'right';
    orc.hDirectionOld = 'right';
  } else if (orcX > heroX) {
    orc.hDirection = 'left';
    orc.hDirectionOld = 'left';
  } else {
    orc.hDirection = null;
  }

  // vertical
  if (orcY < heroY) {
    orc.vDirection = 'down';
    orc.vDirectionOld = 'down';
  } else if (orcY > heroY) {
    orc.vDirection = 'up';
    orc.vDirectionOld = 'up';
  } else {
    orc.vDirection = 'down';
  }
};

const move = (dt: number, orc: Character) => {
  let speed = config.game.orcSpeed;
  if (orc.state === State.chase) speed = config.game.orcChaseSpeed;
  let moveX = 0;
  let moveY = 0;
  // direction
  if (orc.vDirection === 'up') moveY += -1;
  else if (orc.vDirection === 'down') moveY += 1;
  if (orc.hDirection === 'left') moveX += -1;
  else if (orc.hDirection === 'right') moveX += 1;
  // move normalisation
  const norm = Math.sqrt(moveX * moveX + moveY * moveY);
  moveX /= norm / (speed * 10 * dt);
  moveY /= norm / (speed * 10 * dt);
  // collide detection & move
  const x = orc.position.x + moveX;
  const y = orc.position.y + moveY;
  let walkX = false;
  let walkY = false;
  if (isWalkable(x - 4, orc.position.y - 4, 7.5, 7.5)) {
    orc.position.x = x;
    walkX = true;
  }
  if (isWalkable(orc.position.x - 4, y - 4, 7.5, 7.5)) {
    orc.position.y = y;
    walkY = true;
  }
  const walk = (walkX && moveX !== 0) || (walkY && moveY !== 0);
  // animation
  const animation = `walk_${orc.hDirection || orc.hDirectionOld}_${
    orc.vDirection || orc.vDirectionOld
  }`;
  setAnimation(orc.spritesheet, animation);
  return walk;
};

const startAttack = (orc: Character, hero: Character) => {
  if (orc.timerNextAttack > 0) {
    const animation = `idle_${orc.hDirection || orc.hDirectionOld}_${
      orc.vDirection || orc.vDirectionOld
    }`;
    setAnimation(orc.spritesheet, animation);
    return;
  }
  orc.timerNextAttack = config.game.orcTimerNextAttack;
  resetAnimation(orc);
  directionToHero(orc, hero);
  const animation = `attack_${orc.hDirection || orc.hDirectionOld}_${
    orc.vDirection || orc.vDirectionOld
  }`;
  setAnimation(orc.spritesheet, animation);
  playSound(orc.sound.attack);
};

const resetAnimation = (orc: Character) => {
  orc.spritesheet.currentFrame = 0;
  orc.spritesheet.animationFinished = false;
};
