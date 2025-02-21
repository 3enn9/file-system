// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',  // Добавляем режим разработки
    entry: './static/app.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'static'),
        },
        port: 3000,
        hot: true,
        proxy: [
            {
                context: ['/'], // Путь для проксирования
                target: 'http://localhost:9015', // Ваш API сервер
                secure: false, // Отключаем SSL, если сервер работает по HTTP
                changeOrigin: true, // Меняем origin для предотвращения ошибки CORS
            }
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './static/index.html',
        }),
    ],
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
};
