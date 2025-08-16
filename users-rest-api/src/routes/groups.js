const express = require('express');
const Group = require('../models/groups');
const router = express.Router();

// CREATE
router.post('/', async (req, res) => {
  try {
    const group = new Group(req.body);
    await group.save();
    res.status(201).json(group);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ all groups
router.get('/', async (req, res) => {
  const groups = await Group.find();
  res.json(groups);
});

// READ single group
router.get('/:id', async (req, res) => {
  try {
    const groups = await Group.findById(req.params.id);
    if (!groups) return res.status(404).json({ error: "Group not found" });
    res.json(groups);
  } catch (err) {
    res.status(400).json({ error: "Invalid group ID" });
  }
});

// UPDATE group
router.put('/:id', async (req, res) => {
  try {
    const groups = await Group.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!groups) return res.status(404).json({ error: "Group not found" });
    res.json(groups);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE group
router.delete('/:id', async (req, res) => {
  try {
    const group = await Group.findByIdAndDelete(req.params.id);
    if (!group) return res.status(404).json({ error: "Group not found" });
    res.json({ msg: "Deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: "Invalid group ID" });
  }
});

module.exports = router;
