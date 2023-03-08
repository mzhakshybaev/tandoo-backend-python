const webpack = require('webpack');
const HtmlWebpackPlugin = require("html-webpack-plugin");

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MinifyPlugin = require("babel-minify-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const path = require("path");

const BUILD_DIR = path.resolve(__dirname, './web/build');
const SRC_DIR = path.resolve(__dirname, './web/src');
const PORT = 8080;

module.exports = env => {
  const devMode = env.prod !== true;
  console.log("MODE: ", devMode ? 'DEVELOPMENT' : 'PRODUCTION');
  return {
    entry: path.join(SRC_DIR, 'index.js'),
    optimization: {
      minimizer: [
        new OptimizeCSSAssetsPlugin({})
      ],
      splitChunks: {
        cacheGroups: {
          default: false,
          vendors: false,
          // vendor chunk
          vendor: {
            // sync + async chunks
            chunks: 'all',
            name: 'vendor',
            // import file path containing node_modules
            test: /node_modules/,
            maxSize: 2097152
          }
        }
      }
    },
    output: {
      path: BUILD_DIR,
      chunkFilename: `chunk.[chunkhash].js`,
      // filename:`[id].[chunkhash].js`
      filename: 'index.bundle.js',
      // publicPath: '/'
    },
    mode: devMode ? 'development' : 'production',
    resolve: {
      modules: [SRC_DIR, 'node_modules'],
      alias: {
        utils: path.resolve(__dirname, 'utils'),
        components: path.resolve(SRC_DIR, 'components'),
        controllers: path.resolve(__dirname, 'controllers'),
        stores: path.resolve(__dirname, 'stores'),
      }
    },
    devServer: {
      contentBase: SRC_DIR,
      port: PORT,
      host: 'localhost',
      // historyApiFallback: true
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify(env.prod ? 'production' : 'development')
        }
      }),
      new CopyWebpackPlugin([
          {from: './web/public/img', to: 'img'}
        ],
        {copyUnmodified: false}
      ),
      new webpack.ContextReplacementPlugin(
        /moment[/\\]locale$/,
        /en|ru|ky|tr/
      ),

      new HtmlWebpackPlugin(
        {
          inject: true,
          template: './web/public/index.html'
        }
      ),

      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: devMode ? '[name].css' : 'index.[hash].css',
        chunkFilename: devMode ? '[id].css' : 'css.[chunkhash].css',
      }),
      new MinifyPlugin(),

      new BundleAnalyzerPlugin({analyzerMode: 'static', openAnalyzer: false}),
    ],
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: ['babel-loader']
        },
        // {
        //   test: /\.(css|scss)$/,
        //   use: [
        //     "style-loader",
        //     "css-loader",
        //     "sass-loader"
        //   ]
        // },
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
            'css-loader',
            'sass-loader',
          ],
        },
        {
          test: /\.(jpg|jpeg|png|gif|mp3|svg)$/,
          loaders: ["file-loader"]
        },
        {
          test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
          loader: 'file-loader',
          options: {
            name: './fonts/[name].[hash].[ext]'
          }
        }
      ]
    },
  }
};
