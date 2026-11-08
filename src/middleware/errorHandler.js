function notFound(req, res, next) {
  res.status(404).json({
    error: 'Route not found',
    message: `No route exists for ${req.method} ${req.originalUrl}`
  });
}

function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Invalid JSON',
      message: 'Request body must contain valid JSON.'
    });
  }

  return res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong on the server.'
  });
}

module.exports = { notFound, errorHandler };
