#!/usr/bin/env node

import "dotenv/config";
import mongoose from "mongoose";
import fs from "fs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import readline from "readline";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Expense from "../models/Expense.js";

const SESSION_FILE = "./session.json";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const ask = (question) =>
    new Promise((resolve) => rl.question(question, resolve));

const saveSession = (token) => {
  fs.writeFileSync(SESSION_FILE, JSON.stringify({ token }));
};

const logout = () => {
  if (fs.existsSync(SESSION_FILE)) {
    fs.unlinkSync(SESSION_FILE);
    console.log("Logged out successfully");
  } else {
    console.log("Not logged in");
  }
};


const getSessionUser = () => {
  if (!fs.existsSync(SESSION_FILE)) return null;

  const data = JSON.parse(fs.readFileSync(SESSION_FILE));
  try {
    const decoded = jwt.verify(data.token, process.env.JWT_SECRET);
    return decoded.id;
  } catch {
    return null;
  }
};

const signup = async () => {
    const name = await ask("Name: ");
    const email = await ask("Email: ");
    const password = await ask("Password: ");

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password: hashed
    });

    console.log("User created:", user.email);
}

const login = async () => {
    const email = await ask("Email: ");
    const password = await ask("Password: ");

    const user = await User.findOne({ email });

    if (!user) {
        console.log("User not found");
        return;
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
        console.log("Wrong password");
        return;
    }
    const token = jwt.sign(
        { id: user._id},
        process.env.JWT_SECRET,
        {expiresIn: "7d"}
    );
    saveSession(token);
    console.log("Login successful");
}

const addExpense = async () => {
  const userId = getSessionUser();

  if (!userId) {
    console.log("Please login first");
    return;
  }

  const allowedCategories = [
    "Groceries",
    "Leisure",
    "Electronics",
    "Utilities",
    "Clothing",
    "Health",
    "Others"
  ];

  const title = await ask("Title: ");
  const amount = await ask("Amount: ");

  console.log("\nChoose Category:");
  allowedCategories.forEach((cat, index) => {
    console.log(`${index + 1}. ${cat}`);
  });

  const categoryChoice = await ask("Enter category number: ");
  const category = allowedCategories[Number(categoryChoice) - 1];

  if (!category) {
    console.log("Invalid category selected");
    return;
  }

  try {
    await Expense.create({
      userId,
      title,
      amount: Number(amount),
      category,
      date: new Date()
    });

    console.log("Expense added successfully");
  } catch (error) {
    console.log("Failed to add expense:", error.message);
  }
};

const listExpenses = async () => {
    const userId = getSessionUser();

    if (!userId) {
        console.log("⚠️ Please login first");
        return;
    }

    const expenses = await Expense.find({
        userId
    }).sort({ date: -1});

    console.log("\n Your Expenses:\n");
    console.log(expenses);
}

const deleteExpense = async () => {
  const userId = getSessionUser();

  if (!userId) {
    console.log("Please login first");
    return;
  }

  const expenses = await Expense.find({ userId }).sort({ date: -1 });

  if (expenses.length === 0) {
    console.log("No expenses found.");
    return;
  }

  console.log("\nYour Expenses:\n");
  expenses.forEach((exp, index) => {
    console.log(
      `${index + 1}. ${exp.title} | ₹${exp.amount} | ${exp.category} | ${exp.date.toDateString()}`
    );
  });

  const choice = await ask("\nEnter number to delete: ");
  const selected = expenses[Number(choice) - 1];

  if (!selected) {
    console.log("Invalid selection");
    return;
  }

  await Expense.findByIdAndDelete(selected._id);

  console.log("Expense deleted successfully");
};

const monthlySummary = async () => {
  const userId = getSessionUser();

  if (!userId) {
    console.log("Please login first");
    return;
  }

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

  const expenses = await Expense.find({
    userId,
    date: { $gte: firstDay }
  });

  if (expenses.length === 0) {
    console.log("No expenses this month.");
    return;
  }

  let total = 0;
  const categoryTotals = {};

  expenses.forEach((exp) => {
    total += exp.amount;

    if (!categoryTotals[exp.category]) {
      categoryTotals[exp.category] = 0;
    }

    categoryTotals[exp.category] += exp.amount;
  });

  console.log("\nMonthly Summary\n");

  Object.keys(categoryTotals).forEach((cat) => {
    console.log(`${cat}: ₹${categoryTotals[cat]}`);
  });

  console.log("\n----------------------");
  console.log(`Total: ₹${total}`);
};

const run = async () => {
  await connectDB();

  const command = process.argv[2];

  switch (command) {
    case "signup":
      await signup();
      break;
    case "login":
      await login();
      break;
    case "add":
      await addExpense();
      break;
    case "list":
      await listExpenses();
      break;
    case "logout":
      logout();
      break
    case "delete":
      await deleteExpense();
      break;
    case "summary":
      await monthlySummary();
      break;
    default:
      console.log("Available commands:");
      console.log("signup | login | add | list | delete | summary | logout");
  }

  rl.close();
  await mongoose.connection.close();
  process.exit();
};

run();