const c = (n) => `rgb(var(--${n}) / <alpha-value>)`;
/** Colors are CSS variables (see index.css) so light/dark share one set of class names. */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      colors: {
        bg: c('bg'), surface: c('surface'), subtle: c('subtle'), line: c('line'),
        ink: c('ink'), muted: c('muted'), accent: c('accent'),
        crit: c('crit'), warn: c('warn'), ok: c('ok'),
      },
      boxShadow: {
        card: '0 1px 2px rgb(0 0 0 / 0.04)',
        pop: '0 12px 40px rgb(0 0 0 / 0.16)',
      },
    },
  },
  plugins: [],
};
