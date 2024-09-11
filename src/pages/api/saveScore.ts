import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { playerName, score, difficulty } = req.body;

      const client = await clientPromise;
      const db = client.db("matrixMathGame");

      await db.collection("scores").insertOne({
        playerName,
        score,
        difficulty,
        date: new Date()
      });

      res.status(200).json({ message: '점수가 성공적으로 저장되었습니다.' });
    } catch (error) {
      res.status(500).json({ message: '점수 저장 중 오류가 발생했습니다.' });
    }
  } else {
    res.status(405).json({ message: '허용되지 않는 메소드입니다.' });
  }
}