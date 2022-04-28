import {
  createSpriteSheet,
  createTileSet,
  drawSpriteSheet,
  drawTile,
  randomRange,
  setAnimation,
  SpriteSheet,
  TileSet,
  updateSpriteSheet,
} from '../../../r-row';
import dataMap from '../../../../map/map.json';
import { dataTiles } from './tiles';
import torchAnimation from './torchAnimation.json';
import torchLightAnimation from './torchLightAnimation.json';
import config from '../../../../config.json';

let tilesMap: Record<'cliff_wall' | 'decor', number[]> = {
  cliff_wall: [],
  decor: [],
};
let collideMap: Record<number, Record<number, boolean>> = {};
let cliff: TileSet;
let floor: TileSet;
let props: TileSet;
let wall: TileSet;
let torches: SpriteSheet[] = [];
let torchLights: SpriteSheet[] = [];

export const createMap = () => {
  parseMap();
  cliff = createTileSet('cliff', 8, 8);
  floor = createTileSet('floor', 8, 8);
  props = createTileSet('props', 8, 8);
  wall = createTileSet('wall', 8, 8);
};

const parseMap = () => {
  parseVisibleMap();
  parseCollideMap();
};

const parseVisibleMap = () => {
  dataMap.layers[0].data.forEach((tile) => {
    tilesMap.cliff_wall.push(tile);
  });
  dataMap.layers[1].data.forEach((tile, index) => {
    tilesMap.decor.push(tile);
    if (tile === 626) {
      const c = getCaseFromTileID(index);
      const x = (c.column + 1) * dataMap.tilewidth;
      const y1 = (c.line + 1) * dataMap.tileheight;
      const y2 = (c.line + 1.5) * dataMap.tileheight;
      const torch = createSpriteSheet(
        'torch',
        torchAnimation.animations,
        torchAnimation.frame
      );
      torch.position = { x, y: y1 };
      setAnimation(torch, 'run');
      torch.currentFrame = randomRange(
        index.toString(),
        0,
        torch.animations['run'].frames.length
      );
      torches.push(torch);
      const torchLight = createSpriteSheet(
        'torchLight',
        torchLightAnimation.animations,
        torchLightAnimation.frame
      );
      torchLight.position = { x, y: y2 };
      setAnimation(torchLight, 'run');
      torchLight.currentFrame = torch.currentFrame;
      torchLights.push(torchLight);
    }
  });
};

const parseCollideMap = () => {
  dataMap.layers[2].data.forEach((tile, index) => {
    const c = getCaseFromTileID(index);
    if (collideMap[c.line] === undefined) collideMap[c.line] = {};
    collideMap[c.line][c.column] = tile === 675;
  });
};

const getCaseFromTileID = (tileID: number) => {
  const lineMax = dataMap.width;
  const line = Math.floor(tileID / lineMax);
  const column = tileID - lineMax * line;
  return { line, column };
};

export const updateMap = (dt: number) => {
  torches.forEach((torch) => {
    updateSpriteSheet(dt, torch);
  });
  torchLights.forEach((torchLight) => {
    updateSpriteSheet(dt, torchLight);
  });
};

export const drawGround = (ctx: CanvasRenderingContext2D) => {
  drawMap(ctx, 'cliff');
  drawMap(ctx, 'floor');
};

export const drawWall = (ctx: CanvasRenderingContext2D) => {
  drawMap(ctx, 'wall');
  drawMap(ctx, 'props');
  torchLights.forEach((torchLight) => {
    drawSpriteSheet(ctx, torchLight);
  });
  torches.forEach((torch) => {
    drawSpriteSheet(ctx, torch);
  });
};

const drawMap = (
  ctx: CanvasRenderingContext2D,
  layer: 'cliff' | 'floor' | 'props' | 'wall'
) => {
  const lay = layer === 'props' ? 1 : 0;
  const mapWidth = dataMap.layers[lay].width;
  const mapHeight = dataMap.layers[lay].height;

  let index = -1;
  for (let line = 0; line < mapHeight; line++) {
    for (let column = 0; column < mapWidth; column++) {
      index++;
      const ID = dataMap.layers[lay].data[index];
      const tileType = dataTiles[ID].type;
      if (tileType !== layer) continue;
      const tileID = dataTiles[ID].ID;
      const tileWidth = dataMap.tilewidth;
      const tileHeight = dataMap.tileheight;

      let tileSet: TileSet;
      switch (tileType) {
        case 'cliff':
          tileSet = cliff;
          break;
        case 'floor':
          tileSet = floor;
          break;
        case 'wall':
          tileSet = wall;
          break;
        case 'props':
          tileSet = props;
      }

      const x = column * tileWidth;
      const y = line * tileHeight;

      drawTile(ctx, tileSet, tileID, x, y);
    }
  }
};

export const isWalkable = (
  x: number,
  y: number,
  width: number,
  height: number
) => {
  const point1 = getCaseFromXY(x, y);
  const point2 = getCaseFromXY(x, y + height);
  const point3 = getCaseFromXY(x + width, y);
  const point4 = getCaseFromXY(x + width, y + height);

  let isWalkable = true;

  if (collideMap[point1.line][point1.column]) {
    isWalkable = false;
  } else if (collideMap[point2.line][point2.column]) {
    isWalkable = false;
  } else if (collideMap[point3.line][point3.column]) {
    isWalkable = false;
  } else if (collideMap[point4.line][point4.column]) {
    isWalkable = false;
  }
  return isWalkable;
};

const getCaseFromXY = (x: number, y: number) => {
  const width = dataMap.tilewidth;
  const height = dataMap.tileheight;
  const line = Math.floor(y / height);
  const column = Math.floor(x / width);
  return { line, column };
};
