'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, getUser } from '@/lib/auth';
import { hasAccess } from '@/lib/access-control';

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

    // Check authorization using access control helper
    const userHasAccess = hasAccess(
      user.role,
      user.posisi || '',
      allowedRoles,
      allowedPosisi
    );

    // Debug logging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('ProtectedRoute check:', {
        userRole: user.role,
        userPosisi: user.posisi,
        allowedRoles,
        allowedPosisi,
        hasAccess: userHasAccess
      });
    }

    if (!userHasAccess) {
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

