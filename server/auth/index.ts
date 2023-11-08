// const jwt = require("jsonwebtoken")
import { Request, Response, NextFunction } from 'express';
import jwt, {Secret} from 'jsonwebtoken';
const jwtSecret =  process.env.JWT_SECRET ?? "AOIHFAOUHFSHUSDFWEIUFHEIOWJ"

function authManager() {
    const verify = (req : Request, res : Response, next : NextFunction) => {
        console.log("req: " + req);
        console.log("next: " + next);
        console.log("Who called verify?");
        try {
            const token = req.cookies.token;
            if (!token) {
                return res.status(401).json({
                    loggedIn: false,
                    user: null,
                    errorMessage: "Unauthorized"
                })
            }

            const secretOrPrivateKey: Secret | undefined = jwtSecret;

            if (!secretOrPrivateKey) {
                return res.status(500).json({
                    loggedIn: false,
                    user: null,
                    errorMessage: "JWT secret not configured"
                });
            }
            const verified = jwt.verify(token, secretOrPrivateKey) as jwt.JwtPayload;
            console.log("verified.userId: " + verified.userId);
            (req as any).userId = verified.userId;

            next();
        } catch (err) {
            console.error(err);
            return res.status(401).json({
                loggedIn: false,
                user: null,
                errorMessage: "Unauthorized"
            });
        }
    }

    const verifyUser = (req : Request) => {
        try {
            const token = req.cookies.token;
            if (!token) {
                return null;
            }

            const secretOrPublicKey: Secret | undefined = jwtSecret
            if (!secretOrPublicKey) {
                return null;
            }
            const decodedToken = jwt.verify(token, secretOrPublicKey, {
                ignoreExpiration: true
            }) as { userId: string } | undefined;
            return decodedToken?.userId || null;
        } catch (err) {
            return null;
        }
    }

    const signToken = (userId : string) => {
        return jwt.sign({
            userId: userId
        },jwtSecret as Secret);
    }

    return {
        verify,
        verifyUser,
        signToken
    }
}

const auth = authManager();
export default auth;
