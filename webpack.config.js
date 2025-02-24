const path = require('path');

module.exports = {
    entry: './static/app.ts', // Указываем TypeScript файл
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'static'), // Сборка в static/
    },
    mode: 'development', // Или 'production' для продакшена
    module: {
        rules: [
            {
                test: /\.ts$/, // Компиляция TS → JS
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/, // Обработка CSS
                use: ['style-loader', 'css-loader'],
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js'], // Чтобы можно было импортировать TS без расширения
    },
};
