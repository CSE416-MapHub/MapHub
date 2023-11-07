'use client'

import React, { Suspense, useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import { Container, Box } from '@mui/material';
import AccountAPI from 'api/AccountAPI'; // Adjust the import path as needed

interface User {
  username: string;
  email: string;
  password: string;
  profilePic: Buffer;
  maps: string[];
}


const UsersList: React.FC = () => {
  const [usersList, setUsersList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Fetch user data from the server using AccountAPI.getAllUsers()
    AccountAPI.getAllUsers()
      .then((response) => {
        setUsersList(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      {usersList.map((user, index) => (
        <Typography key={index} variant="body1">
          {user.username}
        </Typography>
      ))}
    </Box>
  );
};

const AboutPage: React.FC = () => {
  return (
    <Container maxWidth="sm" style={{ marginTop: '2rem' }}>
      <Typography variant="h3" gutterBottom>
        MapHub
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        List of all registered users
      </Typography>
      <Suspense fallback={<Typography>Loading...</Typography>}>
        <UsersList />
      </Suspense>
    </Container>
  );
};

export default AboutPage;
