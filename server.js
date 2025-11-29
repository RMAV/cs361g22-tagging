// server.js — Tagging Microservice (ES Modules)

import express from "express";

const app = express();
app.use(express.json());

// In-memory store: each entry is { userID, itemID, tag }
let tagAssignments = [];

// Helper: get tags for a specific user+item
function getTagsForItem(userID, itemID) {
  return tagAssignments
    .filter((t) => t.userID === userID && t.itemID === itemID)
    .map((t) => t.tag);
}

// Helper: add tags (no duplicates)
function addTags(userID, itemID, tags) {
  tags.forEach((tag) => {
    const exists = tagAssignments.some(
      (t) => t.userID === userID && t.itemID === itemID && t.tag === tag
    );
    if (!exists) {
      tagAssignments.push({ userID, itemID, tag });
    }
  });
}

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Tagging Microservice is running",
  });
});

// POST /tags/apply
app.post("/tags/apply", (req, res) => {
  const { userID, itemID, tags } = req.body || {};

  if (!userID || !itemID || !Array.isArray(tags) || tags.length === 0) {
    return res.status(400).json({
      status: "error",
      message: "Missing userID, itemID, or tags",
    });
  }

  addTags(userID, itemID, tags);

  const currentTags = getTagsForItem(userID, itemID);

  return res.status(201).json({
    status: "success",
    message: "Tags applied to item",
    data: { userID, itemID, tags: currentTags },
  });
});

// GET /tags?userID=...&itemID=...
app.get("/tags", (req, res) => {
  const { userID, itemID } = req.query || {};

  if (!userID || !itemID) {
    return res.status(400).json({
      status: "error",
      message: "Missing userID or itemID",
    });
  }

  const tags = getTagsForItem(userID, itemID);

  return res.status(200).json({
    status: "success",
    data: { userID, itemID, tags },
  });
});

// GET /tags/items?userID=...&tag=...
app.get("/tags/items", (req, res) => {
  const { userID, tag } = req.query || {};

  if (!userID || !tag) {
    return res.status(400).json({
      status: "error",
      message: "Missing userID or tag",
    });
  }

  const itemIDs = tagAssignments
    .filter((t) => t.userID === userID && t.tag === tag)
    .map((t) => t.itemID);

  return res.status(200).json({
    status: "success",
    data: { userID, tag, itemIDs },
  });
});

// DELETE /tags/remove
app.delete("/tags/remove", (req, res) => {
  const { userID, itemID, tag } = req.body || {};

  if (!userID || !itemID || !tag) {
    return res.status(400).json({
      status: "error",
      message: "Missing userID, itemID, or tag",
    });
  }

  const before = tagAssignments.length;
  tagAssignments = tagAssignments.filter(
    (t) => !(t.userID === userID && t.itemID === itemID && t.tag === tag)
  );
  const after = tagAssignments.length;

  const currentTags = getTagsForItem(userID, itemID);

  const message =
    before === after
      ? "Tag not found on item; no changes made"
      : "Tag removed from item";

  return res.status(200).json({
    status: "success",
    message,
    data: { userID, itemID, tags: currentTags },
  });
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Tagging Microservice running on http://localhost:${PORT}`);
});
