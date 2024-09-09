import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Score {
  nickname: string;
  score: number;
  timestamp: number;
}

export default function Dashboard() {
  const [topScores, setTopScores] = useState<Score[]>([]);

  useEffect(() => {
    // 실제 구현에서는 서버에서 데이터를 가져와야 합니다.
    const fetchScores = async () => {
      // 임시 데이터
      const mockScores: Score[] = [
        { nickname: "Player1", score: 100, timestamp: Date.now() },
        { nickname: "Player2", score: 90, timestamp: Date.now() },
        // ... 더 많은 임시 데이터 ...
      ];
      setTopScores(mockScores);
    };

    fetchScores();
  }, []);

  return (
    <div className="bg-black text-green-500 min-h-screen flex flex-col items-center justify-center p-8 font-mono">
      <h1 className="text-4xl mb-8 font-bold">주간 순위</h1>
      <div className="w-full max-w-md">
        {topScores.map((score, index) => (
          <div key={index} className="flex justify-between items-center mb-2 p-2 bg-green-900 bg-opacity-20 rounded">
            <span>{index + 1}. {score.nickname}</span>
            <span>{score.score}</span>
          </div>
        ))}
      </div>
      <Link href="/" className="mt-8 bg-green-500 text-black px-6 py-3 rounded-full text-lg font-bold hover:bg-green-400 transition-colors">
        게임으로 돌아가기
      </Link>
    </div>
  );
}