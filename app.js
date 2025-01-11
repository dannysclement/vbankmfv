import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyA1dzpeYvPixn7y3yPx-h6M031QLXJFXBc",
    authDomain: "vbankmfv.firebaseapp.com",
    projectId: "vbankmfv",
    storageBucket: "vbankmfv.firebasestorage.app",
    messagingSenderId: "920021461554",
    appId: "1:920021461554:web:93e1f0ed565c78a04c2a2b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let currentUserUID = null;
let currentUserBalance = 0;

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUserUID = user.uid;
        const userRef = doc(db, "balances", currentUserUID);
        getDoc(userRef).then((doc) => {
            if (doc.exists()) {
                currentUserBalance = doc.data().balance;
                document.getElementById("userBalance").textContent = currentUserBalance;
            } else {
                alert("Balance not found for this user.");
            }
        });
    } else {
        alert("User not logged in. Please log in first.");
    }
});

const plans = {
    sme: { "500MB - SME (₦200)": 200, "1GB - SME (₦280)": 280 },
    gifting: { "500MB - Gifting (₦250)": 250, "1GB - Gifting (₦300)": 300 },
    corporate: { "500MB - Corporate (₦220)": 220, "1GB - Corporate (₦310)": 310 }
};

window.updatePlans = () => {
    const dataType = document.getElementById("dataType").value;
    const dataPlanSelect = document.getElementById("dataPlan");
    dataPlanSelect.innerHTML = "<option value=''>-- Select a Data Plan --</option>";
    for (const plan in plans[dataType]) {
        dataPlanSelect.innerHTML += `<option value="${plan}">${plan}</option>`;
    }
    updateAmount();
};

window.updateAmount = () => {
    const dataType = document.getElementById("dataType").value;
    const dataPlan = document.getElementById("dataPlan").value;
    document.getElementById("amountDisplay").textContent = plans[dataType][dataPlan] || 0;
};

window.submitPurchase = async () => {
    const phoneNumber = document.getElementById("phoneNumber").value;
    const dataType = document.getElementById("dataType").value;
    const dataPlan = document.getElementById("dataPlan").value;
    const amount = plans[dataType][dataPlan];

    if (!phoneNumber || !dataType || !dataPlan) {
        alert("Please fill all fields correctly.");
        return;
    }

    try {
        const response = await fetch("/api/purchase", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userUID: currentUserUID,
                phoneNumber,
                dataType,
                dataPlan,
                amount
            })
        });

        const result = await response.json();
        alert(result.message);
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
    }
};
