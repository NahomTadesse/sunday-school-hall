"use client";
import {
    Anchor,
    Button,
    Checkbox,
    Container,
    Group,
    Paper,
    PasswordInput,
    Text,
    TextInput,
    Title,
} from '@mantine/core';
import classes from './AuthenticationTitle.module.css';
import { useRouter } from 'next/navigation';

export default function AuthenticationTitle() {
    const router = useRouter();

    const handleSignIn = () => {
        // You can include authentication logic here if needed
        router.push('/stat');
    };

    return (
        <Container size={420} my={40}>
            <Title ta="center" className={classes.title}>
                Welcome back!
            </Title>

            <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                <TextInput label="Email" placeholder="your email" required />
                <PasswordInput label="Password" placeholder="Your password" required mt="md" />
                <Group justify="space-between" mt="lg">
                    <Checkbox label="Remember me" />
                    <Anchor component="button" size="sm">
                        Forgot password?
                    </Anchor>
                </Group>
                <Button
                    onClick={handleSignIn}
                    fullWidth
                    mt="xl"
                >
                    Sign in
                </Button>
            </Paper>
        </Container>
    );
}