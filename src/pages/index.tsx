import { useState, useEffect, useCallback } from "react";
import Link from 'next/link';
import { BackspaceIcon } from '@heroicons/react/24/solid';
import { signOut, useSession } from 'next-auth/react';
import axios from 'axios';

const MatrixRain = () => {
  useEffect(() => {
    const canvas = document.getElementById('matrix-rain') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()_+";
    const fontSize = 10;
    const columns = canvas.width / fontSize;

    const drops: number[] = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    function draw() {
      ctx!.fillStyle = "rgba(0, 0, 0, 0.02)"; // 투명도를 낮춤
      ctx!.fillRect(0, 0, canvas.width, canvas.height);

      ctx!.fillStyle = "#0F0";
      ctx!.font = fontSize + "px monospace";

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx!.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    }

    const interval = setInterval(draw, 33);

    return () => clearInterval(interval);
  }, []);

  return <canvas id="matrix-rain" className="fixed top-0 left-0 w-full h-full z-0 opacity-50"></canvas>;
};

const Keypad = ({ onKeyPress }: { onKeyPress: (key: string) => void }) => {
  const keys = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    '-', '0', 'backspace'
  ];

  return (
    <div className="grid grid-cols-3 gap-2 mt-4">
      {keys.map((key) => (
        <button
          key={key}
          onClick={() => onKeyPress(key)}
          className="bg-green-500 text-black px-4 py-2 rounded-full text-lg font-bold flex items-center justify-center"
        >
          {key === 'backspace' ? <BackspaceIcon className="h-6 w-6" /> : key}
        </button>
      ))}
      <button
        onClick={() => onKeyPress('submit')}
        className="col-span-3 bg-green-500 text-black px-4 py-2 rounded-full text-lg font-bold hover:bg-green-400 transition-colors mt-2"
      >
        제출
      </button>
    </div>
  );
};

