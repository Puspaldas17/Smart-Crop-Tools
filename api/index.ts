import "dotenv/config";
import serverless from "serverless-http";
import { createServer } from "../server/index";

let handler: any;

try {
  const app = createServer();
  handler = serverless(app);
} catch (err: any) {
  console.error("Server Init Error:", err);
  // Fallback handler to return JSON error instead of crashing
  handler = async (_req: any, res: any) => {
    if (res.status) res.status(500);
    else res.statusCode = 500;
    
    // Ensure JSON content type
    res.setHeader("Content-Type", "application/json"); 
    res.end(JSON.stringify({ 
      error: "Server initialization failed", 
      details: err.message,
      stack: err.stack 
    }));
  };
}

export default async function vercelHandler(req: any, res: any) {
  try {
    return await handler(req, res);
  } catch (err: any) {
    console.error("Request Handler Error:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ 
      error: "Runtime error", 
      details: err.message 
    }));
  }
}
