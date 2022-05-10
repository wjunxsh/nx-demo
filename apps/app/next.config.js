// eslint-disable-next-line @typescript-eslint/no-var-requires
const withNx = require('@nrwl/next/plugins/with-nx');

// This plugin is needed until this PR is merged.
// https://github.com/vercel/next.js/pull/23185
const withLess = require('@nrwl/next/plugins/with-less');
const baseConfig = require('./config');

/**
 * @type {import('@nrwl/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  // Set this to true if you use CSS modules.
  // See: https://github.com/css-modules/css-modules
  cssModules: false,
  async rewrites() {
    return [
      {
        source: '/auth/:path*',
        destination: `${baseConfig.apiRoot}/auth/:path*`
      },
      {
        source: '/shopify/:path*',
        destination: `${baseConfig.apiRoot}/shopify/:path*`
      }
    ]
  }
  // webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
  //   return config;
  // },
};


module.exports = withLess(withNx(nextConfig));