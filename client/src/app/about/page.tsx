// src/app/about/page.tsx
import React, { Suspense } from 'react';
import Typography from '@mui/material/Typography';
import AccountAPI from 'api/AccountAPI';
import { Container, Box } from '@mui/material';

// Create a loader function to fetch users
async function loadUsersList() {
  try {
    const response = await AccountAPI.getAllUsers();
    return response.data;
  } catch (error) {
    console.error('Failed to load users:', error);
    return [];
  }
}
async function UsersList() {
  const usersList = await loadUsersList(); // This await will be handled by <Suspense>
  return (
    <Box>
      {usersList.map((user: string) => (
        <Typography key={user} variant="body1">
          {user}
        </Typography>
      ))}
    </Box>
  );
}

export default function AboutPage() {
  return (
    <Container maxWidth="sm" style={{ marginTop: '2rem' }}>
      <Typography variant="h3" gutterBottom>
        MapHub
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        List of all registered users
      </Typography>
      <Suspense fallback={<div>Loading...</div>}>
        <UsersList />
      </Suspense>
    </Container>
  );
}
