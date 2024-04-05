import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import MonacoEditorWebpackPlugin from 'monaco-editor-webpack-plugin';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
    entry: path.resolve(__dirname, "src", "index.tsx"),
    mode: 'development',
    target: 'web',
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "build"),
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.(tsx|ts)$/i,
                use: [ 'ts-loader' ],
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
                use: [ 'style-loader', 'css-loader' ],
            },
			{
				test: /\.(svg|.ttf)$/i,
				type: 'asset/resource',
			},
        ]
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "index.html",
        }),
        new MonacoEditorWebpackPlugin({}),
    ],
	devtool: 'inline-source-map',
    devServer: {
        static: path.resolve(__dirname, "build"),
    }
};