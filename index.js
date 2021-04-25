const validateOptions = require('schema-utils');
const schema = require('./schema.json');

/*
  Plugin modified from:
  https://gist.github.com/devonChurch/c8f43d0270fc71168cdf23765043f679#file-webpack.config-js
  https://gist.github.com/ScriptedAlchemy/60d0c49ce049184f6ce3e86ca351fdca
*/

/**
 * Change `publicPath` at run time rather than build time for dynamic module federated containers.
 * This allows builds to be environment agnostic and have `publicPath` update via the supplied run-time configuration.
 * @class
 */
class DynamicContainerPathPlugin {
  /**
   * @param {options.iffe} immediatelyInvokedFunctionExpression - An immediately invoked function expression to get `publicPath` at runtime.
   * @param {options.entry} thisApplicationsMainEntryPoint - The entry point name of the application.
   */
  constructor(options) {
    // validate options being passed through the plugin
    validateOptions(schema, options, 'DynamicContainerPathPlugin');
    // supply the custom function used to generate public path dynamically
    this.options = options;
  }

  getInternalPublicPathVariable(module) {
    /*
      Strip out 'publicPath's' value '/' using webpack's internal global variable set
      at build time (a.k.a. '__webpack_require__.p')

      Note: we cannot simply declare '__webpack_require__.p' because it will not have
      the appropriate context, but we can tap into 'PublicPathRuntimeModule' hooks to get it

      'getGeneratedCode()'
      https://github.com/webpack/webpack/blob/afc9b2fcf9bef0831640b3ebb02b73068ba18e17/types.d.ts#L8989
      https://github.com/webpack/webpack/blob/af52c8f0457b1055098d6b7b545b257404d06c93/lib/RuntimeModule.js#L171
    */
    const [publicPath] = module.getGeneratedCode().split('=');
    return [publicPath];
  }

  setNewPublicPathValueFromRuntime(module, publicPath) {
    /*
      By default, 'module._cachedGeneratedCode' is equal to '__webpack_require__.p = "/";' at build time

      Now, we set 'publicPath's' internal variable '__webpack_require__.p' from 'getInternalPublicPathVariable'
      equal to an anonymous function that will dynamically set the 'host' 'publicPath' at runtime
    */
    module._cachedGeneratedCode = `${publicPath}=${this.options.iife}('${this.options.entry}');`;
    return module;
  }

  changePublicPath(module, chunk) {
    console.log(`Changing static publicPath for chunk: ${chunk.name}`);
    const publicPath = this.getInternalPublicPathVariable(module);
    return this.setNewPublicPathValueFromRuntime(module, publicPath);
  }

  apply(compiler) {
    /*
      Use the compiler to access the main Webpack environment.

      Tap into execution before finishing the compilation.
      https://webpack.js.org/api/compiler-hooks/#make
    */
    compiler.hooks.make.tap('MutateRuntime', compilation => {
      /*
        Use compilations to view and alter the present state of modules.

        Compilation hook used by Module Federation author for Remote PublicPath Modification
        https://gist.github.com/ScriptedAlchemy/60d0c49ce049184f6ce3e86ca351fdca#file-mutateruntimeplugin-js-L23

        Note: 'runtimeModule' hook is not yet on webpack docs, but mentioned as a migration footnote:
        https://webpack.js.org/blog/2020-10-10-webpack-5-release/#runtime-modules
      */
      compilation.hooks.runtimeModule.tap('MutateRuntime', (module, chunk) => {
        // https://github.com/webpack/webpack/blob/master/lib/runtime/PublicPathRuntimeModule.js
        module.constructor.name === 'PublicPathRuntimeModule'
          ? this.changePublicPath(module, chunk)
          : false;
      });
    });
  }
}

module.exports = DynamicContainerPathPlugin;
