import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";

import {
    addExpense,
    updateExpense,
    deleteExpense,
    getExpenses
} from "../controller/expense.controllers.js"

const router = express.Router();
router.use(authMiddleware)

router.post("/", addExpense);
router.get("/",getExpenses);
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);

export default router;
