const webpack = require("webpack");
const path = require("path");
const nodeExternals = require("webpack-node-externals");
const ChunkRenamePlugin = require("webpack-chunk-rename-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
const Dotenv = require("dotenv-webpack");

// App directory
const fs = require("fs");
const appDirectory = fs.realpathSync(process.cwd());

// Gets absolute path of file within app directory
const resolveAppPath = (relativePath) =>
  path.resolve(appDirectory, relativePath);

module.exports = (env, argv) => ({
  context: path.join(__dirname, "/"),
  entry: {
    app: "./index.js",
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    publicPath: "",
    filename: "[name].[hash:10].js",
    chunkFilename: "[name].[hash:10].js",
  },
  mode: "production",
  optimization: {
    minimize: true,
    minimizer: [
      new TerserWebpackPlugin({
        terserOptions: {
          format: {
            comments: false,
          },
          cache: true,
          parallel: true,
          sourceMap: false,
          compress: {
            drop_console: true,
          },
        },
        extractComments: false,
      }),
    ],
    runtimeChunk: "single",
    splitChunks: {
      chunks: "async",
      automaticNameDelimiter: "_",
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
          maxSize: 250 * 1024, // 250 KiB
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "swc-loader",
        },
      },
      {
        test: /\.(css|scss)$/,
        resolve: { extensions: [".css",".scss"] },
        use: [
          {
            loader : MiniCssExtractPlugin.loader,
            // options: {
            //   publicPath: "./public/"
            // }
          }, 
          {
            loader: "css-loader",
            options: {
              // modules: {
              //   exportLocalsConvention: "camelCase", 
              // },
              sourceMap: true,                                        
            }
          },
          {
            loader: `postcss-loader`,
            options: {
              plugins: () => [require("autoprefixer")],
              sourceMap: true,
            },
          },
          {
            loader: "sass-loader",
            options: {             
              sourceMap: true,             
            }
          },   
        ],
      },
      {
        test: /\.(less)$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "less-loader"],
      },
      {
        test: /\.(ts|tsx)$/,
        
        use: [
          // {
          //   loader: 'ts-loader',
          // },
         {
            loader: "swc-loader",
            options: {
                jsc: {
                    parser: {
                        syntax: "typescript"
                    }
                }
            }
          }
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.(jpe?g|png|gif|woff|woff2|eot|ttf|svg)(\?[a-z0-9=.]+)?$/,
        loader: "url-loader?limit=100000",
      },
    ],
  },
  plugins: [
    // new BundleAnalyzerPlugin(),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: "styles.css",
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
    new Dotenv({
      path: path.join(__dirname,"dotenv",".env.production"),
    }),
    new ChunkRenamePlugin({
      initialChunks: true,
      // vendors: "[name].js",
      app: "[name].js",
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: "public/assets", to: "assets" }, 
     ],
    }),
    new HtmlWebpackPlugin({
      inject: true,
      template: resolveAppPath("public/index.html"),
      filename: "index.html",
    }),
  ],
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json", ".scss", ".css"],
    alias: {
      "../../theme.config$": path.join(__dirname, "semantic-ui/theme.config"),
      "images" :  path.join(__dirname, "public/assets/images"),
      "styles" :  path.join(__dirname, "public/assets/styles"),
      "scripts" :  path.join(__dirname, "public/assets/scripts"),
    },
  },
  performance: {
    hints: false, 
    maxEntrypointSize: 1024 * 1000, // 750 KiB
    maxAssetSize: 1024 * 1000, // 1000 KiB
  },
  externals: [
    {
      react: "React",
      "react-dom": "ReactDOM",
      "semantic-ui-react": "semanticUIReact",
    },
  ],
});
