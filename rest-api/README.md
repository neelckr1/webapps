# Hands-On Tutorial: Building a RESTful `/users` API with Node.js, Express, and MongoDB

**Main Takeaway:**  
Creating a `/users` REST API with Node.js, Express, and MongoDB is a foundational project for learning backend web development. By the end of this tutorial, you'll implement all CRUD operations (Create, Read, Update, Delete) for user data, practising schema design, routing, validation, and (optionally) authentication.

***

## Skill Levels

- **Beginner:** Basic CRUD routes, user model and validation, running locally.
- **Intermediate:** Add authentication (JWT), advanced validation, error handling.
- **Advanced:** Input sanitization, rate limiting, secure deployment, modular architecture.

***

## Objectives & Learning Outcomes

| Objective                              | Learning Outcome                                                 |
|-----------------------------------------|------------------------------------------------------------------|
| Set up Node, Express, and MongoDB       | Understand backend stack setup                                   |
| Design a user schema (Mongoose)         | Practice data modeling, enforce validation rules                 |
| Implement RESTful CRUD routes for `/users` | Learn routing, HTTP methods, and REST principles                 |
| (Optional) Add JWT authentication       | Secure user data, understand stateless auth                      |
| Test API with Postman/curl              | Gain experience debugging and iterating on endpoints             |
| Error handling and best practices       | Build robust, maintainable APIs                                  |

***

## Prerequisites

- **Concepts:** JavaScript (ES6+), basics of HTTP/REST, JSON, MongoDB fundamentals
- **Tools:** Node.js, npm, MongoDB Atlas/local, VS Code (or any editor), Postman or curl
- **Libraries:**  
  - `express` (web server & routing)  
  - `mongoose` (MongoDB ODM)  
  - (`jsonwebtoken`, `bcrypt` for JWT/auth, optional for intermediate level)

***

## Step 1: Project Setup

```bash
mkdir users-rest-api
cd users-rest-api
npm init -y
npm install express mongoose dotenv
```
- Create a `.env` file for your MongoDB URI:
  ```
  MONGO_URI=mongodb+srv://:@cluster0.xyz.mongodb.net/dbname?retryWrites=true&w=majority
  ```

***

## Step 2: Basic Server

Create `server.js`:

```js
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

app.get('/', (req, res) => res.send('API is running'));

app.listen(3000, () => console.log('Server running on port 3000'));
```

***

## Step 3: Mongoose User Model with Validation

Create `models/User.js`:

```js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username required"],
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: [true, "Email required"],
    unique: true,
    match: [/\S+@\S+\.\S+/, "Email invalid"]
  },
  password: {
    type: String,
    required: [true, "Password required"],
    minlength: 6
  }
});

module.exports = mongoose.model('User', userSchema);
```
- **Learning**: Validation happens before saving; unique constraint helps prevent duplicate emails.[1][2][3][4]

***

## Step 4: CRUD Routes for `/users`

Create `routes/users.js`:

```js
const express = require('express');
const User = require('../models/User');
const router = express.Router();

// CREATE
router.post('/', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ all users
router.get('/', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// READ single user
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: "Invalid user ID" });
  }
});

// UPDATE user
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE user
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ msg: "Deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: "Invalid user ID" });
  }
});

module.exports = router;
```
In `server.js` add:
```js
const userRoutes = require('./routes/users');
app.use('/users', userRoutes);
```

***

## Step 5: Test and Experiment

- Use **Postman** or `curl` for requests:
  - `POST /users` to create
  - `GET /users` or `/users/:id` to read
  - `PUT /users/:id` to update
  - `DELETE /users/:id` to delete
- Try breaking validation rules and observe error handling

***

## Intermediate: Authentication (JWT - Optional Add-on)

**Install:**  
`npm install jsonwebtoken bcrypt`

**Usage Highlights:**
- Hash passwords before saving
- Add `POST /users/login` for login
- Secure routes by checking JWT in headers

See practical JWT auth guides for step-by-step on registering, logging in, and token verification.[5][6][7][8]

***

## Step 6: Best Practices & Error Handling

- Always validate user input (Mongoose + Express middleware).
- Return appropriate HTTP status codes.
- Secure your API (rate limiting, CORS, authentication).
- Document your endpoints (Swagger or README).[9][10][11]

***

## Quiz Time (Self-Test & Practice)

