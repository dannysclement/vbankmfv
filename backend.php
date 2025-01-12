<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// API Setup (No delay, real-time)
$API_URL = "https://swiftdataapi.com.ng/api/data/";
$AUTH_TOKEN = "a1b26fe689c67dd7388307e6ae1141be0dfacc9c";

// Fast Input Handling
$data = json_decode(file_get_contents("php://input"), true);
if (!$data || !isset($data['phoneNumber'])) {
    echo json_encode(["message" => "Invalid data provided!"]);
    exit;
}

$phoneNumber = trim($data['phoneNumber']);
$dataType = trim($data['dataType']);
$dataPlan = trim($data['dataPlan']);
$amount = intval($data['amount']);

// Fast Data Validation
if (strlen($phoneNumber) !== 11) {
    echo json_encode(["message" => "Invalid phone number!"]);
    exit;
}

// Send Request to SwiftData API (Fast)
$payload = json_encode([
    "network" => "MTN",
    "mobile_number" => $phoneNumber,
    "plan" => $dataPlan
]);

$ch = curl_init($API_URL);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Token $AUTH_TOKEN",
    "Content-Type: application/json"
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Fast Response Handling
if ($httpCode === 200) {
    echo json_encode(["message" => "Data purchase successful!"]);
} else {
    echo json_encode(["message" => "Transaction failed. Please try again."]);
}
?>
