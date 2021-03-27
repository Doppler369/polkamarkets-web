const cracoPluginStyleResourcesLoader = require('craco-plugin-style-resources-loader');
const path = require('path');

module.exports = {
  plugins: [
    {
      plugin: cracoPluginStyleResourcesLoader,
      options: {
        hoistUseStatements: true,
        patterns: [
          path.join(__dirname, './src/styles/abstracts/variables/*.scss'),
          path.join(__dirname, './src/styles/abstracts/mixins/*.scss')
        ],
        styleType: 'scss'
      }
    }
  ]
};
