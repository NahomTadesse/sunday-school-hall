// "use client";
// import {
//     Anchor,
//     Button,
//     Checkbox,
//     Container,
//     Group,
//     Loader,
//     Paper,
//     PasswordInput,
//     Text,
//     TextInput,
//     Title,
//     Notification,
//     Overlay,
// } from '@mantine/core';
// import classes from './AuthenticationTitle.module.css';
// import { useRouter } from 'next/navigation';
// import { useEffect, useState } from 'react';
// import Cookies from 'js-cookie'; // Import js-cookie

// export default function AuthenticationTitle() {
//     const router = useRouter();
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [loading, setLoading] = useState(false);
//     const [notification, setNotification] = useState({ visible: false, message: '', color: '' });
//     const [rememberMe, setRememberMe] = useState(false);

//     useEffect(() => {
//         const storedEmail = localStorage.getItem('email');
//         if (storedEmail) {
//             setEmail(storedEmail);
//             setRememberMe(true); // Set checkbox to checked if email exists
//         }
//     }, []);

//     const handleSignIn = async () => {
//         setLoading(true);
//         setNotification({ visible: false, message: '', color: '' });

//         const body = {
//             principal: email,
//             password: password,
//         };

//         try {
//             const response = await fetch('https://hall-api.hohitebirhan.com/api/v1/auth/login', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(body),
//             });

//             if (response.ok) {
//                 const data = await response.json();
//                 console.log("Login successful:", data);
                
//                 // Store email in local storage if "Remember Me" is checked
//                 if (rememberMe) {
//                     localStorage.setItem('email', email);
//                 } else {
//                     localStorage.removeItem('email'); // Clear email if not remembered
//                 }

//                 // Set cookies for the login response
//                 Cookies.set('userData', JSON.stringify(data)); 
             

//                 router.push('/stat');
//             } else {
//                 const errorData = await response.json();
//                 setNotification({ visible: true, message: `Error: ${errorData.message}`, color: 'red' });
//             }
//         } catch (error) {
//             setNotification({ visible: true, message: 'Network error. Please try again.', color: 'red' });
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <Container size={420} my={40}>
//             <Title ta="center" className={classes.title}>
//                 Welcome back!
//             </Title>

//             <Paper withBorder shadow="md" p={30} mt={30} radius="md">
//                 {notification.visible && (
//                     <Notification color={notification.color} onClose={() => setNotification({ ...notification, visible: false })}>
//                         {notification.message}
//                     </Notification>
//                 )}
//                 <TextInput 
//                     label="Email" 
//                     placeholder="your email" 
//                     required 
//                     value={email}
//                     onChange={(event) => setEmail(event.currentTarget.value)}
//                 />
//                 <PasswordInput 
//                     label="Password" 
//                     placeholder="Your password" 
//                     required 
//                     mt="md" 
//                     value={password}
//                     onChange={(event) => setPassword(event.currentTarget.value)}
//                 />
//                 <Group justify="space-between" mt="lg">
//                     <Checkbox 
//                         label="Remember me" 
//                         checked={rememberMe}
//                         onChange={(event) => setRememberMe(event.currentTarget.checked)} 
//                     />
//                     <Anchor  onClick={()=>{router.push('/forgetpass')}} component="button" size="sm">
//                         Forgot password?
//                     </Anchor>
//                 </Group>
//                 <Button
//                     onClick={handleSignIn}
//                     fullWidth
//                     mt="xl"
//                     disabled={loading}
//                 >
//                     {loading ? <Loader size="sm" /> : 'Sign in'}
//                 </Button>
//             </Paper>

//             {loading && (
//                 <Overlay
//                     opacity={0.6}
//                     color="#000"
//                     zIndex={1000}
//                     style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
//                 >
//                     <Loader size="xl" />
//                 </Overlay>
//             )}
//         </Container>
//     );
// }

"use client";
import {
    Anchor,
    Button,
    Checkbox,
    Container,
    Group,
    Loader,
    Paper,
    PasswordInput,
    Text,
    TextInput,
    Title,
    Notification,
    Overlay,
} from '@mantine/core';
import classes from './AuthenticationTitle.module.css';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { setAuthData } from '../utils/auth';

export default function AuthenticationTitle() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ visible: false, message: '', color: '' });
    const [rememberMe, setRememberMe] = useState(false);

    useEffect(() => {
        const storedEmail = localStorage.getItem('email');
        if (storedEmail) {
            setEmail(storedEmail);
            setRememberMe(true);
        }
    }, []);

    const handleSignIn = async () => {
        setLoading(true);
        setNotification({ visible: false, message: '', color: '' });

        const body = {
            principal: email,
            password: password,
        };

        try {
            const response = await fetch('https://hall-api.hohitebirhan.com/api/v1/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Login successful:", data);
                
                // Store email in local storage if "Remember Me" is checked
                if (rememberMe) {
                    localStorage.setItem('email', email);
                } else {
                    localStorage.removeItem('email');
                }

                // Set auth data in cookies
                setAuthData(data, rememberMe);

                router.push('/stat');
            } else {
                const errorData = await response.json();
                setNotification({ visible: true, message: `Error: ${errorData.message}`, color: 'red' });
            }
        } catch (error) {
            setNotification({ visible: true, message: 'Network error. Please try again.', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container size={420} my={40}>
            <Title ta="center" className={classes.title}>
                Welcome back!
            </Title>

            <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                {notification.visible && (
                    <Notification color={notification.color} onClose={() => setNotification({ ...notification, visible: false })}>
                        {notification.message}
                    </Notification>
                )}
                <TextInput 
                    label="Email" 
                    placeholder="your email" 
                    required 
                    value={email}
                    onChange={(event) => setEmail(event.currentTarget.value)}
                />
                <PasswordInput 
                    label="Password" 
                    placeholder="Your password" 
                    required 
                    mt="md" 
                    value={password}
                    onChange={(event) => setPassword(event.currentTarget.value)}
                />
                <Group justify="space-between" mt="lg">
                    <Checkbox 
                        label="Remember me" 
                        checked={rememberMe}
                        onChange={(event) => setRememberMe(event.currentTarget.checked)} 
                    />
                    <Anchor onClick={()=>{router.push('/forgetpass')}} component="button" size="sm">
                        Forgot password?
                    </Anchor>
                </Group>
                <Button
                    onClick={handleSignIn}
                    fullWidth
                    mt="xl"
                    disabled={loading}
                >
                    {loading ? <Loader size="sm" /> : 'Sign in'}
                </Button>
            </Paper>

            {loading && (
                <Overlay
                    opacity={0.6}
                    color="#000"
                    zIndex={1000}
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <Loader size="xl" />
                </Overlay>
            )}
        </Container>
    );
}