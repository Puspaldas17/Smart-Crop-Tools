import { RequestHandler } from "express";
import { Farmer } from "../db";
import bcrypt from "bcryptjs";
import { signToken } from "../middleware/auth";

// -- REGISTER --
export const register: RequestHandler = async (req, res) => {
  try {
    const { name, email, password, phone, soilType, landSize, language, location, role } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ error: "Name, email, password, and phone are required" });
    }

    const existing = await Farmer.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newFarmer = await Farmer.create({
      name, email, password: hashedPassword, phone,
      soilType, landSize, language: language || "en-IN",
      location, role: role || "farmer",
    });

    const plain = newFarmer.toObject ? newFarmer.toObject() : { ...newFarmer };
    const { password: _, ...userWithoutPassword } = plain;

    const token = signToken({ id: String(plain._id), role: plain.role || "farmer", name: plain.name });
    res.status(201).json({ user: userWithoutPassword, token });
  } catch (e) {
    console.error("[auth] Register error:", e);
    res.status(500).json({ error: "Registration failed" });
  }
};

// -- LOGIN --
export const login: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const farmer = await Farmer.findOne({ email });
    if (!farmer) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (farmer.password) {
      const match = await bcrypt.compare(password, farmer.password);
      if (!match) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
    } else {
      return res.status(400).json({ error: "Please use phone login or reset password" });
    }

    const plain = farmer.toObject ? farmer.toObject() : { ...farmer };
    const { password: _, ...userWithoutPassword } = plain;

    const token = signToken({ id: String(plain._id), role: plain.role || "farmer", name: plain.name });
    res.json({ user: userWithoutPassword, token });
  } catch (e) {
    console.error("[auth] Login error:", e);
    res.status(500).json({ error: "Login failed" });
  }
};

// -- LEGACY UPSERT (backward compat) --
export const upsertFarmer: RequestHandler = async (req, res) => {
  try {
    const { name, phone, soilType, landSize, language, location } = req.body as any;
    if (!name || !phone)
      return res.status(400).json({ error: "name and phone required" });

    const updateData = { name, phone, soilType, landSize, language, location };
    const data = await Farmer.findOneAndUpdate({ phone }, updateData, { new: true, upsert: true });
    res.json(data);
  } catch (e) {
    console.error("[auth] Unexpected error:", e);
    res.status(500).json({ error: "auth error" });
  }
};

// -- GUEST LOGIN --
export const guestLogin: RequestHandler = async (req, res) => {
  try {
    const guest = {
      id: "guest_" + Date.now(),
      name: "Guest User",
      phone: undefined,
      language: req.body?.language || "en-IN",
      isGuest: true,
      role: "farmer",
    };
    // No JWT for guest — client uses guest object as-is
    return res.status(200).json(guest);
  } catch (e) {
    console.error("Guest login error:", e);
    return res.status(500).json({ error: "guest login error" });
  }
};

// -- DEBUG (dev only) --
export const getDebugUsers: RequestHandler = async (_req, res) => {
  try {
    const users = (await Farmer.find({})) as any[];
    const safe = users.map((u) => {
      const obj = u.toObject ? u.toObject() : { ...u };
      delete obj.password;
      return obj;
    });
    res.json(safe);
  } catch (e) {
    console.error("[auth] Debug users error:", e);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const deleteDebugUser: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await Farmer.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (e) {
    console.error("[auth] Delete user error:", e);
    res.status(500).json({ error: "Failed to delete user" });
  }
};
