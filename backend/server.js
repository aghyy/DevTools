const express = require('express');
const sequelize = require('sequelize');
const dotenv = require('dotenv').config();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const db = require('./models');
const userRoutes = require('./routes/userRoutes');

const PORT = process.env.PORT || 5039;
const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

db.sequelize.sync({ force: false }).then(() => {
  console.log("db has been re sync");
});

app.use('/api/users', userRoutes);

app.listen(PORT, () => console.log(`Server is connected on ${PORT}`));

console.log("Secret Key:", process.env.secretKey);