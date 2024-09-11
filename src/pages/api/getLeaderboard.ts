import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { difficulty } = req.query;
      
      if (!difficulty || !['easy', 'hard', 'veryHard'].includes(difficulty as string)) {
        return res.status(400).json({ message: '유효한 난이도를 지정해주세요.' });
      }

      const client = await clientPromise;
      const db = client.db("matrixMathGame");

      const leaderboard = await db.collection("scores")
        .aggregate([
          {
            $match: { difficulty: difficulty }
          },
          {
            $lookup: {
              from: "users",
              localField: "playerName",
              foreignField: "email",
              as: "userInfo"
            }
          },
          {
            $unwind: {
              path: "$userInfo",
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $project: {
              nickname: { $ifNull: ["$userInfo.nickname", "$playerName"] },
              score: 1,
              date: 1
            }
          },
          {
            $sort: { score: -1 }
          },
          {
            $limit: 10
          }
        ])
        .toArray();

      res.status(200).json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: '리더보드 조회 중 오류가 발생했습니다.' });
    }
  } else {
    res.status(405).json({ message: '허용되지 않는 메소드입니다.' });
  }
}