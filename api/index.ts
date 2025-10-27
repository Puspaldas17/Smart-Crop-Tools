import "dotenv/config";
import serverless from "serverless-http";
import { createServer } from "../server/index";

// Wrap the Express app in a serverless handler. Vercel will use this for all /api/* requests.
const app = createServer();

export default serverless(app);
