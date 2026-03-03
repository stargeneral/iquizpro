/**
 * webpack.config.js — iQuizPros Build Configuration
 *
 * Strategy: Keep all IIFE modules as-is; bundle them in dependency order
 * via src/app-entry.js. Each module sets window.QuizProsXxx as a side effect,
 * which works correctly because webpack preserves explicit window.X assignments.
 *
 * Bundles produced:
 *   dist/js/app.[hash].js      — all app JS (25+ scripts → 1 file)
 *   dist/css/app.[hash].css    — all app CSS (9 files → 1 file)
 *   dist/index.html            — updated index.html with injected bundle tags
 *   dist/assets/               — copied static assets
 *   dist/templates/            — copied quiz JSON templates
 *   dist/fonts/                — copied fonts
 *   dist/js/live-*.js          — pre-built presenter/audience webpack bundles (copied as-is)
 *   dist/*.html                — other HTML pages (copied as-is)
 */

const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';

  return {
    // Single entry: all JS + CSS in dependency order
    entry: './src/app-entry.js',

    output: {
      path: path.resolve(__dirname, 'dist'),
      // Content-hash filenames in production for cache busting
      filename: isProd ? 'js/app.[contenthash:8].js' : 'js/app.js',
      // Clean dist/ before each build
      clean: true,
    },

    // Source maps: full in dev, none in prod (keeps bundle small)
    devtool: isProd ? false : 'source-map',

    // webpack-dev-server configuration for `npm start`
    devServer: {
      static: {
        directory: path.resolve(__dirname, 'dist'),
      },
      port: 5000,
      open: true,
      // No HMR — IIFE pattern doesn't support hot module replacement
      hot: false,
      liveReload: true,
      watchFiles: [
        'src/**/*',
        'js/**/*.js',
        'css/**/*.css',
        'styles.css',
        'toast-styles.css',
        '*.html',
      ],
      historyApiFallback: true,
    },

    plugins: [
      // Extract CSS into a separate file (injected as <link> in <head>)
      new MiniCssExtractPlugin({
        filename: isProd ? 'css/app.[contenthash:8].css' : 'css/app.css',
      }),

      // Generate dist/index.html from template, injecting bundle tags
      new HtmlWebpackPlugin({
        template: './src/index.template.html',
        filename: 'index.html',
        inject: 'body', // <script> tags before </body>; <link> tags in <head>
        minify: isProd
          ? {
              removeComments: false, // Preserve inline script comments
              collapseWhitespace: true,
              removeAttributeQuotes: false, // Keep quotes for safety
              minifyJS: false, // Don't minify inline scripts (Terser handles .js files)
              minifyCSS: false,
            }
          : false,
      }),

      // Copy all static assets that webpack doesn't process
      new CopyPlugin({
        patterns: [
          // Static asset directories
          { from: 'assets', to: 'assets' },
          { from: 'templates', to: 'templates' },
          { from: 'fonts', to: 'fonts', noErrorOnMissing: true },

          // Favicon
          { from: 'favicon.ico', to: 'favicon.ico', noErrorOnMissing: true },

          // Other HTML pages (not index.html — that's handled by HtmlWebpackPlugin)
          { from: 'contact.html', to: 'contact.html', noErrorOnMissing: true },
          { from: 'contact-page.html', to: 'contact-page.html', noErrorOnMissing: true },
          { from: 'premium.html', to: 'premium.html', noErrorOnMissing: true },
          { from: 'privacy-policy.html', to: 'privacy-policy.html', noErrorOnMissing: true },
          { from: 'privacy.html', to: 'privacy.html', noErrorOnMissing: true },
          { from: 'quiz.html', to: 'quiz.html', noErrorOnMissing: true },
          { from: 'terms-of-use.html', to: 'terms-of-use.html', noErrorOnMissing: true },
          { from: 'terms.html', to: 'terms.html', noErrorOnMissing: true },
          { from: 'personality-banner.html', to: 'personality-banner.html', noErrorOnMissing: true },
          { from: 'live-presenter.html', to: 'live-presenter.html', noErrorOnMissing: true },
          { from: 'live-audience.html', to: 'live-audience.html', noErrorOnMissing: true },
          { from: 'dashboard.html', to: 'dashboard.html', noErrorOnMissing: true },
          { from: 'admin.html', to: 'admin.html', noErrorOnMissing: true },

          // Error pages
          { from: '404.html', to: '404.html', noErrorOnMissing: true },

          // SEO files
          { from: 'sitemap.xml', to: 'sitemap.xml', noErrorOnMissing: true },
          { from: 'robots.txt', to: 'robots.txt', noErrorOnMissing: true },

          // PWA files (Phase 8)
          { from: 'manifest.json', to: 'manifest.json' },
          { from: 'sw.js', to: 'sw.js' },

          // Pre-built live presenter/audience webpack bundles (already minified)
          // These are existing content-hashed bundles — copy as-is
          { from: 'js/runtime.6fdec4f4d8bfa2f8d22e.js', to: 'js/runtime.6fdec4f4d8bfa2f8d22e.js', noErrorOnMissing: true },
          { from: 'js/vendors.de788a87b9bb3625350b.js', to: 'js/vendors.de788a87b9bb3625350b.js', noErrorOnMissing: true },
          { from: 'js/main.fbb37b19692fd0d5c56a.js', to: 'js/main.fbb37b19692fd0d5c56a.js', noErrorOnMissing: true },
          { from: 'js/vendor.409035b1c3be45e43278.js', to: 'js/vendor.409035b1c3be45e43278.js', noErrorOnMissing: true },
          { from: 'js/live-presenter.e6fc5f16770ec082babb.js', to: 'js/live-presenter.e6fc5f16770ec082babb.js', noErrorOnMissing: true },
          { from: 'js/live-audience.31a46b5cdf8fe0b3ca6d.js', to: 'js/live-audience.31a46b5cdf8fe0b3ca6d.js', noErrorOnMissing: true },

          // Dynamic chunks required by live-presenter bundle
          { from: 'js/915.49413b2e638323945e38.js', to: 'js/915.49413b2e638323945e38.js', noErrorOnMissing: true },
          { from: 'js/889.809a4e3dd18bb1f977d5.js', to: 'js/889.809a4e3dd18bb1f977d5.js', noErrorOnMissing: true },
          { from: 'js/763.a199c2bc453ad46625c0.js', to: 'js/763.a199c2bc453ad46625c0.js', noErrorOnMissing: true },
        ],
      }),
    ],

    module: {
      rules: [
        {
          test: /\.css$/i,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                // Don't process url() in CSS — assets are copied separately by CopyPlugin
                // All url() paths in CSS use absolute paths (leading /) so they resolve correctly
                url: false,
              },
            },
          ],
        },
      ],
    },

    optimization: isProd
      ? {
          minimize: true,
          minimizer: [
            new TerserPlugin({
              terserOptions: {
                compress: {
                  // Keep console statements for debugging in production
                  drop_console: false,
                },
                format: {
                  comments: false,
                },
              },
              extractComments: false,
            }),
            new CssMinimizerPlugin(),
          ],
        }
      : {},

    // Bundle size budget: warn in production when assets exceed 500KB (gzip ~160KB)
    performance: {
      hints: isProd ? 'warning' : false,
      maxAssetSize: 512 * 1024, // 500KB threshold
      maxEntrypointSize: 512 * 1024,
    },
  };
};
