const prefixSelector = require('postcss-prefix-selector');

module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
    /*prefixSelector({
      prefix: '#replichat-root',
      transform: (prefix, selector, prefixedSelector) => {
        if (selector.startsWith('html') || selector.startsWith('body')) {
          return selector;
        }
        return selector;
      },
    }),*/
  ],
};
