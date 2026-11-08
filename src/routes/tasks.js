const express = require('express');
const db = require('../database');

const router = express.Router();

function toTask(row) {
  if (!row) return null;
  return { ...row, completed: Boolean(row.completed) };
}

function parseId(value) {
  if (!/^[1-9]\d*$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

function validateTask(body) {
  const errors = [];

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return ['Request body must be a JSON object.'];
  }

  if (typeof body.title !== 'string' || body.title.trim().length === 0) {
    errors.push('title is required and must be a non-empty string.');
  } else if (body.title.trim().length > 120) {
    errors.push('title must be 120 characters or fewer.');
  }

  if (body.description !== undefined && typeof body.description !== 'string') {
    errors.push('description must be a string.');
  } else if (typeof body.description === 'string' && body.description.length > 1000) {
    errors.push('description must be 1000 characters or fewer.');
  }

  if (body.completed !== undefined && typeof body.completed !== 'boolean') {
    errors.push('completed must be true or false.');
  }

  return errors;
}

// GET /tasks - list all tasks
router.get('/', (req, res, next) => {
  try {
    const rows = db.prepare('SELECT * FROM tasks ORDER BY id DESC').all();
    res.status(200).json({ data: rows.map(toTask), count: rows.length });
  } catch (error) {
    next(error);
  }
});

// GET /tasks/:id - get one task
router.get('/:id', (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'Invalid task ID', message: 'ID must be a positive integer.' });
    }

    const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!row) {
      return res.status(404).json({ error: 'Task not found', message: `No task exists with ID ${id}.` });
    }

    res.status(200).json({ data: toTask(row) });
  } catch (error) {
    next(error);
  }
});

// POST /tasks - create a task
router.post('/', (req, res, next) => {
  try {
    const errors = validateTask(req.body);
    if (errors.length) {
      return res.status(400).json({ error: 'Validation failed', messages: errors });
    }

    const result = db.prepare(`
      INSERT INTO tasks (title, description, completed)
      VALUES (?, ?, ?)
    `).run(
      req.body.title.trim(),
      (req.body.description || '').trim(),
      req.body.completed ? 1 : 0
    );

    const task = toTask(db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid));
    res.location(`/tasks/${task.id}`).status(201).json({ message: 'Task created successfully.', data: task });
  } catch (error) {
    next(error);
  }
});

// PUT /tasks/:id - replace the editable fields of a task
router.put('/:id', (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'Invalid task ID', message: 'ID must be a positive integer.' });
    }

    const errors = validateTask(req.body);
    if (errors.length) {
      return res.status(400).json({ error: 'Validation failed', messages: errors });
    }

    const existing = db.prepare('SELECT id FROM tasks WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Task not found', message: `No task exists with ID ${id}.` });
    }

    db.prepare(`
      UPDATE tasks
      SET title = ?, description = ?, completed = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      req.body.title.trim(),
      (req.body.description || '').trim(),
      req.body.completed ? 1 : 0,
      id
    );

    const task = toTask(db.prepare('SELECT * FROM tasks WHERE id = ?').get(id));
    res.status(200).json({ message: 'Task updated successfully.', data: task });
  } catch (error) {
    next(error);
  }
});

// DELETE /tasks/:id - delete a task
router.delete('/:id', (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'Invalid task ID', message: 'ID must be a positive integer.' });
    }

    const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Task not found', message: `No task exists with ID ${id}.` });
    }

    res.status(200).json({ message: `Task ${id} deleted successfully.` });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
