'use strict'

// Core
const path = require('path')

// Vendor
const webpack = require('webpack'),
	HtmlWebpackPlugin = require('html-webpack-plugin')

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
			}
		]
	},
	devServer: {
		contentBase: kDistDir,
		port: 9000
	},
	plugins: [
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
