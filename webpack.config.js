/* eslint-disable*/
var path = require('path')
var webpack = require('webpack')
var isProduction = function () {
  return process.env.NODE_ENV === 'production';
};

var plugins = [];
//"webpack-dev-server/client?http://localhost:8080/",
if(isProduction()){
  plugins.push(
      new webpack.optimize.UglifyJsPlugin({
        compress:{
          warnings: false
        }
      })
  )
}else{
  plugins.push(
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin()
  )
}
var publicPath = isProduction()?'/VRPuzzle/public/':'/public/'
module.exports = {
	devtool: 'inline-source-map',
	entry:{
		VRPuzzle: __dirname+'/src/javascripts/index.js',
	},
	output:{
		path:__dirname+'/public',
		publicPath: '/public/',
		filename:"[name].bundle.js"
	},
	module:{
		loaders: [
		  {
			test: /\.jsx?$/,
			loader  : ['babel'],
			include: path.join(__dirname,'src'),
			exclude: path.join(__dirname,'node_modules'),
			query: {
	          presets: ['es2015','es2017']
	        }
		  },
		  {
			test: /\.s?css$/,
			loader: 'style!css!sass'
		  },
		  {
			test:/\.(png|jpg|bmp)$/,
			loader: 'url?limit=5000&name=images/puzzles/[name].[ext]'
		  }
		]
	},
	plugins: plugins,
	externals:{
        // 'babel-polyfill': 'true',
        // 'react': 'React',
        // 'react-dom': 'ReactDOM',
		// 'antd':'antd'
    }
}
