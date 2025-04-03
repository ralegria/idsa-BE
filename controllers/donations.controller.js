import { User } from "../models/users.model.js";
import { Donation } from "../models/donations.model.js";

export const getDonationsByUser = async (req, res) => {
  try {
    const donations = await Donation.findAll({
      where: { isPaymentCompleted: true, user_id: req.params.user_id },
    });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAmountCollectedByUser = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { short_id: req.params.user_id },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const donations = await Donation.findAll({
      where: { isPaymentCompleted: true, user_id: user.id },
    });
    const amountCollected = donations.reduce(
      (total, donation) => total + donation.amount_donated,
      0
    );
    res.json({ collected: amountCollected });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDonation = async (req, res) => {
  try {
    const donation = await Donation.findByPk(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }
    res.json(donation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDonation = async (req, res) => {
  try {
    const donation = await Donation.findByPk(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }
    await donation.update(req.body);
    res.json(donation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
