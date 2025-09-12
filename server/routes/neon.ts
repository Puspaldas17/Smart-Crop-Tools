import { RequestHandler } from "express";

// Neon via Netlify: requires NETLIFY_DATABASE_URL env var to be set in Netlify
// https://docs.netlify.com/frameworks/neon/
export const getPostById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params as { id?: string };
    if (!id) return res.status(400).json({ error: "id required" });

    // Lazy import to avoid local dev dependency if not needed
    const { neon } = await import("@netlify/neon");

    const sql = neon(); // uses env NETLIFY_DATABASE_URL
    const rows = await sql`SELECT * FROM posts WHERE id = ${id}`;

    if (!rows || rows.length === 0) return res.status(404).json({ error: "not found" });
    return res.json({ rows });
  } catch (e: any) {
    const msg = typeof e?.message === "string" ? e.message : "query failed";
    return res.status(500).json({ error: msg });
  }
};
