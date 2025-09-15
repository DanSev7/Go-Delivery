const categoryQueries = require('../queries/categoryQueries');

// Get all categories
const getAllCategories = async (req, res) => {
    try {
        console.log("Getting all categories");
        const categories = await categoryQueries.getCategories();
        res.status(200).json(categories);
    } catch (error) {
        console.log("Error when getting categories : ", error.message);
        res.status(500).json({ error: 'Error fetching categories' });
    }
};

// Create a new category
const createCategory = async (req, res) => {
    const { name, image } = req.body;
    console.log("Name : ", req.body);
    try {
        const category = await categoryQueries.addCategory(name, image);
        res.status(201).json({ message: 'Category created', category });
    } catch (error) {
        console.log("Error : ", error.message);
        res.status(500).json({ error: 'Error creating category' });
    }
};

// Update a category
const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, image } = req.body;
    try {
        const updatedCategory = await categoryQueries.updateCategory(id, name, image);
        res.status(200).json({ message: 'Category updated', updatedCategory });
    } catch (error) {
        res.status(500).json({ error: 'Error updating category' });
    }
};

// Delete a category
const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        await categoryQueries.deleteCategory(id);
        res.status(200).json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting category' });
    }
};

module.exports = {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
};
