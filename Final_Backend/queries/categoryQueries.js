const {query} = require('../config/db');

// Fetch all categories
const getCategories = async () => {
    const result = await query('SELECT * FROM Categories ORDER BY created_at DESC');
    // console.log("Result : ", result.rows);

    return result.rows;
};

// Add a new category
const addCategory = async (name, image) => {
    const result = await query(
        'INSERT INTO Categories (name, image) VALUES ($1, $2) RETURNING *',
        [name, image]
    );
    return result.rows[0];
};

// Update a category
const updateCategory = async (category_id, name, image) => {
    const result = await query(
        'UPDATE Categories SET name = $1, image = $2, updated_at = CURRENT_TIMESTAMP WHERE category_id = $3 RETURNING *',
        [name, image, category_id]
    );
    return result.rows[0];
};

// Delete a category
const deleteCategory = async (category_id) => {
    await query('DELETE FROM Categories WHERE category_id = $1', [category_id]);
};

module.exports = {
    getCategories,
    addCategory,
    updateCategory,
    deleteCategory
};
