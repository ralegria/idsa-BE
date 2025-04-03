import "dotenv/config";
import https from "https";

const odooUrl = process.env.ODOO_URL;
const database = process.env.ODOO_DATABASE;
const username = process.env.ODOO_USERNAME;
const password = process.env.ODOO_PASSWORD;
const apiKey = process.env.ODOO_API_KEY; // Get API key from environment variables

async function makeOdooJsonRpcRequest(method, params) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      params: {
        service: "object",
        method: method,
        args: params,
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
        "X-Openerp-Session-Id": apiKey,
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
          if (parsedResponse.error) {
            reject(parsedResponse.error);
          } else {
            resolve(parsedResponse.result);
          }
        } catch (error) {
          reject({
            message: `JSON Parsing Error: ${error}, Response: ${responseBody}`,
            status: res.statusCode,
          });
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

const getInventoryFromOdoo = async () => {
  try {
    const result = await makeOdooJsonRpcRequest("execute_kw", [
      database,
      1, // Odoo online requires user ID 1 when using API keys.
      apiKey,
      "stock.quant",
      "search_read",
      [[["location_id.usage", "=", "internal"]]],
      { fields: ["product_id", "quantity", "location_id"] },
    ]);
    return result;
  } catch (error) {
    console.error("Odoo Inventory Error:", error);
    return null;
  }
};

export const getInventory = async (req, res) => {
  try {
    const inventory = await getInventoryFromOdoo();
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
