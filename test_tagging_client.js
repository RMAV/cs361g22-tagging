// test_tagging_client.js — simple test client for the Tagging Microservice

import axios from "axios";

const BASE_URL = "http://localhost:5002";

async function run() {
  try {
    console.log("=== Applying Tags to Item ===");
    const applyResponse = await axios.post(`${BASE_URL}/tags/apply`, {
      userID: "u1",
      itemID: "item123",
      tags: ["Kitchen", "Fragile"],
    });
    console.log(JSON.stringify(applyResponse.data, null, 2));

    console.log("\n=== Listing Tags for Item ===");
    const tagsResponse = await axios.get(`${BASE_URL}/tags`, {
      params: { userID: "u1", itemID: "item123" },
    });
    console.log(JSON.stringify(tagsResponse.data, null, 2));

    console.log("\n=== Listing Items with Tag 'Kitchen' ===");
    const itemsResponse = await axios.get(`${BASE_URL}/tags/items`, {
      params: { userID: "u1", tag: "Kitchen" },
    });
    console.log(JSON.stringify(itemsResponse.data, null, 2));

    console.log("\n=== Removing Tag 'Fragile' from Item ===");
    const removeResponse = await axios.delete(`${BASE_URL}/tags/remove`, {
      data: { userID: "u1", itemID: "item123", tag: "Fragile" },
    });
    console.log(JSON.stringify(removeResponse.data, null, 2));
  } catch (err) {
    console.error("Error during test run:", err?.response?.data || err.message);
  }
}

run();
