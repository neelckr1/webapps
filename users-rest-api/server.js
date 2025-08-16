const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));


app.get('/', (req, res) => res.send('API is running'));

const userRoutes = require('./routes/users');
app.use('/users', userRoutes);

app.listen(3000, () => console.log('Server running on port 3000'));
