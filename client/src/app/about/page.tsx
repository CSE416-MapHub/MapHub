import React, { Suspense } from 'react';
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

// A resource to fetch and store the users
const usersResource = (() => {
  let promise: Promise<User[] | null> | null = null;
  let result: User[] | null = null;

  return {
    read(): User[] {
      if (result) {
        console.log(result)
        return result;
      } else if (!promise) {
        promise = AccountAPI.getAllUsers().then(
          (response) => {
            result = response.data;
            console.log(result)
            return result;
          },
          (error) => {
            result = null;
            throw error;
          }
        );
        throw promise;
      } else {
        throw promise;
      }
    },
  };
})();

const UsersList: React.FC = () => {
  // Read the users data, which might throw a promise
  const usersList = usersResource.read();
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
