# Users REST API

A simple RESTful API for user management built with Node.js, Express, and MongoDB. Supports CRUD operations for users with validation and error handling.

## Features
- Create, Read, Update, Delete users
- Mongoose schema validation
- Express routing
- MongoDB integration

## Prerequisites
- Node.js & npm
- MongoDB Atlas or local MongoDB

## Setup
1. Clone or download this repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your MongoDB URI:
   ```env
   MONGO_URI=your_mongodb_uri
   ```
4. Start the server:
   ```bash
   node server.js
   ```

## API Endpoints
| Method | Endpoint         | Description           |
|--------|------------------|-----------------------|
| POST   | /users           | Create a new user     |
| GET    | /users           | Get all users         |
| GET    | /users/:id       | Get user by ID        |
| PUT    | /users/:id       | Update user by ID     |
| DELETE | /users/:id       | Delete user by ID     |

## Example User Object
```
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

## Testing
You can test endpoints using Postman or curl. See below for automated test cases.

## License
MIT
