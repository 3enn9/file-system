<?php
// Устанавливаем заголовки для работы с JSON
header('Content-Type: application/json; charset=utf-8');

// Получаем данные POST-запроса
$data = json_decode(file_get_contents("php://input"), true);

// Проверяем, пришли ли данные
if (isset($data['root']) && isset($data['size']) && isset($data['elapsedTime'])) {
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
        die(json_encode(["error" => "Ошибка подключения к базе данных: " . $conn->connect_error]));
    }

    // Подготавливаем запрос для добавления данных в базу
    $stmt = $conn->prepare("INSERT INTO data (root, size, elapsedTime, date) VALUES (?, ?, ?, NOW())");
    $stmt->bind_param("sss", $data['root'], $data['size'], $data['elapsedTime']);

    // Выполняем запрос
    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Запись успешно добавлена"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Ошибка при добавлении записи"]);
    }

    // Закрываем соединение
    $stmt->close();
    $conn->close();
} else {
    echo json_encode(["status" => "error", "message" => "Недостаточно данных для добавления записи"]);
}
?>
