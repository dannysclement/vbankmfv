<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// API Endpoint and Authorization Token
$API_URL = "https://swiftdataapi.com.ng/api/data/";
$AUTH_TOKEN = "a1b26fe689c67dd7388307e6ae1141be0dfacc9c";

// Fetching data from frontend request
$data = json_decode(file_get_contents("php://input"));

if (!isset($data->phoneNumber) || !isset($data->dataType) || !isset($data->dataPlan)) {
    echo json_encode(["message" => "Invalid request. Please fill all fields."]);
    exit();
}

// Assigning variables
$phoneNumber = $data->phoneNumber;
$dataType = $data->dataType;
$dataPlan = $data->dataPlan;
$amount = $data->amount;

// Preparing API payload for data purchase
$payload = json_encode([
    "network" => "MTN",
    "mobile_number" => $phoneNumber,
    "plan" => $dataPlan,
    "Ported_number" => true
]);

// Calling the VTU API with cURL
$ch = curl_init($API_URL);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Token $AUTH_TOKEN",
    "Content-Type: application/json"
]);

$response = curl_exec($ch);
$responseData = json_decode($response, true);
curl_close($ch);

// Check if the transaction was successful
if (isset($responseData['status']) && $responseData['status'] === 'success') {
    echo json_encode(["message" => "Transaction successful! Data has been sent to $phoneNumber"]);
} else {
    echo json_encode(["message" => "Transaction failed. Please try again."]);
}
?>
