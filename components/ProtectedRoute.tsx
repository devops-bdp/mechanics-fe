'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, getUser } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  allowedPosisi?: string[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  allowedPosisi,
}: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const user = getUser();

    if (!token || !user) {
      router.push('/login');
      return;
    }

    // Check authorization: user must match EITHER allowedRoles OR allowedPosisi
    let hasAccess = false;

    // If no restrictions specified, allow access
    if (!allowedRoles && !allowedPosisi) {
      hasAccess = true;
    } else {
      // Check if user has allowed role
      if (allowedRoles && allowedRoles.includes(user.role)) {
        hasAccess = true;
      }

      // Check if user has allowed posisi
      if (allowedPosisi && user.posisi && allowedPosisi.includes(user.posisi)) {
        hasAccess = true;
      }
    }

    if (!hasAccess) {
      router.push('/dashboard');
      return;
    }

    setIsAuthorized(true);
    setIsLoading(false);
  }, [router, allowedRoles, allowedPosisi]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}