export default function Home() {
  const [gameState, setGameState] = useState("splash");
  const [score, setScore] = useState(0);
  const [chances, setChances] = useState(3);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [timer, setTimer] = useState(5);
  const [difficulty, setDifficulty] = useState("easy");
  const [feedback, setFeedback] = useState("");
  const [inputError, setInputError] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [leaderboard, setLeaderboard] = useState<Array<{nickname: string, score: number}>>([]);
  const [leaderboardDifficulty, setLeaderboardDifficulty] = useState("easy");

  const { data: session } = useSession();

  const generateQuestion = useCallback(() => {
    const operations = difficulty === "easy" ? ['+', '-'] : ['+', '-', '*', '/'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let num1, num2;

    const generateNumber = (min: number, max: number) => {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const generateVeryHardNumber = () => {
      if (Math.random() < 0.1) {
        // 10% 확률로 3자리 숫자
        return generateNumber(100, 999);
      } else {
        // 90% 확률로 2자리 숫자
        return generateNumber(10, 99);
      }
    };

    switch (operation) {
      case '+':
      case '-':
        if (difficulty === "veryHard") {
          num1 = generateVeryHardNumber();
          num2 = generateVeryHardNumber();
        } else if (difficulty === "hard") {
          num1 = generateNumber(1, 99);
          num2 = generateNumber(1, 99);
        } else {
          num1 = generateNumber(1, 20);
          num2 = generateNumber(1, 20);
        }
        break;
      case '*':
        if (difficulty === "veryHard") {
          num1 = generateVeryHardNumber();
          num2 = generateNumber(2, 12);
        } else if (difficulty === "hard") {
          num1 = generateNumber(1, 20); // 곱셈의 경우 첫 번째 숫자를 20으로 제한
          num2 = generateNumber(1, 12); // 곱셈의 경우 두 번째 숫자는 작게 유지
        } else {
          num1 = generateNumber(1, 10);
          num2 = generateNumber(1, 10);
        }
        break;
      case '/':
        if (difficulty === "veryHard") {
          num2 = generateNumber(2, 12);
          num1 = num2 * generateVeryHardNumber();
        } else if (difficulty === "hard") {
          num2 = generateNumber(2, 12);
          num1 = num2 * generateNumber(1, 20); // 나눗셈의 경우 결과가 1~20 사이가 되도록 조정
        } else {
          num2 = generateNumber(1, 9);
          num1 = num2 * generateNumber(1, 10);
        }
        break;
    }

    setQuestion(`${num1} ${operation} ${num2} = ?`);
    setTimer(difficulty === "veryHard" ? 3 : 5);
  }, [difficulty]);

  const handleTimeUp = useCallback(() => {
    setChances(prevChances => {
      if (prevChances === 1) {
        setGameState("gameover");
        return 0;
      } else {
        generateQuestion();
        return prevChances - 1;
      }
    });
  }, [generateQuestion]);

  useEffect(() => {
    if (gameState === "playing") {
      generateQuestion();
    }
  }, [gameState, generateQuestion]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === "playing" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      handleTimeUp();
    }
    return () => clearInterval(interval);
  }, [gameState, timer, handleTimeUp]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm 브레이크포인트
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const checkAnswer = () => {
    const [num1, operation, num2] = question.split(' ');
    let correctAnswer: number;

    switch (operation) {
      case '+':
        correctAnswer = parseInt(num1) + parseInt(num2);
        break;
      case '-':
        correctAnswer = parseInt(num1) - parseInt(num2);
        break;
      case '*':
        correctAnswer = parseInt(num1) * parseInt(num2);
        break;
      case '/':
        correctAnswer = parseInt(num1) / parseInt(num2);
        break;
      default:
        correctAnswer = 0;
        break;
    }

    if (Math.abs(parseFloat(answer) - correctAnswer) < 0.01) {
      setScore(score + 1);
      setFeedback("맞췄습니다!");
      generateQuestion(); // 바로 다음 문제 생성
    } else {
      setFeedback("틀렸습니다.");
      handleTimeUp(); // 바로 기회 차감 및 다음 문제 생성
    }
    setAnswer(""); // 입력 필드 초기화

    // 피드백 메시지를 잠시 표시한 후 제거
    setTimeout(() => {
      setFeedback("");
    }, 1000);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      checkAnswer();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^-?\d*\.?\d*$/.test(value) || value === "") {
      setAnswer(value);
      setInputError("");
    } else {
      setInputError("숫자와 소수점, 음수 기호만 입력하세요!");
    }
  };

  const handleGameOver = async () => {
    if (session) {
      try {
        await axios.post('/api/saveScore', {
          playerName: session.user?.name,
          score: score,
          difficulty: difficulty
        });
      } catch (error) {
        console.error('Failed to save score:', error);
      }

      await fetchLeaderboard(difficulty);
      setGameState("leaderboard");
    } else {
      setFeedback("점수를 저장하려면 로그인이 필요합니다.");
      setGameState("splash");
    }
  };

  const fetchLeaderboard = async (difficulty: string) => {
    const leaderboardResponse = await fetch(`/api/getLeaderboard?difficulty=${difficulty}`);
    if (leaderboardResponse.ok) {
      const leaderboardData = await leaderboardResponse.json();
      setLeaderboard(leaderboardData);
      setLeaderboardDifficulty(difficulty);
    }
  };

  const handleKeypadPress = (key: string) => {
    if (key === 'submit') {
      checkAnswer();
    } else if (key === 'backspace') {
      setAnswer(prev => prev.slice(0, -1));
    } else {
      setAnswer(prev => prev + key);
    }
  };

  return (
    <div className="bg-black text-green-500 min-h-screen flex flex-col items-center justify-center p-8 font-mono relative">
      <MatrixRain />
      {session && (
        <button
          onClick={() => signOut()}
          className="absolute top-4 right-4 text-green-500 text-sm hover:text-green-400 transition-colors"
        >
          로그아웃
        </button>
      )}
      <div className="z-10 relative bg-black bg-opacity-80 p-8 rounded-lg shadow-lg">
        {gameState === "splash" && (
          <div className="text-center">
            <h1 className="text-4xl mb-8 font-bold">매트릭스 수학 게임</h1>
            {session ? (
              <p className="mb-4">안녕하세요, {session.user?.name}님!</p>
            ) : (
              <div className="mb-4">
                <Link href="/login">
                  <button className="bg-green-500 text-black px-4 py-2 rounded-full text-lg font-bold hover:bg-green-400 transition-colors mr-2">
                    로그인
                  </button>
                </Link>
                <Link href="/signup">
                  <button className="bg-green-500 text-black px-4 py-2 rounded-full text-lg font-bold hover:bg-green-400 transition-colors">
                    회원가입
                  </button>
                </Link>
              </div>
            )}
            <div className="mb-8">
              <p className="text-xl mb-4">난이도 선택:</p>
              <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                {["easy", "hard", "veryHard"].map((level) => (
                  <button
                    key={level}
                    className={`w-full sm:w-36 px-4 py-3 rounded-full text-base font-bold transition-colors ${
                      difficulty === level
                        ? "bg-green-500 text-black"
                        : "bg-black text-green-500 border-2 border-green-500 hover:bg-green-500 hover:text-black"
                    }`}
                    onClick={() => setDifficulty(level)}
                  >
                    {level === "easy" ? "쉬움" : level === "hard" ? "어려움" : "매우 어려움"}
                  </button>
                ))}
              </div>
              <div className="text-left bg-black bg-opacity-50 p-4 rounded-lg mt-4">
                <h3 className="text-xl mb-2 font-bold">난이도 기준:</h3>
                <ul className="list-disc list-inside">
                  <li><span className="font-bold">쉬움:</span> 1~20 사이의 숫자, 덧셈과 뺄셈만, 5초 제한</li>
                  <li><span className="font-bold">어려움:</span> 1~99 사이의 숫자, 모든 연산 포함, 5초 제한</li>
                  <li><span className="font-bold">매우 어려움:</span> 2자리 이상 자(10% 확률로 3자리), 모든 연산 포함, 3초 제한</li>
                </ul>
              </div>
            </div>
            <div className="flex flex-col space-y-4 mt-8">
              <button
                className="bg-green-500 text-black px-6 py-3 rounded-full text-lg font-bold hover:bg-green-400 transition-colors w-full sm:w-64 mx-auto"
                onClick={() => setGameState("playing")}
              >
                게임 시작
              </button>
              <Link 
                href="/dashboard" 
                className="bg-green-500 text-black px-6 py-3 rounded-full text-lg font-bold hover:bg-green-400 transition-colors w-full sm:w-64 mx-auto text-center"
              >
                순위 보기
              </Link>
            </div>
          </div>
        )}

        {gameState === "playing" && (
          <div className="text-center">
            <h2 className="text-2xl mb-4 font-bold">점수: {score}</h2>
            <h3 className="text-xl mb-4">남은 기회: {chances}</h3>
            <p className="text-xl mb-2">난이도: {
              difficulty === "easy" ? "쉬움" : 
              difficulty === "hard" ? "어려움" : "매우 어려움"
            }</p>
            <p className="text-3xl mb-2 font-bold">{question}</p>
            <p className="text-2xl mb-4 font-bold text-red-500">남은 시간: {timer}초</p>
            {isMobile ? (
              <>
                <input
                  type="text"
                  value={answer}
                  readOnly
                  className="bg-black border-2 border-green-500 text-green-500 px-4 py-2 rounded-full text-center text-xl w-full max-w-xs mb-4"
                />
                <Keypad onKeyPress={handleKeypadPress} />
              </>
            ) : (
              <div className="mb-4">
                <input
                  type="text"
                  value={answer}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="bg-black border-2 border-green-500 text-green-500 px-4 py-2 rounded-full text-center text-xl w-full max-w-xs"
                />
                <div className="h-6 mt-2">
                  {inputError && <p className="text-red-500 text-sm">{inputError}</p>}
                </div>
                <button
                  onClick={checkAnswer}
                  className="bg-green-500 text-black px-6 py-3 rounded-full text-lg font-bold hover:bg-green-400 transition-colors mt-4"
                >
                  제출
                </button>
              </div>
            )}
            <div className="h-8 mt-4">
              {feedback && (
                <p className={`text-xl font-bold ${feedback === "맞췄습니다!" ? "text-green-500" : "text-red-500"}`}>
                  {feedback}
                </p>
              )}
            </div>
          </div>
        )}

        {gameState === "gameover" && (
          <div className="text-center">
            <h2 className="text-3xl mb-4 font-bold">게임 오버</h2>
            <p className="text-xl mb-2">난이도: {
              difficulty === "easy" ? "쉬움" : 
              difficulty === "hard" ? "어려움" : "매우 어려움"
            }</p>
            <p className="text-xl mb-6">최종 점수: {score}</p>
            <button
              onClick={handleGameOver}
              className="bg-green-500 text-black px-6 py-3 rounded-full text-lg font-bold hover:bg-green-400 transition-colors mb-4"
            >
              점수 제출
            </button>
            <div className="mb-4 h-12">
              <button
                onClick={() => {
                  setGameState("splash");
                  setScore(0);
                  setChances(3);
                }}
                className="bg-green-500 text-black px-6 py-3 rounded-full text-lg font-bold hover:bg-green-400 transition-colors"
              >
                다시 시작
              </button>
            </div>
            <div className="h-8 mt-4">
              {/* 여기에 피드백이 표시될 수 있음 */}
            </div>
          </div>
        )}

        {gameState === "leaderboard" && (
          <div className="text-center">
            <h2 className="text-3xl mb-4 font-bold">게임 오버</h2>
            <p className="text-xl mb-2">난이도: {
              difficulty === "easy" ? "쉬움" : 
              difficulty === "hard" ? "어려움" : "매우 어려움"
            }</p>
            <p className="text-xl mb-6">최종 점수: {score}</p>
            <h3 className="text-2xl mb-4 font-bold">리더보드</h3>
            <div className="mb-4 bg-black p-2 rounded-lg inline-block">
              <button
                onClick={() => fetchLeaderboard("easy")}
                className={`px-4 py-2 rounded-full mr-2 ${leaderboardDifficulty === "easy" ? "bg-green-500 text-black" : "text-green-500 border border-green-500"}`}
              >
                쉬움
              </button>
              <button
                onClick={() => fetchLeaderboard("hard")}
                className={`px-4 py-2 rounded-full mr-2 ${leaderboardDifficulty === "hard" ? "bg-green-500 text-black" : "text-green-500 border border-green-500"}`}
              >
                어려움
              </button>
              <button
                onClick={() => fetchLeaderboard("veryHard")}
                className={`px-4 py-2 rounded-full ${leaderboardDifficulty === "veryHard" ? "bg-green-500 text-black" : "text-green-500 border border-green-500"}`}
              >
                매우 어려움
              </button>
            </div>
            <p className="text-lg mb-4 bg-black inline-block px-4 py-2 rounded-full">
              선택된 난이도: {
                leaderboardDifficulty === "easy" ? "쉬움" :
                leaderboardDifficulty === "hard" ? "어려움" : "매우 어려움"
              }
            </p>
            <ul className="mb-6 bg-black p-4 rounded-lg">
              {leaderboard.map((entry, index) => (
                <li key={index} className="text-lg mb-2">
                  <span className="inline-block bg-green-500 text-black w-8 h-8 rounded-full mr-2 text-center leading-8">{index + 1}</span>
                  <span className="text-green-500">{entry.nickname}: {entry.score}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => {
                setGameState("splash");
                setScore(0);
                setChances(3);
              }}
              className="bg-green-500 text-black px-6 py-3 rounded-full text-lg font-bold hover:bg-green-400 transition-colors"
            >
              다시 시작
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
