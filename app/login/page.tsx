import { Suspense } from 'react';
import { LoginPage } from '../components/LoginPage';

export default function Login() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24" />}>
      <LoginPage />
    </Suspense>
  );
}

