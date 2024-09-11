import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError('로그인 실패: ' + result.error);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="bg-black text-green-500 min-h-screen flex flex-col items-center justify-center p-8 font-mono">
      <div className="bg-black bg-opacity-80 p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl mb-8 font-bold text-center">로그인</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <button
            type="submit"
            className="bg-green-500 text-black px-4 py-2 rounded-full text-lg font-bold hover:bg-green-400 transition-colors w-full"
          >
            로그인
          </button>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        <p className="mt-4 text-center">
          계정이 없으신가요? <Link href="/signup" className="text-green-400 hover:underline">회원가입</Link>
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