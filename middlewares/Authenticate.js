import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader === null || authHeader === undefined) {
        return res.status(401).json({ status: 401, message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    // verify the jwt token
    jwt.verify(token, process.env.JWT_KEY, (err, user) => {
        if (err)
            return res
                .status(401)
                .json({ status: 401, message: 'Unautharized' });

        req.user = user; // middleware, so if jwt is valild, the middleware just assigns the req user to be the decoded user here
        next();
    }); // user is the decoded version of the jwt token, since when we sign it, we add the user data in the signature, decoding it gives us the user details
};

export default authMiddleware;
