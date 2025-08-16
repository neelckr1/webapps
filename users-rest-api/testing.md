# API Testing Documentation

This document provides detailed instructions and sample `curl` commands for testing the `/users` REST API endpoints.

## Prerequisites
- Ensure the server is running (`npm run dev`)
- MongoDB is running locally
- API base URL: `http://localhost:3000`

---

## Endpoints & Test Commands

### 1. Create a User
**Request:**
```sh
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","email":"john@example.com","password":"secret123"}'
```
**Expected Response:**
- Status: `201 Created`
- Body: JSON object with user details and `_id`

---

### 2. Get All Users
**Request:**
```sh
curl http://localhost:3000/users
```
**Expected Response:**
- Status: `200 OK`
- Body: Array of user objects

---

### 3. Get a User by ID
**Request:**
```sh
curl http://localhost:3000/users/<USER_ID>
```
Replace `<USER_ID>` with the actual user ID.
**Expected Response:**
- Status: `200 OK` (if found), `404 Not Found` (if not)
- Body: User object or error message

---

### 4. Update a User
**Request:**
```sh
curl -X PUT http://localhost:3000/users/<USER_ID> \
  -H "Content-Type: application/json" \
  -d '{"username":"updated_name"}'
```
**Expected Response:**
- Status: `200 OK` (if updated), `404 Not Found` (if not)
- Body: Updated user object or error message

---

### 5. Delete a User
**Request:**
```sh
curl -X DELETE http://localhost:3000/users/<USER_ID>
```
**Expected Response:**
- Status: `200 OK` (if deleted), `404 Not Found` (if not)
- Body: `{ "msg": "Deleted successfully" }` or error message

---

## Error Testing
- Try creating a user with an invalid email:
```sh
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"username":"baduser","email":"invalid","password":"secret123"}'
```
- Expected: `400 Bad Request` with validation error message

---

## Notes
- All requests and responses use JSON format.
- Replace `<USER_ID>` with the actual MongoDB user ID.
- For more advanced testing, use Postman or automated test scripts.

---

**End of Testing Documentation**
