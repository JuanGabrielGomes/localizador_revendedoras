/**
 * Mesma paleta usada no app web (ver app/globals.css do projeto raiz) —
 * replicada aqui porque React Native não tem CSS/Tailwind; StyleSheet usa
 * esses valores diretamente.
 */
export const colors = {
  onyx: "#0b0b0d",
  onyxSoft: "#17171b",
  onyxLine: "#2c2c31",
  gold: "#d9a441",
  goldLight: "#f0c869",
  foreground: "#f3ede0",
  foregroundMuted: "rgba(243, 237, 224, 0.6)",
  foregroundFaint: "rgba(243, 237, 224, 0.4)",
  danger: "#f87171",
  dangerBg: "rgba(127, 29, 29, 0.35)",
  dangerBorder: "rgba(127, 29, 29, 0.5)",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  pill: 999,
} as const;
