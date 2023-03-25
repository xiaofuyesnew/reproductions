import { resolve, join } from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { VueLoaderPlugin } from 'vue-loader'
import AutoImport from 'unplugin-auto-import/webpack'

const root = process.cwd()

export default {
  plugins: [
    new HtmlWebpackPlugin({
      template: resolve(root, 'public/index.html'),
      filename: 'index.html',
      title: 'auto import issue',
    }),
    new VueLoaderPlugin(),
    AutoImport({
      imports: [
        'vue',
        'vue-router'
      ],
      eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json',
        globalsPropValue: true
      }
    })
  ],
  mode: 'development',
  entry: resolve(root, 'src/main.js'),
  resolve: {
    extensions: ['.js', '.vue', '.json', '.mjs'],
    alias: {
      '@': resolve(root, './src')
    }
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.vue$/,
        use: [
          'vue-loader'
        ]
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      }
    ]
  },
  devtool: 'eval-source-map',
  output: {
    path: resolve(root, 'dist'),
    filename: 'js/[name].[fullhash:8].js',
    clean: true
  },
  devServer: {
    port: process.env.PORT || 5173,
    static: {
      directory: join(root, 'public')
    }
  }
}
