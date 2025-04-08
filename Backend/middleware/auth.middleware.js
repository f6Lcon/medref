import jwt from "jsonwebtoken"
import { promisify } from "util"
import User from "../models/user.model.js"
import { catchAsync } from "../utils/catchAsync.js"
import { AppError } from "../utils/appError.js"

export const authMiddleware = catchAsync(async (req, res, next) => {
  // 1) Get token from header
  let token
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]
  }

  if (!token) {
    return next(new AppError("You are not logged in. Please log in to get access.", 401))
  }

  // 2) Verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id)
  if (!currentUser) {
    return next(new AppError("The user belonging to this token no longer exists.", 401))
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter && currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError("User recently changed password. Please log in again.", 401))
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser
  next()
})
