import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Signup() {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const validatePassword = (password: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{6,})/;
    return regex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword(password)) {
      setError('비밀번호는 최소 6글자 이상이며, 영문 대소문자와 특수기호를 포함해야 합니다.');
      return;
    }
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, email, password }),
    });

    if (response.ok) {
      router.push('/login');
    } else {
      const data = await response.json();
      setError(data.message || '회원가입 실패');
    }
  };

  return (
    <div className="bg-black text-green-500 min-h-screen flex flex-col items-center justify-center p-8 font-mono">
      <div className="bg-black bg-opacity-80 p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl mb-8 font-bold text-center">회원가입</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임"
            className="bg-black border-2 border-green-500 text-green-500 px-4 py-2 rounded-full text-center text-xl w-full"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            className="bg-black border-2 border-green-500 text-green-500 px-4 py-2 rounded-full text-center text-xl w-full"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            className="bg-black border-2 border-green-500 text-green-500 px-4 py-2 rounded-full text-center text-xl w-full"
          />
          <p className="text-sm text-green-300">비밀번호는 최소 6글자 이상이며, 영문 대소문자와 특수기호(!@#$%^&*)를 포함해야 합니다.</p>
          <button
            type="submit"
            className="bg-green-500 text-black px-4 py-2 rounded-full text-lg font-bold hover:bg-green-400 transition-colors w-full"
          >
            가입하기
          </button>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        <p className="mt-4 text-center">
          이미 계정이 있으신가요? <Link href="/login" className="text-green-400 hover:underline">로그인</Link>
        </p>
        <Link href="/">
          <button className="mt-8 bg-green-500 text-black px-4 py-2 rounded-full text-lg font-bold hover:bg-green-400 transition-colors w-full">
            메인으로 돌아가기
          </button>
        </Link>
      </div>
    </div>
  );
}