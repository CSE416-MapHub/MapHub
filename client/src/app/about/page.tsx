import React, { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import AccountAPI from 'api/AccountAPI';

export default function AboutPage() {
  const [usersList, setUsersList] = useState<Array<string>>([])
  useEffect(() => {
    AccountAPI.getAllUsers().then((r) => {
      setUsersList(r.data)
    })
  })
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Typography style={{ fontSize: '2rem' }}>MapHub</Typography>
      <Typography>List of all registered users</Typography>
      {usersList.map((x) => 
        <p> {x} </p>
      )}
    </main>
  );
}
