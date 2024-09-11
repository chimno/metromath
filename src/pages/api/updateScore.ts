import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import clientPromise from '../../utils/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getSession({ req });
  if (!session || !session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { score, difficulty } = req.body;

  if (!score || !difficulty) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('matrix_math_game');
    const scoresCollection = db.collection('scores');

    const result = await scoresCollection.insertOne({
      userId: session.user.id,
      nickname: session.user.name || 'Anonymous',
      score,
      difficulty,
      createdAt: new Date(),
    });

    res.status(200).json({ message: 'Score updated successfully', scoreId: result.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}