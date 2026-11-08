# Assignment 6 – Task Management REST API

## 1. Project overview

This project is a RESTful API built with **Node.js**, **Express**, and a persistent **SQLite** database using Node.js's built-in `node:sqlite` module. It manages tasks and demonstrates all five required CRUD operations: create, read all, read one, update, and delete.

A task contains:
- `id`: automatically generated positive integer
- `title`: required string (maximum 120 characters)
- `description`: optional string (maximum 1000 characters)
- `completed`: boolean
- `created_at`: creation timestamp
- `updated_at`: last-update timestamp

## 2. Requirements

- Node.js 22.13 or later (recommended: Node.js 24 LTS)
- npm

## 3. Installation and setup

1. Extract the ZIP file and open a terminal in the project folder.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create your environment file by copying `.env.example` to `.env`.

   Windows PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

   macOS/Linux:

   ```bash
   cp .env.example .env
   ```

4. Start the server:

   ```bash
   npm start
   ```

5. Open `http://localhost:3000` to confirm that the server is running. The SQLite database is created automatically at `data/tasks.db` when the application starts.

For development with automatic restart:

```bash
npm run dev
```

## 4. API routes

Base URL: `http://localhost:3000`

| Method | Endpoint | Description | Success status |
|---|---|---|---|
| GET | `/tasks` | List all tasks | 200 |
| GET | `/tasks/:id` | Get one task | 200 |
| POST | `/tasks` | Create a task | 201 |
| PUT | `/tasks/:id` | Update a task | 200 |
| DELETE | `/tasks/:id` | Delete a task | 200 |

### GET /tasks

Example response (`200 OK`):

```json
{
  "data": [
    {
      "id": 1,
      "title": "Finish assignment",
      "description": "Build the REST API",
      "completed": false,
      "created_at": "2026-11-08 10:00:00",
      "updated_at": "2026-11-08 10:00:00"
    }
  ],
  "count": 1
}
```

### GET /tasks/:id

Example request:

```http
GET /tasks/1
```

Example response (`200 OK`):

```json
{
  "data": {
    "id": 1,
    "title": "Finish assignment",
    "description": "Build the REST API",
    "completed": false,
    "created_at": "2026-11-08 10:00:00",
    "updated_at": "2026-11-08 10:00:00"
  }
}
```

If the ID is valid but no task exists, the API returns `404 Not Found`.

### POST /tasks

Example request body:

```json
{
  "title": "Finish assignment",
  "description": "Build the REST API",
  "completed": false
}
```

Example response (`201 Created`):

```json
{
  "message": "Task created successfully.",
  "data": {
    "id": 1,
    "title": "Finish assignment",
    "description": "Build the REST API",
    "completed": false,
    "created_at": "2026-11-08 10:00:00",
    "updated_at": "2026-11-08 10:00:00"
  }
}
```

### PUT /tasks/:id

PUT replaces the editable task fields. All fields below are accepted; `title` is required.

Example request body:

```json
{
  "title": "Finish assignment",
  "description": "CRUD routes are complete",
  "completed": true
}
```

Example response (`200 OK`):

```json
{
  "message": "Task updated successfully.",
  "data": {
    "id": 1,
    "title": "Finish assignment",
    "description": "CRUD routes are complete",
    "completed": true,
    "created_at": "2026-11-08 10:00:00",
    "updated_at": "2026-11-08 10:05:00"
  }
}
```

### DELETE /tasks/:id

Example request:

```http
DELETE /tasks/1
```

Example response (`200 OK`):

```json
{
  "message": "Task 1 deleted successfully."
}
```

## 5. Validation and error handling

The create and update routes validate input:
- `title` must be a non-empty string and no longer than 120 characters.
- `description`, if provided, must be a string and no longer than 1000 characters.
- `completed`, if provided, must be a boolean.

Example validation response (`400 Bad Request`):

```json
{
  "error": "Validation failed",
  "messages": [
    "title is required and must be a non-empty string."
  ]
}
```

Other responses:
- `400 Bad Request`: invalid task ID, invalid JSON, or invalid input.
- `404 Not Found`: task or route does not exist.
- `500 Internal Server Error`: unexpected server-side error.

Errors are handled by Express middleware so malformed requests and missing records do not crash the server.

## 6. Testing the API

### Postman

1. Start the server with `npm start`.
2. Open Postman and select **Import**.
3. Import `postman/Assignment-6-Tasks-API.postman_collection.json`.
4. Run the requests. After creating a task, set the `taskId` collection variable to the returned ID before testing get, update, and delete.

### curl examples

Create:

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Study Express","description":"Review routes","completed":false}'
```

List:

```bash
curl http://localhost:3000/tasks
```

Get one:

```bash
curl http://localhost:3000/tasks/1
```

Update:

```bash
curl -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Study Express","description":"Routes reviewed","completed":true}'
```

Delete:

```bash
curl -X DELETE http://localhost:3000/tasks/1
```

Validation test:

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":""}'
```

## 7. Automated tests

Run:

```bash
npm test
```

The tests check listing, creation, validation, retrieving a task, updating, deleting, invalid IDs, and missing records. Tests use a separate SQLite database file.

## 8. Project structure

```text
assignment6_rest_api/
├── data/                         # SQLite database is generated here
├── postman/
│   └── Assignment-6-Tasks-API.postman_collection.json
├── src/
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── routes/
│   │   └── tasks.js
│   ├── app.js
│   ├── database.js
│   └── server.js
├── tests/
│   └── tasks.test.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 9. Database persistence

The application uses SQLite through Node.js's built-in `node:sqlite` module, a real file-based relational database. Task records are stored in `data/tasks.db` and remain available after the server stops and starts again. The database file is generated automatically and is excluded from Git.

## 10. Submission checklist

- [x] Express server and one primary resource
- [x] Five CRUD operations
- [x] RESTful route naming
- [x] Appropriate success and error status codes
- [x] Persistent SQLite database
- [x] Create/update input validation
- [x] JSON error responses and error middleware
- [x] README with setup instructions and route examples
- [x] Postman collection
- [x] Automated test suite

Before submission, run `npm install`, `npm test`, and `npm start` on your own computer to verify the project in your environment. Then upload the project repository to GitHub and submit the GitHub link together with this ZIP archive.
