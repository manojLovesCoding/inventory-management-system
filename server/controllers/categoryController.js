import Category from "../models/Category.js";

const generateCategoryId = async () => {
  const lastCategory = await Category.findOne()
    .sort({ categoryId: -1 })
    .select("categoryId");

  if (!lastCategory) {
    return "CAT-001";
  }

  const lastNumber = Number(
    lastCategory.categoryId.replace("CAT-", "")
  );

  const nextNumber = lastNumber + 1;

  return `CAT-${String(nextNumber).padStart(3, "0")}`;
};

// GET ALL CATEGORIES
export const getCategories = async (req, res) => {
  try {
    const { search = "" } = req.query;

    const query = {};

    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");

      query.$or = [
        { categoryId: searchRegex },
        { name: searchRegex },
        { description: searchRegex },
      ];
    }

    const categories = await Category.find(query).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET SINGLE CATEGORY
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    console.error("Get category error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// CREATE CATEGORY
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const trimmedName = name.trim();

    // Check duplicate category name
    const existingCategory = await Category.findOne({
      name: {
        $regex: `^${trimmedName.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        )}$`,
        $options: "i",
      },
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "This category already exists",
      });
    }

    const categoryId = await generateCategoryId();

    const category = await Category.create({
      categoryId,
      name: trimmedName,
      description: description?.trim() || "",
      itemCount: 0,
      lowStock: 0,
    });

    res.status(201).json({
      success: true,
      message: "Category added successfully",
      category,
    });
  } catch (error) {
    console.error("Create category error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// UPDATE CATEGORY
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const trimmedName = name.trim();

    // Check duplicate name excluding current category
    const duplicateCategory = await Category.findOne({
      name: {
        $regex: `^${trimmedName.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        )}$`,
        $options: "i",
      },
      _id: {
        $ne: category._id,
      },
    });

    if (duplicateCategory) {
      return res.status(409).json({
        success: false,
        message: "This category already exists",
      });
    }

    category.name = trimmedName;
    category.description = description?.trim() || "";

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Update category error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// DELETE CATEGORY
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Same rule as your frontend
    if (category.itemCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete a category containing inventory items",
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};