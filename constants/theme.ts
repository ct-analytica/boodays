export interface ColorScheme {
  bg: string;
  bgCard: string;
  bgCardLight: string;
  border: string;
  borderAccent: string;
  purple: string;
  purpleLight: string;
  purplePale: string;
  pink: string;
  pinkLight: string;
  teal: string;
  tealDark: string;
  white: string;
  text: string;
  textMuted: string;
  black: string;
  gold: string;
}

export const PURPLE_COLORS: ColorScheme = {
  bg: '#1a0a2e',
  bgCard: '#2d1b4e',
  bgCardLight: '#3d2560',
  border: '#7c3aed',
  borderAccent: '#a78bfa',
  purple: '#7c3aed',
  purpleLight: '#a78bfa',
  purplePale: '#c4b5fd',
  pink: '#f472b6',
  pinkLight: '#fda4cf',
  teal: '#4ade80',
  tealDark: '#16a34a',
  white: '#f0e6ff',
  text: '#e2d4f0',
  textMuted: '#a78bfa',
  black: '#0a0015',
  gold: '#fbbf24',
};

// jimison3 October palette contest — mushroom / pumpkin / dungeon
// Top row:  #1a0f1e · #5e1820 · #8b2424 · #a63a38 · #4a4060
//           #b85820 · #d4780c · #e8a020 · #f0c030 · #f8e870
// Bot row:  #b8a870 · #987878 · #706888 · #484060 · #383848
//           #5a6878 · #788898 · #90a8a0 · #b0c0a8 · #d8d0a8
export const OCTOBER_COLORS: ColorScheme = {
  bg: '#1a0f1e',        // deep purple-black (dungeon shadow)
  bgCard: '#2d1420',    // dark wine
  bgCardLight: '#4a1828', // crimson-dark
  border: '#b85820',    // burnt sienna / mushroom cap
  borderAccent: '#e8a020', // amber — torch glow
  purple: '#4a4060',    // cool dungeon-purple
  purpleLight: '#706888', // muted purple-grey
  purplePale: '#987878',  // muted mauve
  pink: '#8b2424',      // deep crimson
  pinkLight: '#a63a38', // muted terracotta-red
  teal: '#90a8a0',      // sage / dungeon moss
  tealDark: '#5a6878',  // slate-blue stone
  white: '#d8d0a8',     // warm parchment cream
  text: '#b8a870',      // warm tan
  textMuted: '#706888', // muted purple-grey
  black: '#1a0f1e',     // same as bg
  gold: '#f0c030',      // harvest gold / candle flame
};

export type PaletteName = 'purple' | 'october';

export const PALETTE_LABELS: Record<PaletteName, string> = {
  purple: '✦ MYSTIC',
  october: '🎃 OCTOBER',
};

export const PIXEL_FONT = 'PressStart2P_400Regular';
