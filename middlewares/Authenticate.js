import jwt, { verify } from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader === null || authHeader === undefined) {
        return res.status(401).json({ status: 401, message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    // verify the jwt token
    jwt.verify(token, process.env.JWT_KEY, (err, user)); // user is the decoded version of the jwt token, since when we sign it, we add the user data in the signature, decoding it gives us the user details
};
