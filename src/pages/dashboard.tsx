import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

type LeaderboardEntry = {
  nickname: string;
  score: number;
  difficulty: string;
};

export default function Dashboard() {
  const { data: session } = useSession();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const { data: session } = useSession();

  const fetchLeaderboard = useCallback(async () => {
    const response = await fetch('/api/getLeaderboard?difficulty=all');
    if (response.ok) {
      const data = await response.json();
      setLeaderboard(data);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '쉬움';
      case 'hard': return '어려움';
      case 'veryHard': return '매우 어려움';
      default: return '전체';
    }
  };

  return (
    <div className="bg-black text-green-500 min-h-screen flex flex-col items-center justify-center p-8 font-mono">
      <div className="bg-black bg-opacity-80 p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h1 className="text-4xl mb-8 font-bold text-center">순위 보기</h1>
        
        <div className="mb-6">
          <label htmlFor="difficulty" className="block mb-2">난이도 선택:</label>
          <select
            id="difficulty"
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-black border-2 border-green-500 text-green-500 px-4 py-2 rounded-full text-center text-xl w-full"
          >
            <option value="all">전체</option>
            <option value="easy">쉬움</option>
            <option value="hard">어려움</option>
            <option value="veryHard">매우 어려움</option>
          </select>
        </div>

        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-green-500">
              <th className="py-2">순위</th>
              <th className="py-2">닉네임</th>
              <th className="py-2">점수</th>
              <th className="py-2">난이도</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, index) => (
              <tr key={index} className="text-center">
                <td className="py-2">{index + 1}</td>
                <td className="py-2">{entry.nickname}</td>
                <td className="py-2">{entry.score}</td>
                <td className="py-2">{getDifficultyLabel(entry.difficulty)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-center">
          <Link href="/">
            <button className="bg-green-500 text-black px-6 py-3 rounded-full text-lg font-bold hover:bg-green-400 transition-colors">
              메인으로 돌아가기
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}