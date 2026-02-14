import Expense from "../models/Expense.js"


export const addExpense = async (req, res) => {
    try {
        const expense = await Expense.create({
            ...req.body,
            userId: req.userId
        });

        res.status(201).json(expense);

    } catch (err) {
        res.status(500).json({message: "Failed to add expense"});
    }
};

export const updateExpense = async (req, res) => {
    try {
        const expense = await Expense.findOneAndUpdate(
            {_id: req.params.id, userId: req.userId},
            req.body,
            {new : true}
        );

        if (!expense)
            return res.status(400).json({message: "Expense not found"});

        res.json(expense);
    } catch {
        res.status(500).json({message: "Failed to update expense"});
    }
}

export const deleteExpense = async (req, res) => {
    try {
        const result = await Expense.deleteOne({
            _id: req.params.id,
            userId: req.userId
        });

        if (result.deletedCount === 0) {
            res.status(404).json({message: "Expense deleted"});
        }
        res.json({message: "Expense deleted"});
    } catch {
        res.status(500).json({message: "Failed to delete expense"});
    }
};

export const getExpenses = async (req, res) => {
  try {
    const { filter, start, end } = req.query;

    let fromDate = new Date();

    if (filter === "week") fromDate.setDate(fromDate.getDate() - 7);
    else if (filter === "month") fromDate.setMonth(fromDate.getMonth() - 1);
    else if (filter === "3months") fromDate.setMonth(fromDate.getMonth() - 3);
    else if (filter === "custom" && start) fromDate = new Date(start);

    const query = {
      userId: req.userId,
      date: {
        $gte: fromDate,
        ...(filter === "custom" && end && { $lte: new Date(end) })
      }
    };

    const expenses = await Expense.find(query).sort({ date: -1 });
    res.json(expenses);
  } catch {
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
};