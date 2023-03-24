import { resolve, join } from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { VueLoaderPlugin } from 'vue-loader'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import FriendlyErrorsWebpackPlugin from '@soda/friendly-errors-webpack-plugin'
import AutoImport from 'unplugin-auto-import/webpack'
import Components from 'unplugin-vue-components/webpack'
import { VantResolver } from 'unplugin-vue-components/resolvers'
import WebpackMkcert from 'webpack-mkcert'
import * as dotenv from 'dotenv'
import webpack from 'webpack'

const { DefinePlugin } = webpack

const root = process.cwd()

const isProd = process.env.NODE_ENV === 'production'

// configuration common environment variables
dotenv.config()

// configuration environment variables for different environments
if (isProd) {
  dotenv.config({ path: resolve(root, '.env.production'), override: true })
} else {
  dotenv.config({ path: resolve(root, '.env.development'), override: true })
}

export default async () => {
  const commonConfig = {
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
          test: /\.(sa|sc|c)ss$/,
          use: [
            isProd ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'postcss-loader',
            'sass-loader'
          ]
        },
        {
          test: /\.(jpe?g|png|gif|svg)$/i,
          type: 'asset',
          generator: {
            // [ext] contain .
            filename: 'images/[contenthash][ext]',
            publicPath: process.env.NODE_ENV === 'production' ? process.env.CDN_URL : ''
          },
          parser: {
            dataUrlCondition: {
              maxSize: 10 * 1024 // less than 10kB will transform to base64
            }
          }
        },
        {
          test: /\.(woff2?|eot|ttf|otf)$/i,
          type: 'asset',
          generator: {
            filename: 'font/[contenthash][ext]'
          },
          parser: {
            dataUrlCondition: {
              maxSize: 10 * 1024
            }
          }
        },
        {
          test: /\.(mp4|ogg|mp3|wav)$/,
          type: 'asset',
          generator: {
            filename: 'media/[contenthash][ext]'
          },
          parser: {
            dataUrlCondition: {
              maxSize: 10 * 1024
            }
          }
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: resolve(root, 'public/index.html'),
        filename: 'index.html',
        title: process.env.PROJECT_NAME,
        minify: {
          collapseWhitespace: true,
          removeComments: true
        }
      }),
      new VueLoaderPlugin(),
      Components({
        resolvers: [VantResolver()]
      }),
      AutoImport({
        imports: [
          'vue',
          'vue-router',
          {
            'pinia': ['createPinia', 'defineStore']
          }
        ],
        eslintrc: {
          enabled: true,
          filepath: './.eslintrc-auto-import.json',
          globalsPropValue: true
        }
      }),
      new FriendlyErrorsWebpackPlugin()
    ]
  }


  const plugins = [
    new DefinePlugin({
      __VUE_OPTIONS_API__: JSON.stringify(true),
      __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
      'process.env': JSON.stringify({
        NODE_ENV: 'development'
      })
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
      chunkFilename: 'css/[id].css'
    })
  ].concat(commonConfig.plugins)

  let proxy = {}

  // if (process.env.PROXY !== '{}') {
  //   const proxyObject = JSON.parse(process.env.PROXY)
  //   proxy = Object.keys(proxyObject).reduce((acc, item) => {
  //     acc[item] = {
  //       target: proxyObject[item],
  //       pathRewrite: {
  //         [`^${item}`]: ''
  //       }
  //     }

  //     return acc
  //   }, {})
  // }

  const devServer = {
    port: process.env.PORT || 5173,
    // compress: true,
    static: {
      directory: join(root, 'public')
    },
    proxy
  }


  const https = await WebpackMkcert({
    source: 'coding',
    hosts: ['localhost', '127.0.0.1']
  })

  devServer.server = {
    type: 'https',
    options: {
      ...https
    }
  }

  return {
    ...commonConfig,
    devtool: 'eval-source-map',
    output: {
      path: resolve(root, 'dist'),
      filename: 'js/[name].[fullhash:8].js',
      clean: true
    },
    plugins,
    devServer
  }
}
