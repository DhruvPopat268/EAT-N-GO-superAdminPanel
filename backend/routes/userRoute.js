const express = require("express");
const User = require("../usersModels/usersModel");
const Order = require("../usersModels/Order");
const mongoose = require("mongoose");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      filter,
      sortBy = "createdAt",
      sortOrder = "desc",
      startDate,
      endDate
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build search query
    let searchQuery = {};
    if (search) {
      searchQuery = {
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } }
        ]
      };
    }

    // Build filter query
    let filterQuery = {};
    
    // Date range filter
    if (startDate || endDate) {
      filterQuery.createdAt = {};
      if (startDate) {
        filterQuery.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filterQuery.createdAt.$lte = new Date(endDate);
      }
    }

    const matchQuery = { ...searchQuery, ...filterQuery };

    // Aggregation pipeline
    const pipeline = [
      { $match: matchQuery },
      {
        $lookup: {
          from: "orders",
          localField: "orders",
          foreignField: "_id",
          as: "orderDetails"
        }
      },
      {
        $addFields: {
          totalOrderCount: { $size: "$orderDetails" },
          totalOrderAmount: {
            $sum: "$orderDetails.totalAmount"
          },
          currency: {
            $arrayElemAt: ["$orderDetails.currency", -1]
          }
        }
      },
      {
        $project: {
          fullName: 1,
          phone: 1,
          totalOrderCount: 1,
          totalOrderAmount: 1,
          createdAt: 1,
          status: 1,
          currency: 1
        }
      }
    ];

    // Add sorting based on filter
    let sortStage = {};
    if (filter === "orderCount") {
      sortStage = { totalOrderCount: sortOrder === "asc" ? 1 : -1 };
    } else if (filter === "orderAmount") {
      sortStage = { totalOrderAmount: -1 }; // Always descending for orderAmount
    } else {
      sortStage = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
    }

    pipeline.push({ $sort: sortStage });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limitNum });

    const users = await User.aggregate(pipeline);
    const totalUsers = await User.countDocuments(matchQuery);

    res.json({
      success: true,
      data: users,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalUsers / limitNum),
        totalUsers,
        hasNext: pageNum < Math.ceil(totalUsers / limitNum),
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message
    });
  }
});

// Get single user by ID
router.get("/:id", async (req, res) => {
  try {
    const {
      orderPage = 1,
      orderLimit = 10
    } = req.query;

    const orderPageNum = parseInt(orderPage);
    const orderLimitNum = parseInt(orderLimit);
    const orderSkip = (orderPageNum - 1) * orderLimitNum;

    const pipeline = [
      { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
      {
        $lookup: {
          from: "orders",
          localField: "orders",
          foreignField: "_id",
          as: "orderDetails"
        }
      },
      {
        $addFields: {
          totalOrders: { $size: "$orderDetails" },
          totalOrdersAmount: { $sum: "$orderDetails.totalAmount" },
          avgOrderAmount: {
            $cond: {
              if: { $gt: [{ $size: "$orderDetails" }, 0] },
              then: { $divide: [{ $sum: "$orderDetails.totalAmount" }, { $size: "$orderDetails" }] },
              else: 0
            }
          },
          totalCompletedOrders: {
            $size: {
              $filter: {
                input: "$orderDetails",
                cond: { $eq: ["$$this.status", "completed"] }
              }
            }
          },
          currency: {
            $arrayElemAt: ["$orderDetails.currency", -1]
          },
          orders: {
            $map: {
              input: {
                $slice: [
                  {
                    $sortArray: {
                      input: "$orderDetails",
                      sortBy: { createdAt: -1 }
                    }
                  },
                  orderSkip,
                  orderLimitNum
                ]
              },
              as: "order",
              in: {
                _id: "$$order._id",
                orderNo: "$$order.orderNo",
                status: "$$order.status",
                orderAmount: "$$order.totalAmount",
                restaurantId: "$$order.restaurantId",
                createdAt: "$$order.createdAt"
              }
            }
          }
        }
      },
      {
        $project: {
          fullName: 1,
          phone: 1,
          email: 1,
          status: 1,
          totalOrders: 1,
          totalOrdersAmount: 1,
          avgOrderAmount: 1,
          totalCompletedOrders: 1,
          currency: 1,
          orders: 1
        }
      }
    ];

    const result = await User.aggregate(pipeline);
    const user = result[0];
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    res.json({
      success: true,
      data: {
        ...user,
        orderPagination: {
          currentPage: orderPageNum,
          totalPages: Math.ceil(user.totalOrders / orderLimitNum),
          totalOrders: user.totalOrders,
          hasNext: orderPageNum < Math.ceil(user.totalOrders / orderLimitNum),
          hasPrev: orderPageNum > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: error.message
    });
  }
});

// Update user status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select("-password");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    res.json({
      success: true,
      message: "User status updated successfully",
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating user status",
      error: error.message
    });
  }
});

module.exports = router;