/*
  This function will be supplied to 'DynamicPublicPathPlugin' and uses '__MAP__' and  '__ENVIRONMENT__'
  vars set in 'index.html' (our run-time configuration) to dynamically set the 'host' 'publicPath' at runtime.

  Note:
    '__MAP__' is the map.config.json object with a global reference of endpoints
    '__ENVIRONMENT__' is the environment context set by our build pipelines via 'environment.config.json'
*/

module.exports = function (entry) {
  const { __MAP__, __ENVIRONMENT__ } = window;
  const { href } = __MAP__[entry][__ENVIRONMENT__];
  const publicPath = href + "/";
  return publicPath;
};