1. What does each HTTP method (GET, POST, PUT, DELETE) do in a REST API?
2. How does Mongoose enforce validation? What happens if validation fails?
3. Why should you hash passwords before storing them?
4. What is a JWT and why is it used?
5. How would you add pagination to the `/users` endpoint?

***

## Recommended Resources

- [Express.js documentation](https://expressjs.com/)
- [MongoDB official tutorials](https://mongodb.com/docs)
- [Mongoose validation](https://mongoosejs.com/docs/validation.html)
- GitHub example repos: [Node+Express User API](https://github.com/basir/node-express-mongodb)
- Video walkthroughs: ["CRUD API Tutorial – Node, Express, MongoDB"], ["How to Build a CRUD API"][12][13]

***

## Collaboration & Creativity

- **Peer code reviews**: Share your routes/models with a classmate.
- **Pair programming**: Build each endpoint together, explain logic step by step.
- **Experiment**: Add profile pictures, roles, or extra user fields. What challenges do you face? Troubleshoot and discuss!

***

## Real-World Applications & Career Skills

- **User management APIs** are everywhere: social networks, e-commerce, SaaS dashboards.
- Skills gained: API design, data modeling, backend security, DevOps basics, teamwork.

***

### Next Steps

- Try building `/products` or `/posts` endpoints using similar patterns.
- Integrate frontend (React, Angular) to consume your API.
- Deploy to Heroku, Railway, or Vercel for hands-on experience.

**For specific feedback on your code or further project ideas—just ask!**

***

**Happy building—your first backend REST API is a critical step toward full-stack development mastery!**

[1] https://www.geekster.in/articles/validation-in-mongoose/
[2] https://mongoosejs.com/docs/5.x/docs/validation.html
[3] https://mongoosejs.com/docs/validation.html
[4] https://www.geeksforgeeks.org/mongodb/mongoose-validation/
[5] https://adevait.com/nodejs/how-to-implement-jwt-authentication-on-node
[6] https://www.geeksforgeeks.org/node-js/how-to-implement-jwt-authentication-in-express-js-app/
[7] https://www.topcoder.com/thrive/articles/authentication-and-authorization-in-express-js-api-using-jwt
[8] https://dev.to/eidorianavi/authentication-and-jwt-in-node-js-4i13
[9] https://blog.risingstack.com/10-best-practices-for-writing-node-js-rest-apis/
[10] https://www.indusface.com/blog/how-to-secure-nodejs-api/
[11] https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/
[12] https://www.youtube.com/watch?v=gIteoUkSM-k
[13] https://www.youtube.com/watch?v=_7UQPve99r4
[14] https://www.geeksforgeeks.org/node-js/how-to-build-a-restful-api-using-node-express-and-mongodb/
[15] https://www.scaler.com/topics/expressjs-tutorial/performing-crud-in-mongodb-with-expressjs/
[16] https://dev.to/omacys/building-a-basic-crud-api-with-nodejs-mongodb-and-expressjs-a-beginners-tutorial-1mmh
[17] https://dev.to/eidorianavi/node-js-mongodb-and-express-rest-api-part-1-100n
[18] https://www.mongodb.com/docs/manual/crud/
[19] https://www.geeksforgeeks.org/node-js/node-js-crud-operations-using-mongoose-and-mongodb-atlas/
[20] https://hevodata.com/learn/building-a-secure-node-js-rest-api/
[21] https://www.bezkoder.com/node-express-mongodb-crud-rest-api/
[22] https://www.mongodb.com/developer/products/atlas/mongodb-express-prisma-validation/
[23] https://www.digitalocean.com/community/tutorials/nodejs-creating-your-own-express-middleware
[24] https://expressjs.com/en/guide/writing-middleware.html
[25] https://stackoverflow.com/questions/63098294/validation-in-mongoose-schema
[26] https://www.npmjs.com/package/express-jwt
[27] https://www.youtube.com/watch?v=y18ubz7gOsQ
[28] https://expressjs.com/en/guide/using-middleware.html
[29] https://www.corbado.com/blog/nodejs-express-mysql-jwt-authentication-roles
[30] https://dev.to/m__mdy__m/middleware-in-expressjs-4b4
[31] https://mongoosejs.com/docs/guide.html
[32] https://www.youtube.com/watch?v=mbsmsi7l3r4
