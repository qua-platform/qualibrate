// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Dotenv = require("dotenv-webpack");

// eslint-disable-next-line @typescript-eslint/no-var-requires
const HtmlWebpackPlugin = require("html-webpack-plugin");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const CopyWebpackPlugin = require("copy-webpack-plugin");

// eslint-disable-next-line @typescript-eslint/no-var-requires
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const inProject = path.resolve.bind(path, __dirname);
const inProjectSrc = (file) => inProject("src", file);

const public_path = process.env.PUBLIC_PATH || "/";

const config = {
  mode: "development",
  devtool: "inline-source-map",
  entry: {
    main: [inProjectSrc("index")],
  },
  output: {
    path: inProject("dist"),
    publicPath: public_path,
    filename: "bundle.[fullhash].js",
  },
  resolve: {
    modules: [inProject("src"), "node_modules"],
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    fallback: { url: false, punycode: false },
  },
  devServer: {
    static: path.join("dist"),
    port: 1234,
    hot: true,
    historyApiFallback: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: inProject("public/index.html"),
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: inProject("public/assets"),
          to: inProject("dist/assets"),
        },
        {
          from: inProject("public/manifest.json"),
          to: inProject("dist/manifest.json"),
        },
      ],
    }),
    new MiniCssExtractPlugin(),
    new Dotenv({
      systemvars: true,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: path.resolve(__dirname, "node_modules/"),
        use: ["babel-loader"],
      },
      {
        test: /\.(png|svg)$/,
        use: ["file-loader"],
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.(sass|scss)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              url: false,
              modules: {
                localIdentName: "[name]__[local]__[hash:base64:5]",
              },
            },
          },
          {
            loader: "sass-loader",
          },
        ],
      },
      {
        test: /\.(css)$/,
        use: [
          "css-hot-loader",
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              url: false,
              modules: {
                localIdentName: "[local]",
              },
            },
          },
        ],
      },
      {
        test: /\.js$/,
        loader: "ify-loader",
      },
    ],
  },
};
config.resolve.alias = {
  ...config.resolve.alias,
  "react/jsx-dev-runtime": "react/jsx-dev-runtime",
  "react/jsx-runtime": "react/jsx-runtime",
};

module.exports = config;
