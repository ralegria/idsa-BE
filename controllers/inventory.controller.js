import "dotenv/config";
import https from "https";
import { connectToDatabase } from "../database/db-pgonly.js";

const odooUrl = process.env.ODOO_URL;
const database = process.env.ODOO_DATABASE;
const username = process.env.ODOO_USERNAME;
const password = process.env.ODOO_PASSWORD;

async function makeOdooJsonRpcRequest(method, args) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      params: {
        service: method === "login" ? "common" : "object", // Use "common" for login
        method: method,
        args: args, // Use the 'args' passed to this function
      },
      id: Math.floor(Math.random() * 1000000),
    });

    const options = {
      hostname: odooUrl,
      port: 443,
      path: "/jsonrpc",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": postData.length,
      },
    };

    const req = https.request(options, (res) => {
      let responseBody = "";
      res.on("data", (chunk) => {
        responseBody += chunk;
      });
      res.on("end", () => {
        try {
          const parsedResponse = JSON.parse(responseBody);
          //console.log("Full parsed response from Odoo:", parsedResponse); // Log the entire response
          if (parsedResponse.error) {
            reject(parsedResponse.error);
          } else {
            resolve(parsedResponse.result);
          }
        } catch (error) {
          // ... error handling
        }
      });
    });

    req.on("error", (error) => {
      reject({ message: error.message, status: 500 });
    });

    req.write(postData);
    req.end();
  });
}

const loginOdoo = async () => {
  try {
    console.log("Connecting to Odoo");
    const result = await makeOdooJsonRpcRequest(
      "login", // method
      [database, username, password] // args - removed "common"
    );
    if (typeof result === "number") {
      return result; // Return the user ID if it's a number
    } else {
      console.error("Odoo Login Error: Unexpected result:", result);
      return null;
    }
  } catch (error) {
    console.error("Odoo Login Error:", error);
    return null;
  }
};

const getInventoryFromOdoo = async (userId, startDate, endDate) => {
  if (!userId) {
    return null;
  }
  try {
    const domain = [
      ["create_date", ">=", startDate],
      ["create_date", "<=", endDate],
    ];

    const result = await makeOdooJsonRpcRequest("execute", [
      database,
      userId,
      password,
      "product.template",
      "search_read",
      domain,
      [],
    ]);
    //console.log("result", result);
    return result;
  } catch (error) {
    console.error("Odoo Inventory Error:", error);
    return null;
  }
};

async function insertProductsToDatabase(client, products) {
  try {
    for (const product of products) {
      // Create a new object without the "image_" properties
      const productWithoutImages = {};
      for (const key in product) {
        if (!key.startsWith("image_")) {
          productWithoutImages[key] = product[key];
        }
      }

      const { id, ...restOfProductData } = productWithoutImages; // Extract id and the rest

      const columns = Object.keys(restOfProductData)
        .map((key) => camelToSnakeCase(key))
        .join(", ");
      const placeholders = Object.keys(restOfProductData)
        .map((_, index) => `$${index + 2}`) // Start placeholders from $2 as id is $1
        .join(", ");
      const values = [id, ...Object.values(restOfProductData)];

      const setClauses = Object.keys(restOfProductData)
        .map(
          (key, index) =>
            `${camelToSnakeCase(key)} = EXCLUDED.${camelToSnakeCase(key)}`
        )
        .join(", ");

      const query = `
        INSERT INTO products (id, ${columns})
        VALUES ($1, ${placeholders})
        ON CONFLICT (id) DO UPDATE
        SET ${setClauses};
      `;

      await client.query(query, values);
      console.log(`Inserted/updated product with ID: ${id}`);
    }
    console.log("Successfully inserted/updated all products.");
  } catch (error) {
    console.error("Error inserting/updating products:", error);
    throw error;
  }
}

function camelToSnakeCase(str) {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

async function fetchAllProductsInBatches(userId) {
  try {
    let allProducts = [];
    let year = new Date().getFullYear();
    let hasMoreProducts = true;

    do {
      const startDate = `${year}-01-01 00:00:00`;
      const endDate = `${year}-12-31 23:59:59`;
      let fetchedCount = 0;
      let batchLength = 0; // To track the length of the last fetched batch

      const batch = await getInventoryFromOdoo(userId, startDate, endDate);

      if (!batch || batch.length === 0) {
        hasMoreProducts = false; // No more products in this date range
        batchLength = 0;
        break;
      }

      allProducts = allProducts.concat(batch);
      fetchedCount += batch.length;
      batchLength = batch.length;

      const client = await connectToDatabase();
      await insertProductsToDatabase(client, batch);
      console.log(
        `Finished fetching products from ${year}. Total for this year: ${fetchedCount}`
      );
      year--; // Move to the previous year
      if (year < 2000 && allProducts.length > 0) {
        // Example stopping condition based on year and if any products were found
        hasMoreProducts = false;
      } else if (year < 2000 && allProducts.length === 0) {
        hasMoreProducts = false;
      }
    } while (hasMoreProducts);

    const reponse = `Successfully fetched a total of ${allProducts.length} products.`;

    console.log(reponse);
    return reponse;
  } catch (error) {
    console.error("Error fetching all products:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch all products.", details: error });
  } finally {
    if (client) {
      await client.end();
      console.log("Disconnected from PostgreSQL database");
    }
  }
}

export const getInventory = async (req, res) => {
  try {
    const userId = await loginOdoo();
    if (!userId) {
      res.status(401).json({ error: "Authentication Failed" });
      return;
    }

    const allProducts = await fetchAllProductsInBatches(userId);

    if (allProducts && allProducts.length > 0) {
      res.json({
        message: `Successfully fetched and stored ${allProducts.length} products.`,
      });
    } else {
      res.status(500).json({
        error: "Failed to retrieve or store products.",
        details: error,
      });
    }
  } catch (error) {
    console.error("Error in getInventory route:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch and store products.", details: error });
  }
};
