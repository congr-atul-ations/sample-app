const activeTheme = 'deep-sea';

const themeColors = {
  original: '#151b17',
  'deep-sea': '#0b1726',
  'green-screen': '#0b170e',
  'desert-run': '#201811',
};

if (!Object.hasOwn(themeColors, activeTheme)) {
  throw new Error(`Unknown Ghost Relay theme "${activeTheme}". Use one of: ${Object.keys(themeColors).join(', ')}.`);
}

export const theme = { name: activeTheme, color: themeColors[activeTheme] };
