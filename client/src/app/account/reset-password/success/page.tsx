"use client"
import Link from 'next/link';
import { Button, Typography } from '@mui/material';

import styles from '../ui/resetPassword.module.css';
import containerstyles from '../../components/form.module.css';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

function Page() {

    const router = useRouter();

    const searchParams = useSearchParams();
    const usernameOrPassword = searchParams.get('query');


    const handleReturnToLogin = () => {
        router.replace('/account/login')
    }
    
    return (
        <div className={styles.container}>
        {/* <Typography className={styles.body} variant="body1" align="left">
            Join MapHub to edit maps in any way you can imagine. Get access to
            liking, commenting, and sharing others' maps.
        </Typography> */}
            <div className={containerstyles.container}>
                <Typography className={containerstyles.title} variant="h2">
                    Reset {usernameOrPassword}
                </Typography>
                <Typography className={containerstyles.title} variant='body1'>
                    Password has been reset successfully.
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

export default Page