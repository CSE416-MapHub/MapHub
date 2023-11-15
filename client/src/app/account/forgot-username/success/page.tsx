"use client"
import Link from 'next/link';
import { Button, Typography } from '@mui/material';

import styles from '../ui/forgotUsername.module.css';
import containerstyles from '../../components/form.module.css';
import { useRouter } from 'next/navigation';

function Page() {

    const router = useRouter();

    const handleReturnToLogin = () => {
        router.back();
        router.back();
    }
    return (
        <div className={styles.container}>
        {/* <Typography className={styles.body} variant="body1" align="left">
            Join MapHub to edit maps in any way you can imagine. Get access to
            liking, commenting, and sharing others' maps.
        </Typography> */}
            <div className={containerstyles.container}>
                <Typography className={containerstyles.title} variant="h2">
                    Reset Username
                </Typography>
                <Typography className={containerstyles.title} variant='body1'>
                    Username sent to provided email.
                </Typography>
                <Button 
                    className={containerstyles.confirmButton}
                    variant="contained"
                    onClick={handleReturnToLogin}
                >
                    Return to Login
                </Button>
            </div>
        </div>
    );
}

export default Page;