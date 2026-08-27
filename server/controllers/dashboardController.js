import InventoryItem from "../models/InventoryItem.js";
import StockTransaction from "../models/StockTransaction.js";

export const getDashboard = async (req, res) => {
  try {
    // ============================================
    // BASIC INVENTORY STATISTICS
    // ============================================

    const totalItems = await InventoryItem.countDocuments({
      status: "active",
    });

    const stockStats = await InventoryItem.aggregate([
      {
        $match: {
          status: "active",
        },
      },
      {
        $group: {
          _id: null,
          totalStock: {
            $sum: "$quantity",
          },
          lowStock: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ["$quantity", 0] },
                    {
                      $lte: [
                        "$quantity",
                        "$minimumStock",
                      ],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
          outOfStock: {
            $sum: {
              $cond: [
                {
                  $eq: ["$quantity", 0],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const statistics = stockStats[0] || {
      totalStock: 0,
      lowStock: 0,
      outOfStock: 0,
    };

    // ============================================
    // STOCK OVERVIEW
    // ============================================

    const stockOverview = await InventoryItem.aggregate([
      {
        $match: {
          status: "active",
        },
      },
      {
        $group: {
          _id: "$category",
          totalItems: {
            $sum: 1,
          },
          totalStock: {
            $sum: "$quantity",
          },
        },
      },
      {
        $sort: {
          totalStock: -1,
        },
      },
    ]);

    // ============================================
    // RECENT TRANSACTIONS
    // ============================================

    const recentTransactions =
      await StockTransaction.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate(
          "performedBy",
          "name email role"
        )
        .lean();

    // ============================================
    // LOW STOCK ITEMS
    // ============================================

    const lowStockItems = await InventoryItem.find({
      status: "active",
      quantity: {
        $gt: 0,
      },
      $expr: {
        $lte: ["$quantity", "$minimumStock"],
      },
    })
      .sort({
        quantity: 1,
      })
      .limit(10)
      .select(
        "name sku category quantity minimumStock unit"
      )
      .lean();

    // ============================================
    // RESPONSE
    // ============================================

    return res.status(200).json({
      success: true,

      data: {
        statistics: {
          totalItems,
          totalStock: statistics.totalStock || 0,
          lowStock: statistics.lowStock || 0,
          outOfStock: statistics.outOfStock || 0,
        },

        stockOverview,

        recentTransactions,

        lowStockItems,
      },
    });
  } catch (error) {
    console.error(
      "Dashboard controller error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard data",
    });
  }
};
