import prisma from '../DB/db.config.js';
import vine, { errors } from '@vinejs/vine';
import { loginSchema, registerSchema } from '../validations/AuthValidation.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

class AuthController {
    static async register(req, res) {
        try {
            const body = req.body;
            const validator = vine.compile(registerSchema);
            const payload = await validator.validate(body);

            // Check if the email exists
            const findUser = await prisma.user.findUnique({
                where: {
                    email: payload.email,
                },
            });

            if (findUser) {
                return res.status(400).json({
                    errors: {
                        email: 'User with the email already exists, please use another one',
                    },
                });
            }

            // Encrypt the password
            const salt = bcrypt.genSaltSync(10);
            payload.password = bcrypt.hashSync(payload.password, salt);

            const user = await prisma.user.create({
                data: payload,
            });

            return res.json({
                status: 200,
                message: 'User created successfully',
                user,
            });
        } catch (error) {
            console.log('The error is', error);
            if (error instanceof errors.E_VALIDATION_ERROR) {
                return res.status(400).json({ errors: error.messages });
            } else {
                return res
                    .status(500)
                    .json({ status: 500, message: 'Server error' });
            }
        }
    }

    static async login(req, res) {
        try {
            const body = req.body;
            const validator = vine.compile(loginSchema);
            const payload = await validator.validate(body);

            // check if user with the email exists
            const user = await prisma.user.findUnique({
                where: {
                    email: payload.email,
                },
            });

            if (user) {
                if (!bcrypt.compareSync(payload.password, user.password)) {
                    return res.status(400).json({
                        errors: { password: 'Invalid Credentials' },
                    });
                }
                //  Issue token to the user

                const payloadData = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    profile: user.profile,
                };

                const token = jwt.sign(payloadData, process.env.JWT_KEY, {
                    expiresIn: '14d',
                });

                return res.json({
                    status: 200,
                    message: 'Logged in successfully',
                    access_token: `Bearer ${token}`,
                });
            }

            return res
                .status(400)
                .json({ errors: { email: 'No user found with this email' } });

            // return res.json({ payload, hash });
        } catch (error) {
            console.log('The error is', error);
            if (error instanceof errors.E_VALIDATION_ERROR) {
                return res.status(400).json({ errors: error.messages });
            } else {
                return res
                    .status(500)
                    .json({ status: 500, message: 'Server error' });
            }
        }
    }
}

export default AuthController;
