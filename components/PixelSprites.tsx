import React from 'react';
import Svg, { Rect } from 'react-native-svg';

type Color = string | null;

const PixelArt: React.FC<{ pixels: Color[][]; pixelSize?: number }> = ({
  pixels,
  pixelSize = 5,
}) => {
  const rows = pixels.length;
  const cols = pixels[0]?.length ?? 0;
  return (
    <Svg width={cols * pixelSize} height={rows * pixelSize}>
      {pixels.flatMap((row, y) =>
        row.map((color, x) =>
          color ? (
            <Rect
              key={`${x},${y}`}
              x={x * pixelSize}
              y={y * pixelSize}
              width={pixelSize}
              height={pixelSize}
              fill={color}
            />
          ) : null
        )
      )}
    </Svg>
  );
};

const _ = null;
const W = '#f0e6ff'; // white body
const P = '#4c1d95'; // dark purple outline
const B = '#0a0015'; // black eyes
const K = '#f9a8d4'; // pink blush
const M = '#9333ea'; // mushroom cap
const D = '#c4b5fd'; // cap dots (light purple)
const T = '#e9d5ff'; // stem

const GHOST_PIXELS: Color[][] = [
  [_, _, P, P, P, P, _, _],
  [_, P, W, W, W, W, P, _],
  [P, W, W, W, W, W, W, P],
  [P, W, B, W, W, B, W, P],
  [P, W, W, W, W, W, W, P],
  [P, W, K, W, W, K, W, P],
  [P, W, W, W, W, W, W, P],
  [P, W, W, W, W, W, W, P],
  [P, P, W, P, W, P, W, P],
  [_, P, P, _, P, _, P, _],
];

const CAT_PIXELS: Color[][] = [
  [P, P, _, _, _, _, P, P],
  [P, W, P, _, _, P, W, P],
  [P, W, W, W, W, W, W, P],
  [P, W, B, W, W, B, W, P],
  [P, W, W, W, K, W, W, P],
  [P, W, W, W, W, W, W, P],
  [P, W, W, W, W, W, W, P],
  [_, P, P, P, P, P, P, _],
];

const SHROOM_PIXELS: Color[][] = [
  [_, _, _, M, M, M, _, _, _],
  [_, _, M, M, M, M, M, _, _],
  [_, M, M, D, M, M, D, M, _],
  [M, M, M, M, M, M, M, M, M],
  [M, M, M, M, M, M, M, M, M],
  [_, M, M, M, M, M, M, M, _],
  [_, _, P, T, T, T, P, _, _],
  [_, _, T, T, T, T, T, _, _],
  [_, _, T, T, T, T, T, _, _],
  [_, P, T, T, T, T, T, P, _],
];

export const Ghost: React.FC<{ pixelSize?: number }> = ({ pixelSize }) => (
  <PixelArt pixels={GHOST_PIXELS} pixelSize={pixelSize} />
);

export const Cat: React.FC<{ pixelSize?: number }> = ({ pixelSize }) => (
  <PixelArt pixels={CAT_PIXELS} pixelSize={pixelSize} />
);

export const Mushroom: React.FC<{ pixelSize?: number }> = ({ pixelSize }) => (
  <PixelArt pixels={SHROOM_PIXELS} pixelSize={pixelSize} />
);
