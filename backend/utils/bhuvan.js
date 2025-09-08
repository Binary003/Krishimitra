// utils/bhuvan.js
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

async function getBhuvanToken() {
  const username = process.env.BHUVAN_USERNAME;
  const password = process.env.BHUVAN_PASSWORD;

  try {
    const res = await fetch("https://bhuvan.nrsc.gov.in/bhuvan_services/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!data.access_token) throw new Error("Token not received");
    return data.access_token;
  } catch (err) {
    console.error("Error fetching Bhuvan token:", err.message);
    return null;
  }
}

module.exports = { getBhuvanToken };
