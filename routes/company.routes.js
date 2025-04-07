const express = require("express");
const router = express.Router();
const Organization = require("../models/organizations.model");
const { verifyToken, verifyTokenAuthorization, verifyTokenAdmin } = require("./verifyToken.route");

// CREATE Organization
router.post("/", async (req, res) => {
  const newOrganization = new Organization(req.body);
  try {
    const savedOrganization = await newOrganization.save();
    res.status(201).json(savedOrganization);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE Organization
router.put("/:id", async (req, res) => {
  try {
    const updatedOrganization = await Organization.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true } // return the updated document
    );
    res.status(200).json(updatedOrganization);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Organization
router.delete("/:id", async (req, res) => {
  try {
    await Organization.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Organization has been deleted." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Organization by ID
router.get("/:id", async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    res.status(200).json(organization);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET All Organizations
// In your organizations.routes.js (or company.routes.js)
router.get("/", async (req, res) => {
  console.log("hit en company");
  
    try {
      const organizations = await Organization.find();
      res.status(200).json(organizations);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  

module.exports = router;
