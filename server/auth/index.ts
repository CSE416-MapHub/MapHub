// const jwt = require("jsonwebtoken")
import { Request, Response, NextFunction } from 'express';
import User from '../models/user-model';
import jwt, { Secret } from 'jsonwebtoken';
const jwtSecret = process.env.JWT_SECRET ?? 'AOIHFAOUHFSHUSDFWEIUFHEIOWJ';

function authManager() {
  const verify = async (req: Request, res: Response, next: NextFunction) => {
    console.log('req: ' + req.cookies);
    try {
      const token = req.cookies.token;
      if (!token) {
        return res.status(401).json({
          loggedIn: false,
          user: null,
          errorMessage: 'Unauthorized',
        });
      }

      const secretOrPrivateKey: Secret | undefined = jwtSecret;

      if (!secretOrPrivateKey) {
        return res.status(500).json({
          loggedIn: false,
          user: null,
          errorMessage: 'JWT secret not configured',
        });
      }
      const verified = jwt.verify(token, secretOrPrivateKey) as jwt.JwtPayload;
      console.log('decrypted userId: ' + verified.userId);

      // Verify if user exists in the database
      const user = await User.findById(verified.userId);
      if (!user) {
        return res.status(401).json({
          loggedIn: false,
          user: null,
          errorMessage: 'User not found',
        });
      }

      // Add user information to the request object
      (req as any).user = user;
      (req as any).userId = verified.userId;
      console.log('USER FOUND');
      next();
    } catch (err) {
      console.error(err);
      return res.status(401).json({
        loggedIn: false,
        user: null,
        errorMessage: 'Unauthorized',
      });
    }
  };

  const verifyUser = async (request: Request) => {
    try {
      const token = request.cookies.token;
      if (!token) {
        return null;
      }
      return jwt.verify(token, jwtSecret) as jwt.JwtPayload;
    } catch (error) {
      return null;
    }
  };

  const signToken = (userId: string) => {
    return jwt.sign(
      {
        userId: userId,
      },
      jwtSecret as Secret,
    );
  };

  return {
    verify,
    verifyUser,
    signToken,
  };
}

const auth = authManager();
export default auth;
