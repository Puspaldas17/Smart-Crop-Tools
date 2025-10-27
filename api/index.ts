import "dotenv/config";
import fs from "fs";
import path from "path";
import serverless from "serverless-http";

// Lazy-initialize the Express app so this function works both on Vercel
// (where a compiled server bundle may exist under dist/server) and locally
// (where we can import the source createServer).
let handler: any = null;

async function initHandler() {
	if (handler) return handler;

	const distServerPath = path.join(process.cwd(), "dist", "server", "node-build.mjs");
	let app: any = null;

	if (fs.existsSync(distServerPath)) {
		try {
			// Try to import the compiled server bundle first (production builds)
			const mod = await import(distServerPath);
			// The compiled bundle may export a `createServer` factory or the app directly
			if (mod.createServer) {
				app = mod.createServer();
			} else if (mod.default && typeof mod.default === "function") {
				// default export might be an express app
				app = mod.default;
			} else if (mod.app) {
				app = mod.app;
			}
		} catch (err) {
			// Fall through to source import below
			console.warn("Failed to import dist server bundle:", err);
		}
	}

	if (!app) {
		// Import the source server (TypeScript) and create the app.
		const src = await import("../server/index");
		app = src.createServer();
	}

	handler = serverless(app);
	return handler;
}

export default async function vercelHandler(req: any, res: any) {
	const h = await initHandler();
	return h(req, res);
}
