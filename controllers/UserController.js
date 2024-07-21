import prisma from '../DB/db.config.js';

class UserController {
    static async getUser(req, res) {
        const userId = req.params.id;

        try {
            const user = await prisma.user.findUnique({
                where: {
                    id: Number(userId),
                },
            });

            if (user) {
                res.json({ status: 200, data: user });
            }
            res.status(400).json({ status: 400, message: 'User not found' });
        } catch (error) {
            res.status(500).json({ status: 500, message: 'Server Error' });
        }
    }

    static async getAllUsers(req, res) {
        try {
            const users = await prisma.user.findMany();

            res.json({ status: 200, data: users });
        } catch (error) {
            res.status(500).json({ status: 500, message: 'Server Error' });
        }
    }
}

export default UserController;
