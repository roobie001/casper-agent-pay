import axios from "axios";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    const response = await axios.post(
      "https://node.testnet.casper.network/rpc",
      req.body,
      { headers: { "Content-Type": "application/json" }, timeout: 10000 },
    );
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: "proxy_error", message: error.message });
  }
}
