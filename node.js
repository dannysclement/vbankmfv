const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./path/to/your/firebase-admin-sdk.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://vbankmfv.firebaseio.com'
});

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// API Endpoint for Purchase
app.post('/api/purchase', async (req, res) => {
    const { userUID, phoneNumber, dataType, dataPlan, amount } = req.body;

    try {
        // Get user balance from Firestore
        const userRef = admin.firestore().collection('balances').doc(userUID);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userBalance = userDoc.data().balance;

        // Check if user has enough balance
        if (userBalance < amount) {
            return res.status(400).json({ message: 'Insufficient balance. Please fund your wallet.' });
        }

        // Make API Call to ChineduTopUp
        const response = await axios.post('https://chinedutopup.com.ng/api/data/', {
            network: "1", // MTN
            phone: phoneNumber,
            ref: `REF${Date.now()}`,
            data_plan: amount,
            ported_number: false
        }, {
            headers: {
                'Token': 'bC6p3CABlEv70AkICCCtA7o3exCAyfcxmBBqGcB9h35AAgA1x981CaJ54Hs21725471118'
            }
        });

        // If API call is successful
        if (response.status === 200) {
            // Update balance in Firestore
            await userRef.update({ balance: admin.firestore.FieldValue.increment(-amount) });

            // Store purchase in Firestore
            const purchaseRef = admin.firestore().collection('purchases').doc();
            await purchaseRef.set({
                userUID,
                phoneNumber,
                dataPlan,
                amount,
                date: new Date().toISOString(),
                status: 'success'
            });

            return res.json({ message: 'Data purchase successful!' });
        } else {
            throw new Error('Data purchase failed.');
        }
    } catch (error) {
        console.error(error);
        // Refund balance in case of failure
        const userRef = admin.firestore().collection('balances').doc(userUID);
        await userRef.update({ balance: admin.firestore.FieldValue.increment(amount) });

        return res.status(500).json({ message: 'Failed to complete data purchase. Your balance will be refunded.' });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
