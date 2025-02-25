<?php
// Устанавливаем заголовки для работы с JSON
header('Content-Type: text/html; charset=utf-8');

// Загружаем конфигурацию
$config = require 'config.php';

// Подключение к базе данных
$servername = $config['DB_HOST'];
$username = $config['DB_USERNAME'];
$password = $config['DB_PASSWORD'];
$dbname = $config['DB_NAME'];

$conn = new mysqli($servername, $username, $password, $dbname);

// Проверка подключения
if ($conn->connect_error) {
    die("Ошибка подключения к базе данных: " . $conn->connect_error);
}

// Выполняем запрос для получения всех данных
$sql = "SELECT root, size, elapsedTime, date FROM data ORDER BY date DESC";  // Сортировка по дате, от новых к старым
$result = $conn->query($sql);

// Массив для хранения данных
$dates = [];
$sizes = [];
$elapsedTimes = [];
$roots = [];

// Проверяем, есть ли записи
if ($result->num_rows > 0) {
    // Собираем данные для графика
    while ($row = $result->fetch_assoc()) {
        $dates[] = $row['date'];
        $sizes[] = $row['size'];
        $elapsedTimes[] = $row['elapsedTime'];
        $roots[] = $row['root'];
    }
} else {
    echo "Нет данных для отображения";
    exit;
}

// Закрываем соединение
$conn->close();
?>

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Статистика</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        canvas {
            width: 100%;
            max-width: 900px;
            margin: 20px auto;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            padding: 10px;
            text-align: left;
            border: 1px solid #ddd;
        }
        th {
            background-color: #f4f4f4;
        }
        .back-button {
            display: inline-block;
            margin: 20px 0;
            padding: 10px 20px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
        }
        .back-button:hover {
            back
    </style>
</head>
<body>

<h1>Статистика</h1>

<!-- Кнопка "Назад" -->
<a href="javascript:history.back()" class="back-button">Назад</a>

<!-- График -->
<canvas id="myChart"></canvas>

<!-- Таблица с данными -->
<table>
    <thead>
        <tr>
            <th>Дата</th>
            <th>Root</th>
            <th>Размер (Bytes)</th>
            <th>Время (сек.)</th>
        </tr>
    </thead>
    <tbody>
        <?php
        // Выводим таблицу с данными
        foreach ($dates as $index => $date) {
            echo "<tr>";
            echo "<td>" . $date . "</td>";
            echo "<td>" . $roots[$index] . "</td>";
            echo "<td>" . $sizes[$index] . "</td>";
            echo "<td>" . $elapsedTimes[$index] . "</td>";
            echo "</tr>";
        }
        ?>
    </tbody>
</table>

<script>
// Данные из PHP, которые мы передаем в JavaScript
const dates = <?php echo json_encode($dates); ?>;
const sizes = <?php echo json_encode($sizes); ?>;
const elapsedTimes = <?php echo json_encode($elapsedTimes); ?>;

// Создаем график с помощью Chart.js
const ctx = document.getElementById('myChart').getContext('2d');
const myChart = new Chart(ctx, {
    type: 'line', // Тип графика: линейный
    data: {
        labels: sizes, // Размеры по оси X
        datasets: [{
            label: 'Время (сек.)', // Название для первого графика
            data: elapsedTimes, // Данные по времени
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: true, // Заполнение области под графиком
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: function(tooltipItem) {
                        return tooltipItem.raw + ' сек.'; // Форматирование данных в тултипах
                    }
                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Размер (Bytes)'  // Размер по оси X
                },
                ticks: {
                    callback: function(value, index, values) {
                        return value.toExponential(1); // Форматируем вывод значений на оси X
                    }
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Время (сек.)'
                },
            }
        }
    }
});
</script>

</body>
</html>
