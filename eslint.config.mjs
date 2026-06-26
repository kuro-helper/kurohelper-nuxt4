import withNuxt from './.nuxt/eslint.config.mjs';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';

export default withNuxt(eslintConfigPrettier, {
  plugins: { prettier: eslintPluginPrettier },
  rules: {
    'vue/multi-word-component-names': 'off',
    'prettier/prettier': 'error',
  },
});
