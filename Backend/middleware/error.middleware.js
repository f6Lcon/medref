const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`)
  res.status(404)
  next(error)
}

const errorHandler = (err, req, res, next) => {
  console.error("Error middleware caught:", err)

  // Sometimes the status code is on the response, sometimes it's in the error
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode

  res.status(statusCode)
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
  })
}

export { notFound, errorHandler }
