import babel from 'rollup-plugin-babel';

export default {
  entry: 'src/cornerstone.js',
  format: 'iife',
  moduleName: 'cornerstone',
  plugins: [ babel() ],
  dest: 'build/built.js'
};
