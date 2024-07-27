import vine, { errors } from '@vinejs/vine';
import prisma from '../DB/db.config.js';
import { newsSchema } from '../validations/NewsValidation.js';
import { delelteImage, imageValidator, uploadImage } from '../utils/helper.js';
import NewsApiTransform from '../transform/NewsApiTransform.js';

class NewsController {
    static async index(req, res) {
        try {
            const page = Number(req.query.page) || 1;
            let limit = Number(req.query.limit) || 1;

            if (page <= 0) {
                page = 1;
            }

            if (limit <= 0 || limit > 100) {
                console.log('limit: ', limit);
                limit = 10;
            }

            const skip = (page - 1) * limit;

            const news = await prisma.news.findMany({
                take: limit,
                skip: skip,
                include: {
                    user: { select: { id: true, name: true, profile: true } },
                },
            });

            if (!news) {
                return res
                    .status(400)
                    .json({ status: 400, message: 'There are no News' });
            }

            const newsTransform = news?.map((news) =>
                NewsApiTransform.transform(news)
            );

            const totalNews = await prisma.news.count();
            const totalPages = Math.ceil(totalNews / limit);

            return res.json({
                status: 200,
                news: newsTransform,
                metadata: {
                    totalPages,
                    currentPage: page,
                    currentLimit: limit,
                },
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ status: 500, message: 'Something went wrong' });
        }
    }

    static async store(req, res) {
        try {
            const user = req.user;
            const body = req.body;

            const validator = vine.compile(newsSchema);
            const payload = await validator.validate(body);

            console.log('request: ', body);

            if (!req.files) {
                return res.status(400).json({
                    errors: { image: 'Image file is required' },
                });
            }

            const image = req.files?.image;

            const message = imageValidator(image?.size, image?.mimetype);
            if (message != null) {
                return res.status(400).json({ errors: { image: message } });
            }

            //  image upload

            const fileName = uploadImage(image);

            payload.image = fileName;
            payload.user_id = user.id;

            const news = await prisma.news.create({
                data: payload,
            });

            return res.json({
                status: 200,
                message: 'News created successfully',
                news,
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

    static async show(req, res) {
        try {
            const id = req.params.id;

            const news = await prisma.news.findUnique({
                include: {
                    user: { select: { id: true, name: true, profile: true } },
                },
                where: {
                    id: Number(id),
                },
            });

            if (!news) {
                return res
                    .status(400)
                    .json({ status: 400, message: 'News not found' });
            }

            const newsTransform = NewsApiTransform.transform(news);

            return res.json({ status: 200, news: newsTransform });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ status: 500, message: 'Something went wrong' });
        }
    }

    static async update(req, res) {
        try {
            const id = req.params.id;
            const body = req.body;
            const user = req.user;

            const news = await prisma.news.findUnique({
                where: { id: Number(id) },
            });
            console.log(news);

            // if user is not creator of the news, return unauthorized

            console.log(news.user_id, user.id);

            if (news.user_id != user.id) {
                return res
                    .status(400)
                    .json({ status: 401, message: 'Unautharized user' });
            }

            const validator = vine.compile(newsSchema);
            const payload = await validator.validate(body);

            // if request has image file, generate file name and upload

            const image = req?.files?.image;

            if (image) {
                // check if image is valid file type
                const message = imageValidator(image?.size, image?.mimetype);

                if (!message === null) {
                    return res.status(400).json({ status: 400, message });
                }
                // upload image
                const filename = uploadImage(image);
                payload.image = filename;

                // if user is updating image and image is valid, delete old image
                delelteImage(news.image);
            }

            payload.updated_at = new Date();

            await prisma.news.update({
                where: {
                    id: Number(id),
                },
                data: payload,
            });

            return res.json({
                status: 200,
                message: 'News updated successfully',
                news,
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

    static async destroy(req, res) {
        try {
            const id = req.params.id;
            const user = req.user;

            const news = prisma.news.findUnique({ where: { id: Number(id) } });

            if (!news) {
                return res
                    .status(400)
                    .json({ status: 400, message: 'News not found' });
            }

            if (user.id !== news.user_id) {
                return res
                    .status(400)
                    .json({ status: 401, message: 'Unautharized user' });
            }

            delelteImage(news.image);

            await prisma.news.delete({
                where: {
                    id: Number(id),
                },
            });
            return res.json({
                status: 200,
                message: 'News deleted successfully',
            });
        } catch (error) {
            return res
                .status(500)
                .json({ status: 500, message: 'Something went wrong' });
        }
    }
}

export default NewsController;
