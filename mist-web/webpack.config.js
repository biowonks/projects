'use strict'

// Core
const path = require('path')

// Vendor
const webpack = require('webpack'),
	autoprefixer = require('autoprefixer'),
	HtmlWebpackPlugin = require('html-webpack-plugin'),
	ExtractTextPlugin = require('extract-text-webpack-plugin')

// Constants
const kSrcDir = path.resolve(__dirname, 'src'),
	kDistDir = path.resolve(__dirname, 'dist')

// Other
const kEnvName = process.env.NODE_ENV || 'develop'

let config = {
	devtool: 'eval',
	entry: {
		main: path.join(kSrcDir, 'main.js'),
		vendor: [
			'react',
			'react-dom'
		]
	},
	output: {
		path: path.join(kDistDir, 'js'),
		filename: '[name].bundle.js'
	},
	module: {
		loaders: [
			{
				test: /\.pug$/,
				loader: 'pug'
			},
			{
				test: /\.jsx?$/,
				include: kSrcDir,
				loaders: [
					'react-hot',
					'babel'
				]
			},
			{
				test: /\.(jpe?g|png|gif|svg)$/i,
				loaders: [
					'file?hash=sha512&digest=hex&name=[hash].[ext]',
					'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
				]
			},
			{
				test: /\.(scss|sass)$/,
				loader: ExtractTextPlugin.extract('style', 'css!postcss!sass')
			}
		]
	},
	postcss: function() {
		return [
			autoprefixer({
				browsers: ['last 2 versions']
			})
		]
	},
	devServer: {
		contentBase: kDistDir,
		port: 9000
	},
	plugins: [
		new ExtractTextPlugin('main.css'),
		new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.bundle.js'),
		new webpack.HotModuleReplacementPlugin(),
		new HtmlWebpackPlugin({
			template: path.join(kSrcDir, 'index.pug'),
			filename: '../index.html', // Because this is relative to the output bundle path
			inject: 'body'
		})
	]
}

if (kEnvName === 'production') {
	config.devtool = 'cheap-module-source-map'

	config.plugins.push(new webpack.DefinePlugin({
		'process.env': {
			NODE_ENV: JSON.stringify('production')
		}
	}))
}

module.exports = config
