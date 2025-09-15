// controllers/branchController.js
const {query} = require('../config/db'); // Your database connection

// Get all branches
const getBranches = async (req, res) => {
  try {
    const branches = await query('SELECT * FROM branches');
    res.json(branches.rows); // Send branches data
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

module.exports = { getBranches };