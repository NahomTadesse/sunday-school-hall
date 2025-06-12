import { IconChevronRight } from '@tabler/icons-react';
import { Avatar, Group, Text, UnstyledButton } from '@mantine/core';
import classes from './UserButton.module.css';

import Cookies from 'js-cookie';

const userDataString = Cookies.get('userData');
const userData = userDataString ? JSON.parse(userDataString) : null; 
console.log("hello",userData)



export function UserButton() {
  return (
    <UnstyledButton className={classes.user}>
      <Group>
        <Avatar
          src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-1.png"
          radius="xl"
        />

        <div style={{ flex: 1 }}>
          <Text size="sm" fw={500}>
          {userData && userData.username || 'Name'}
          {/* ADMIN NAME */}
          </Text>

          <Text c="dimmed" size="xs">
          {userData && userData.phoneNumber || 'number'}
          {/* ADMIN PHONE */}
          </Text>
        </div>

        <IconChevronRight size={14} stroke={1.5} />
      </Group>
    </UnstyledButton>
  );
}