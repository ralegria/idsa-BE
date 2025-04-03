import { Donation } from "../models/donations.model.js";
import { Goal } from "../models/goals.model.js";
import { User } from "../models/users.model.js";
import { currency } from "../utils.js";

const getAmountCollected = (donations) =>
  donations.reduce((acc, donation) => acc + donation.amount_donated, 0);

const getUser = async (short_id) => await User.findOne({ where: { short_id } });

export const getCurrentGoal = async (req, res) => {
  try {
    const user = await getUser(req.params.user_id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentGoal = await Goal.findOne({
      where: { user_id: user.id, isMainGoal: true },
    });

    if (!currentGoal) {
      return res.status(404).json({ message: "No goal found" });
    }

    res.json(currentGoal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getGoalHistory = async (req, res) => {
  try {
    const user = await getUser(req.params.user_id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const goals = await Goal.findAll({
      where: { user_id: user.id },
    });
    if (!goals) {
      return res.status(404).json({ message: "No goal found" });
    }
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createGoal = async (req, res) => {
  //Get previous Goal Function
  const user = await getUser(req.body.user_id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const getPreviousGoal = async () =>
    await Goal.findOne({
      where: { user_id: user.id, isMainGoal: true },
    });

  const createNewGoal = async (body, UPDATE = false) => {
    if (UPDATE) {
      await Goal.update({ isMainGoal: false }, { where: { isMainGoal: true } });
    }

    const newGoal = await Goal.create({ ...body, user_id: user.id });
    res.json(newGoal);
  };

  try {
    //Setting previouseGoal as not main goal
    const previousGoal = await getPreviousGoal();

    //console.log(previousGoal.amount, req.body.amount);

    if (previousGoal && previousGoal.amount === req.body.amount) {
      return res.status(400).json({ message: "Goal already exists" });
    } else if (previousGoal && previousGoal.amount > req.body.amount) {
      const donations = await Donation.findAll({
        where: { user_id: user.id },
      });

      if (donations.length > 0) {
        const amount_collected = getAmountCollected(donations);
        console.log(amount_collected, req.body.amount);

        if (amount_collected < req.body.amount) {
          //Creating new goal
          await createNewGoal(req.body, true);
        } else {
          res.status(400).json({
            message: `You've already raised ${currency(
              amount_collected / 100
            )}. Your new goal must be higher.`,
          });
        }
      } else {
        //Creating new goal
        await createNewGoal(req.body, true);
      }
    } else if (previousGoal && previousGoal.amount < req.body.amount) {
      //Creating new goal
      await createNewGoal(req.body, true);
    } else {
      //Creating new goal
      await createNewGoal(req.body, false);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
