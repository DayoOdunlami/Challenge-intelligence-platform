import type { NextRequest } from "next/server"
import { sign } from "jsonwebtoken"

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123" // Change this!
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json()

    if (password !== ADMIN_PASSWORD) {
      return Response.json({ error: "Invalid password" }, { status: 401 })
    }

    // Generate JWT token
    const token = sign({ role: "admin", timestamp: Date.now() }, JWT_SECRET, { expiresIn: "24h" })

    return Response.json({ token, message: "Authentication successful" })
  } catch (error) {
    return Response.json({ error: "Authentication failed" }, { status: 500 })
  }
}
