import prisma from '../DB/db.config.js';

class ProfileController {
    static async index(req, res) {
        try {
            const user = req.user;
            return res.json({ status: 200, user });
        } catch (error) {
            return res
                .status(500)
                .json({ status: 500, message: 'Server Error' });
        }
    }
}

export default ProfileController;
