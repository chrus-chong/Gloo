import asyncHandler from "express-async-handler"
import Order from "../models/orderModel.js"

// @desc        Create new order
// @route       POST /api/orders
// @access      Private
const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    seller,
  } = req.body

  if (orderItems && orderItems.length === 0) {
    res.status(400)
    throw new error("No order items")
  } else {
    const order = new Order({
      orderItems,
      buyer: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      seller,
    })

    const createdOrder = await order.save()

    res.status(201).json(createdOrder)
  }
})

// @desc        Get order by ID
// @route       GET /api/orders/:id
// @access      Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("buyer", "name email")
    .populate("seller", "name")

  if (order) {
    res.json(order)
  } else {
    res.status(404)
    throw new Error("Order not found")
  }
})

// @desc        Update order to paid
// @route       PUT /api/orders/:id/pay
// @access      Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)

  if (order) {
    order.isPaid = true
    order.paidAt = Date.now()
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address,
    }

    const updatedOrder = await order.save()

    res.json(updatedOrder)
  } else {
    res.status(404)
    throw new Error("Order not found")
  }
})

// @desc        Get logged in user orders
// @route       GET /api/orders/myorders
// @access      Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ buyer: req.user._id })
  res.json(orders)
})

// @desc        Get logged in user orders (seller)
// @route       GET /api/orders/myorders
// @access      Private
// const getMySellerOrders = asyncHandler(async (req, res) => {
//   const orders = await Order.find({}).populate("user", "id name")

//   res.json(orders)
// })

// @desc        Get all orders
// @route       GET /api/orders
// @access      Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate("buyer", "id name")
    .populate("seller", "id name")
  res.json(orders)
})

// @desc        Update order to delievered
// @route       PUT /api/orders/:id/deliver
// @access      Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)

  if (order) {
    order.isDelivered = true
    order.deliveredAt = Date.now()

    const updatedOrder = await order.save()

    res.json(updatedOrder)
  } else {
    res.status(404)
    throw new Error("Order not found")
  }
})

// @desc        Delete an order
// @route       DELETE /api/orders/:id
// @access      Private/Admin
const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)

  if (order) {
    // if you want only the creator to delete, you should check
    // req.user._id == product.user._id
    await order.remove()
    res.json({ message: "Order removed" })
  } else {
    res.status(404)
    throw new Error("Order not found")
  }
})

export {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  getMyOrders,
  getOrders,
  updateOrderToDelivered,
  deleteOrder,
}
