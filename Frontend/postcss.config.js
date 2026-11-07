import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default {
  plugins: [
    tailwindcss(),
    autoprefixer(),
    {
      // Keep Tailwind's inert transparent shadow defaults within the palette.
      postcssPlugin: 'palette-transparency',
      Declaration(declaration) {
        declaration.value = declaration.value.replace(/#0000\b/g, '#16112600');
      },
    },
  ],
};
