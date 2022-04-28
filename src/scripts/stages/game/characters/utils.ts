import { Character } from './ICharacter';
import { hero } from './hero/hero';

export const isInDirection = (c1: Character, c2: Character) => {
  const c1X = c1.position.x;
  const c1Y = c1.position.y;
  const c2X = c2.position.x;
  const c2Y = c2.position.y;

  let hDirection = false;
  let vDirection = false;

  const tolerance = 1;

  // horizontal
  if (c1X < c2X + tolerance && c1.hDirection === 'right') {
    hDirection = true;
  } else if (c1X > c2X - tolerance && c1.hDirection === 'left') {
    hDirection = true;
  } else if (c1X === c2X) {
    hDirection = true;
  }

  // vertical
  if (c1Y <= c2Y + tolerance && c1.vDirection === 'down') {
    vDirection = true;
  } else if (c1Y > c2Y - tolerance && c1.vDirection === 'up') {
    vDirection = true;
  }

  return hDirection && vDirection;
};

const angle = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.atan2(y2 - y1, x2 - x1);
};

export const isInWeaponDirection = (
  attacker: Character,
  victime: Character
) => {
  const aX = attacker.position.x;
  const aY = attacker.position.y;
  const vX = victime.position.x;
  const vY = victime.position.y;

  const a = angle(aX, aY, vX, vY) * (180 / Math.PI);

  const aName = attacker.spritesheet.currentAnimation.name;

  // top right
  if (aName === 'attack_right_up' && a >= -110 && a <= 20) {
    return true;
  }

  // top left
  else if (
    aName === 'attack_left_up' &&
    ((a <= -70 && a >= -180) || (a <= 160 && a >= 180))
  ) {
    return true;
  }

  // down right
  else if (aName === 'attack_right_down' && a >= -20 && a <= 110) {
    return true;
  }

  // down left
  else if (
    aName === 'attack_left_down' &&
    ((a >= -180 && a <= -160) || (a >= 70 && a <= 180))
  ) {
    return true;
  }

  return false;
};
