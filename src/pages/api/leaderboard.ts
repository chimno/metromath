import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const client = await clientPromise;
    const db = client.db();

    const leaderboard = await db.collection("users")
      .find({}, { projection: { name: 1, score: 1 } })
      .sort({ score: -1 })
      .limit(10)
      .toArray();

    res.status(200).json(leaderboard);
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}