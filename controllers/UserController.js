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
                return res.json({ status: 200, data: user });
            }

            return res
                .status(400)
                .json({ status: 400, message: 'User not found' });
        } catch (error) {
            return res
                .status(500)
                .json({ status: 500, message: 'Server Error' });
        }
    }

    static async getAllUsers(req, res) {
        try {
            const users = await prisma.user.findMany();

            return res.json({ status: 200, data: users });
        } catch (error) {
            return res
                .status(500)
                .json({ status: 500, message: 'Server Error' });
        }
    }
}

export default UserController;
