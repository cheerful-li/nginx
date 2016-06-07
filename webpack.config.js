module.exports = {
	entry: {
		'./blog/public/pages/createBlog/createBlog':'./blog/public/pages/createBlog/createBlog.js'
	},
	output: {
		path: __dirname,
		filename: '[name].bundle.js'
	},
	module: {
		loaders: [
			{
				test: /\.js$/,
				exclude: /(node_modules|bower_components)/,
				loader: 'babel',
				query: {
					presets: ['es2015']
				}
			},
			{
				test:/\.scss$/,
				loader:'style!css!sass'
			},
			{
				test:/\.less$/,
				loader:'style!css!less'
			},{
				test:/\.css$/,
				loader:'style-loader!css-loader'
			},
			{
		          test: /\.(png|jpe?g|eot|svg|ttf|woff2?)$/,
		          loader: "file?name=./public/images/[hash][name].[ext]"
		    }
		]
	}

};
