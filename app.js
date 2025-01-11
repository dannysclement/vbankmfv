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
        res.json({ message: "Data successfully purchased!", data: result });
    } catch (error) {
        res.status(500).json({ message: "Transaction Failed!", error });
    }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
