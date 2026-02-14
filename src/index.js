import dotenv from "dotenv";
dotenv.config();
import express from 'express';

import connectDB from '../config/db.js';
import authRoutes from "../routes/auth.routes.js";
import expenseRoutes from "../routes/expense.routes.js";

const app = express();
connectDB();

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/expenses", expenseRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);