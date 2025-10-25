# Node.js + Express + MongoDB API Tutorial

A comprehensive hands-on guide to building a RESTful API using Node.js, Express.js, and MongoDB.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [Project Structure](#project-structure)
4. [Environment Configuration](#environment-configuration)
5. [Database Connection](#database-connection)
6. [Creating Models](#creating-models)
7. [Building Controllers](#building-controllers)
8. [Setting up Routes](#setting-up-routes)
9. [Middleware Setup](#middleware-setup)
10. [Testing with Postman](#testing-with-postman)
11. [Advanced Features](#advanced-features)
12. [Deployment Considerations](#deployment-considerations)

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (version 18+)
- **npm** or **yarn**
- **MongoDB** (locally) or **MongoDB Atlas** (cloud)
- **Postman** (for API testing)
- **Code Editor** (VS Code recommended)

## Project Setup

### Step 1: Initialize the Project

```bash
# Create project directory
mkdir book-api
cd book-api

# Initialize npm project
npm init -y
```

### Step 2: Install Dependencies

```bash
# Production dependencies
npm install express mongoose dotenv cors

# Development dependencies
npm install --save-dev nodemon
```

### Step 3: Update package.json Scripts

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

## Project Structure

Create the following folder structure:

```
book-api/
├── config/
│   └── db.js
├── controllers/
│   └── bookController.js
├── middleware/
│   └── errorHandler.js
├── models/
│   └── Book.js
├── routes/
│   └── bookRoutes.js
├── .env
├── .gitignore
├── server.js
└── package.json
```

## Environment Configuration

### Step 1: Create .env File

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/bookstore

# For MongoDB Atlas (replace with your connection string)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bookstore?retryWrites=true&w=majority
```

### Step 2: Create .gitignore File

```gitignore
node_modules/
.env
*.log
.DS_Store
dist/
build/
```

## Database Connection

### Create config/db.js

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('Database connection error:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
```

## Creating Models

### Create models/Book.js

```javascript
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a book title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    author: {
        type: String,
        required: [true, 'Please provide an author name'],
        trim: true,
        maxlength: [50, 'Author name cannot be more than 50 characters']
    },
    isbn: {
        type: String,
        required: [true, 'Please provide an ISBN'],
        unique: true,
        trim: true
    },
    publishedDate: {
        type: Date,
        required: [true, 'Please provide a published date']
    },
    pages: {
        type: Number,
        required: [true, 'Please provide number of pages'],
        min: [1, 'Pages must be at least 1']
    },
    genre: {
        type: String,
        required: [true, 'Please provide a genre'],
        enum: ['Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 'Mystery', 'Romance', 'Thriller', 'Biography', 'History', 'Other']
    },
    price: {
        type: Number,
        required: [true, 'Please provide a price'],
        min: [0, 'Price cannot be negative']
    },
    inStock: {
        type: Boolean,
        default: true
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot be more than 500 characters']
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt fields
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Create indexes for better query performance
bookSchema.index({ title: 1 });
bookSchema.index({ author: 1 });
bookSchema.index({ genre: 1 });

// Virtual field example
bookSchema.virtual('formattedPrice').get(function() {
    return `$${this.price.toFixed(2)}`;
});

module.exports = mongoose.model('Book', bookSchema);
```

## Building Controllers

### Create controllers/bookController.js

```javascript
const Book = require('../models/Book');

// @desc    Get all books
// @route   GET /api/books
// @access  Public
const getAllBooks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build query
        let query = {};
        
        // Filter by genre
        if (req.query.genre) {
            query.genre = req.query.genre;
        }
        
        // Filter by author
        if (req.query.author) {
            query.author = { $regex: req.query.author, $options: 'i' };
        }
        
        // Search by title
        if (req.query.search) {
            query.title = { $regex: req.query.search, $options: 'i' };
        }

        const books = await Book.find({query})
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Book.countDocuments(query);

        res.status(200).json({
            success: true,
            count: books.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: books
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
const getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        res.status(200).json({
            success: true,
            data: book
        });
    } catch (error) {
        // Handle invalid ObjectId
        if (error.name === 'CastError') {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Create new book
// @route   POST /api/books
// @access  Public
const createBook = async (req, res) => {
    try {
        const book = await Book.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Book created successfully',
            data: book
        });
    } catch (error) {
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: 'Validation Error',
                errors
            });
        }

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Book with this ISBN already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Public
const updateBook = async (req, res) => {
    try {
        const book = await Book.findByIdAndUpdate(
            req.params.id,
            req.body,
            { 
                new: true, // Return the updated document
                runValidators: true // Run schema validators
            }
        );

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Book updated successfully',
            data: book
        });
    } catch (error) {
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: 'Validation Error',
                errors
            });
        }

        // Handle invalid ObjectId
        if (error.name === 'CastError') {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Public
const deleteBook = async (req, res) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Book deleted successfully',
            data: book
        });
    } catch (error) {
        // Handle invalid ObjectId
        if (error.name === 'CastError') {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

module.exports = {
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook
};
```

## Setting up Routes

### Create routes/bookRoutes.js

```javascript
const express = require('express');
const {
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook
} = require('../controllers/bookController');

const router = express.Router();

// Route: /api/books
router.route('/')
    .get(getAllBooks)
    .post(createBook);

// Route: /api/books/:id
router.route('/:id')
    .get(getBookById)
    .put(updateBook)
    .delete(deleteBook);

module.exports = router;
```

## Middleware Setup

### Create middleware/errorHandler.js

```javascript
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log to console for dev
    console.log(err);

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = { message, statusCode: 404 };
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = { message, statusCode: 400 };
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = { message, statusCode: 400 };
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error'
    });
};

module.exports = errorHandler;
```

## Main Server File

### Create server.js

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route files
const bookRoutes = require('./routes/bookRoutes');

// Connect to database
connectDB();

const app = express();

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? 'your-frontend-domain.com' : '*',
    credentials: true
}));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`);
    next();
});

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString()
    });
});

// Mount routers
app.use('/api/books', bookRoutes);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => {
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.log(`Error: ${err.message}`);
    process.exit(1);
});

module.exports = app;
```

## Testing with Postman

### Running the Server

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

### Postman Collection Setup

Create a new collection in Postman called "Book API" with the following requests:

#### 1. Health Check
- **Method**: GET
- **URL**: `http://localhost:3000/health`

#### 2. Get All Books
- **Method**: GET
- **URL**: `http://localhost:3000/api/books`
- **Query Parameters** (optional):
  - `page`: 1
  - `limit`: 10
  - `genre`: Fiction
  - `author`: author name
  - `search`: book title

#### 3. Get Single Book
- **Method**: GET
- **URL**: `http://localhost:3000/api/books/:id`

#### 4. Create Book
- **Method**: POST
- **URL**: `http://localhost:3000/api/books`
- **Body** (JSON):
```json
{
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "isbn": "9780743273565",
    "publishedDate": "1925-04-10",
    "pages": 180,
    "genre": "Fiction",
    "price": 12.99,
    "inStock": true,
    "description": "A classic American novel set in the Jazz Age."
}
```

#### 5. Update Book
- **Method**: PUT
- **URL**: `http://localhost:3000/api/books/:id`
- **Body** (JSON):
```json
{
    "price": 14.99,
    "inStock": false
}
```

#### 6. Delete Book
- **Method**: DELETE
- **URL**: `http://localhost:3000/api/books/:id`

### Testing Scenarios

1. **Positive Tests**:
   - Create a new book with valid data
   - Retrieve all books
   - Get a specific book by ID
   - Update book information
   - Delete a book

2. **Negative Tests**:
   - Try to create a book with missing required fields
   - Try to get a book with invalid ID
   - Try to create a book with duplicate ISBN
   - Try to access non-existent endpoints

## Advanced Features

### Input Validation Middleware

```javascript
// middleware/validation.js
const { body, validationResult } = require('express-validator');

const validateBook = [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('author').trim().notEmpty().withMessage('Author is required'),
    body('isbn').trim().notEmpty().withMessage('ISBN is required'),
    body('publishedDate').isISO8601().withMessage('Valid date is required'),
    body('pages').isInt({ min: 1 }).withMessage('Pages must be a positive integer'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        next();
    }
];

module.exports = { validateBook };
```

### Rate Limiting

```javascript
// Install: npm install express-rate-limit
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);
```

### API Documentation Middleware

```javascript
// Install: npm install swagger-ui-express swagger-jsdoc
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Book API',
        version: '1.0.0',
        description: 'A simple Express API for managing books',
    },
    servers: [
        {
            url: `http://localhost:${PORT}`,
            description: 'Development server',
        },
    ],
};

const options = {
    swaggerDefinition,
    apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

## Deployment Considerations

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bookstore
```

### Package.json Scripts for Production

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "prod": "NODE_ENV=production node server.js"
  }
}
```

### Basic Security Headers

```javascript
// Install: npm install helmet
const helmet = require('helmet');

app.use(helmet());
```

### MongoDB Atlas Setup

1. Create account on MongoDB Atlas
2. Create new cluster
3. Create database user
4. Whitelist IP addresses
5. Get connection string
6. Update MONGODB_URI in .env

## Summary

This tutorial covered:

- ✅ Complete CRUD API implementation  
- ✅ Proper project structure and organization
- ✅ MongoDB integration with Mongoose
- ✅ Error handling and validation
- ✅ Environment configuration
- ✅ Middleware implementation
- ✅ Postman testing strategies
- ✅ Production deployment considerations

### Next Steps

1. Add authentication and authorization
2. Implement file upload functionality
3. Add comprehensive logging
4. Set up automated testing
5. Implement caching strategies
6. Add API versioning
7. Deploy to cloud platforms (Heroku, AWS, etc.)

### Useful Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Postman Learning Center](https://learning.postman.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

Happy coding! 🚀