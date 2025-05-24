const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const isDevelopment = !isProduction;

  return {
    entry: {
      popup: './src/popup/index.tsx',
      content: './src/content/index.ts',
      background: './src/background/index.ts',
      options: './src/options/index.tsx',
      ...(isDevelopment && { reload: './src/utils/reload.ts' })
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      clean: true
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  '@babel/preset-env',
                  '@babel/preset-react',
                  '@babel/preset-typescript'
                ],
                cacheDirectory: true
              }
            }
          ]
        },
        {
          test: /\.css$/,
          use: [
            isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
            'css-loader'
          ]
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development')
      }),
      new HtmlWebpackPlugin({
        template: './src/popup/popup.html',
        filename: 'popup.html',
        chunks: ['popup']
      }),
      new HtmlWebpackPlugin({
        template: './src/options/options.html',
        filename: 'options.html',
        chunks: ['options']
      }),
      new CopyWebpackPlugin({
        patterns: [
          { 
            from: './src/manifest.json', 
            to: 'manifest.json',
            transform: (content) => {
              const manifest = JSON.parse(content.toString());
              
              if (isDevelopment) {
                manifest.name = manifest.name + ' - Development';
                manifest.content_scripts = manifest.content_scripts || [];
                manifest.content_scripts.push({
                  matches: ["<all_urls>"],
                  js: ["reload.js"],
                  run_at: "document_start"
                });
              }
              
              return JSON.stringify(manifest, null, 2);
            }
          },
          { from: './src/icons', to: 'icons', noErrorOnMissing: true }
        ]
      }),
      ...(isProduction ? [new MiniCssExtractPlugin()] : [])
    ],
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@/types': path.resolve(__dirname, 'src/types'),
        '@/components': path.resolve(__dirname, 'src/popup/components'),
        '@/services': path.resolve(__dirname, 'src/services'),
        '@/utils': path.resolve(__dirname, 'src/utils'),
        '@/config': path.resolve(__dirname, 'src/config')
      }
    },
    devtool: isDevelopment ? 'cheap-module-source-map' : false,
    
    ...(isDevelopment && {
      optimization: {
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false
      },
      cache: {
        type: 'filesystem'
      }
    })
  };
};