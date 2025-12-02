import "dotenv/config";
import fs from "fs";
import path from "path";
import serverless from "serverless-http";

let handler: any = null;

async function initHandler() {
	if (handler) return handler;

	const distServerPath = path.join(process.cwd(), "dist", "server", "node-build.mjs");
	let app: any = null;

	if (fs.existsSync(distServerPath)) {
		try {
			console.log("[api] Attempting to import built server from:", distServerPath);
			const mod = await import(distServerPath);
			if (mod.createServer) {
				app = mod.createServer();
				console.log("[api] Successfully created app from built server");
			} else if (mod.default && typeof mod.default === "function") {
				app = mod.default;
				console.log("[api] Successfully used default export from built server");
			} else if (mod.app) {
				app = mod.app;
				console.log("[api] Successfully used app export from built server");
			}
		} catch (err) {
			console.warn("[api] Failed to import dist server bundle:", err);
		}
	}

	if (!app) {
		try {
			console.log("[api] Falling back to source server import");
			const src = await import("../server/index");
			app = src.createServer();
			console.log("[api] Successfully created app from source server");
		} catch (err) {
			console.error("[api] Fatal error creating server:", err);
			throw err;
		}
	}

	handler = serverless(app);
	return handler;
}

export default async function vercelHandler(req: any, res: any) {
	try {
		const h = await initHandler();
		return h(req, res);
	} catch (err) {
		console.error("[api] Handler error:", err);
		res.status(500).json({ error: "Server initialization failed" });
	}
}
