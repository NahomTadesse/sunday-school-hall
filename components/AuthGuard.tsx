// "use client";
// import { useEffect, useState } from 'react';
// import { useRouter, usePathname } from 'next/navigation';
// import { isAuthenticated } from '../app/utils/auth';
// import { Center, Loader } from '@mantine/core';

// export default function AuthGuard({ children }: { children: React.ReactNode }) {
//   const router = useRouter();
//   const pathname = usePathname();
//   const [isChecking, setIsChecking] = useState(true);

//   useEffect(() => {
//     const checkAuth = () => {
//       const authenticated = isAuthenticated();
      
//       // If not authenticated and trying to access protected route
//       if (!authenticated && pathname !== '/' && pathname !== '/forgetpass') {
//         router.push('/');
//       }
      
//       // If authenticated and trying to access login/forgetpass page
//       if (authenticated && (pathname === '/' || pathname === '/forgetpass')) {
//         router.push('/stat');
//       }
      
//       setIsChecking(false);
//     };

//     checkAuth();
//   }, [pathname, router]);

//   if (isChecking) {
//     return (
//       <Center style={{ height: '100vh' }}>
//         <Loader size="xl" />
//       </Center>
//     );
//   }

//   return <>{children}</>;
// }



"use client";
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated } from '../app/utils/auth';
import { Center, Loader } from '@mantine/core';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      
      // Public routes that don't require authentication
      const publicRoutes = ['/', '/login', '/forgetpass'];
      const isPublicRoute = publicRoutes.includes(pathname);
      
      // If not authenticated and trying to access protected route
      if (!authenticated && !isPublicRoute) {
        router.replace('/login');
      }
      
      // If authenticated and trying to access login page
      if (authenticated && isPublicRoute && pathname !== '/forgetpass') {
        router.replace('/stat');
      }
      
      setIsChecking(false);
    };

    checkAuth();
  }, [pathname, router]);

  if (isChecking) {
    return (
      <Center style={{ height: '100vh' }}>
        <Loader size="xl" />
      </Center>
    );
  }

  return <>{children}</>;
}