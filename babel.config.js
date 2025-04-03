module.exports = {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [
        ["module:react-native-dotenv", {
            "moduleName": "@env"
          }],
      // Ensure consistency in the 'loose' setting for class-properties and private-methods
      [
        '@babel/plugin-transform-private-methods',
        {
          loose: true, // or loose: false, but it must be consistent
        },
      ],
      [
        '@babel/plugin-transform-class-properties',
        {
          loose: true, // or loose: false, but it must be consistent
        },
      ],
      [
        '@babel/plugin-transform-private-property-in-object',
        {
          loose: true, // or loose: false, but it must be consistent
        },
      ],
    ],
  };
  