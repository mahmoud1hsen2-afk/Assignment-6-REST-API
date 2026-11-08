const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const tasksRouter = require('./routes/tasks');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(express.json({ limit: '20kb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Task Management REST API',
    documentation: 'See README.md for available routes and examples.'
  });
});

app.use('/tasks', tasksRouter);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
