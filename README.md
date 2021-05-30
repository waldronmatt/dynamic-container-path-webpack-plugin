<div align="center">
  <a href="https://avatars.githubusercontent.com/u/61727377?s=200&amp;v=4"><img width="200" height="200" src="https://avatars.githubusercontent.com/u/61727377?s=200&amp;v=4"></a>
  <a href="https://webpack.js.org/assets/icon-square-big.svg"><img width="200" height="200" src="https://webpack.js.org/assets/icon-square-big.svg"></a>
</div>

# dynamic-container-path-webpack-plugin

> A `publicPath` mutator webpack plugin for module federation.

## About plugin

Change `publicPath` at run time rather than build time for dynamic module federated containers.

This should be used in conjunction with module federation's [exposed methods for initializing remote containers dynamically](https://webpack.js.org/concepts/module-federation/#dynamic-remote-containers) instead of using the `remotes` parameter for static paths.

## Install

```bash
npm install --save-dev dynamic-container-path-webpack-plugin
```

## Usage

`webpack.config.js`

```js
const { ModuleFederationPlugin } = require("webpack").container;
const DynamicContainerPathPlugin = require('dynamic-container-path-webpack-plugin');
const setPublicPath = require('dynamic-container-path-webpack-plugin/set-path');

module.exports = {
  entry: {
    ...
    Host: ["./app.js"],
  },
  output: {
    ...
    // this will be changed later by 'DynamicContainerPathPlugin' at runtime
    publicPath: "/",
  },
  // ...
  plugins: [
    // ...
    new ModuleFederationPlugin({
      ...
    }),
    new DynamicContainerPathPlugin({
      iife: setPublicPath,
      entry: 'Host',
    }),
    // ...
  ],
  // ...
};
```

## Options

### `iife`

- Type: `function`

An immediately invoked function expression to get `publicPath` at runtime.

### `entry`

- Type: `string`

The entry point name of the application.

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

MIT
