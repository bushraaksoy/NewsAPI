import prisma from '../DB/db.config.js';
import { generateFileName, imageValidator } from '../utils/helper.js';

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

    static async store(req, res) {}
    static async show(req, res) {}

    static async update(req, res) {
        try {
            const { id } = req.params;
            const authUser = req.user;

            if (!req.files) {
                return res.status(400).json({
                    status: 400,
                    message: 'Profile image is required',
                });
            }
            const profile = req.files.profile;
            const message = imageValidator(profile?.size, profile.mimetype);
            if (message != null) {
                return res.status(400).json({ errors: { profile: message } });
            }

            const fileName = generateFileName(profile.name);
            const uploadPath = process.cwd() + '/public/images/' + fileName;

            // upload the image to directory

            profile.mv(uploadPath, (err) => {
                if (err) throw err;
            });

            await prisma.user.update({
                where: { id: Number(id) },
                data: { profile: fileName, updated_at: new Date() },
            });

            return res.json({
                status: 200,
                message: 'Profile updated successfully',
            });
        } catch (error) {
            console.log('the error is: ', error);
            return res
                .status(500)
                .json({ status: 500, message: 'Something went wrong' });
        }
    }

    static async destroy(req, res) {}
}

export default ProfileController;
