// "use client"
// import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
// import { Welcome } from '../components/Welcome/Welcome';
// import {NavbarNested} from '../components/Navbar/NavbarNested'

// import {TableSort} from '../components/UserTable/TableSort'
// import Stat from './stat/page'
// import AuthenticationTitle from './login/page'

// export default function HomePage() {
//   return (
//     <>
//       {/* <Welcome /> */}
//       {/* <TableSort/> */}
//       {/* <NavbarNested/> */}
//       {<AuthenticationTitle/>}
//       {/* <ColorSchemeToggle /> */}

//     </>
//   );
// }


"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from './utils/auth';

export default function HomePage() {
  const router = useRouter();
  
  useEffect(() => {
    if (isAuthenticated()) {
      router.replace('/stat');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      Loading...
    </div>
  );
}