const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const cors = require('cors');
const { initializeApp, credential } = require('firebase-admin');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Firebase Admin Setup
initializeApp({
    credential: credential.applicationDefault()
});

const db = getFirestore();
const PORT = process.env.PORT || 3000;
const API_URL = "https://swiftdataapi.com.ng/api/data/";
const AUTH_TOKEN = "a1b26fe689c67dd7388307e6ae1141be0dfacc9c"; // Your authorization token

// Handle Data Purchase API Request
app.post('/api/purchase', async (req, res) => {
    const { userUID, phoneNumber, dataType, dataPlan, amount } = req.body;

    if (!userUID || !phoneNumber || !dataType || !dataPlan || !amount) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        // Fetch user's balance from Firestore
        const userRef = db.collection('balances').doc(userUID);
        const doc = await userRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: "User not found in Firestore." });
        }

        const userBalance = doc.data().balance;
        if (userBalance < amount) {
            return res.status(400).json({ message: "Insufficient balance." });
        }

        // Make Data Purchase Request to SwiftData API
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

        const data = await response.json();

        if (response.ok) {
            // Deduct amount from user's balance and update Firestore
            await userRef.update({ balance: userBalance - amount });
            return res.status(200).json({ message: "Data purchase successful!", data });
        } else {
            return res.status(400).json({ message: data.message || "Failed to complete purchase." });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error, please try again.", error });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
