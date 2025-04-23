export const currency = (amount) =>
  amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

export const generateRandomStoreName = () => {
  const adjectives = [
    "Amazing",
    "Brilliant",
    "Creative",
    "Dynamic",
    "Elegant",
    "Fantastic",
    "Global",
    "Harmony",
    "Innovative",
    "Jubilant",
  ];

  const nouns = [
    "Store",
    "Market",
    "Shop",
    "Outlet",
    "Emporium",
    "Bazaar",
    "Mart",
    "Boutique",
    "Depot",
    "Warehouse",
  ];

  const randomAdjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];

  return `${randomAdjective} ${randomNoun}`;
};
