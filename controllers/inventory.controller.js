import "dotenv/config";
import https from "https";

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
          console.log("Full parsed response from Odoo:", parsedResponse); // Log the entire response
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

const getInventoryFromOdoo = async (userId) => {
  if (!userId) {
    return null;
  }
  try {
    const result = await makeOdooJsonRpcRequest("execute", [
      database,
      userId,
      password,
      "stock.quant",
      "search_read",
      [],
      [["location_id.usage", "=", "internal"]],
      ["product_id", "quantity", "location_id"],
    ]);
    return result;
  } catch (error) {
    console.error("Odoo Inventory Error:", error);
    return null;
  }
};

export const getInventory = async (req, res) => {
  try {
    const userId = await loginOdoo();
    if (!userId) {
      res.status(401).json({ error: "Authentication Failed" });
      return;
    }
    const inventory = await getInventoryFromOdoo(userId);
    if (!inventory) {
      res.status(500).json({ error: "Inventory could not be retrieved" });
      return;
    }
    res.json(inventory);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
};
