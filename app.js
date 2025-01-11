const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = 3000;
const API_URL = "https://swiftdataapi.com.ng/api/data/";
const AUTH_TOKEN = "a1b26fe689c67dd7388307e6ae1141be0dfacc9c";

app.post('/api/purchase', async (req, res) => {
    const { phoneNumber, dataType, dataPlan, amount } = req.body;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                "Authorization": `Token ${AUTH_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                network: "MTN",
                mobile_number: phoneNumber,
                plan: dataPlan,
                Ported_number: true
            })
        });

        const result = await response.json();
        if (response.ok) {
            res.json({ message: "Data purchase successful!", data: result });
        } else {
            res.status(400).json({ message: result.message || "Failed to complete purchase." });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error. Please try again.", error });
    }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
