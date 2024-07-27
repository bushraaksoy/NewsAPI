import vine, { errors } from '@vinejs/vine';
import prisma from '../DB/db.config.js';
import { newsSchema } from '../validations/NewsValidation.js';
import { generateFileName, imageValidator } from '../utils/helper.js';
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

            const fileName = generateFileName(image.name);
            const uploadPath = process.cwd() + '/public/images/' + fileName;

            image.mv(uploadPath, (err) => {
                if (err) throw err;
            });

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

            if (req.files) {
                const image = req.files?.image;
                const message = imageValidator(image?.size, image?.mimetype);

                if (!message === null) {
                    return res.status(400).json({ status: 400, message });
                }
                const fileName = generateFileName(image.name);
                const uploadPath = process.cwd() + '/public/images' + fileName;

                image.mv(uploadPath, (err) => {
                    if (err) throw err;
                });
                body.image = image;
            }

            body.updated_at = new Date();

            const news = await prisma.news.update({
                where: {
                    id: Number(id),
                },
                data: body,
            });

            if (user_id != user.id)
                res.json({
                    status: 200,
                    message: 'News updated successfully',
                    news,
                });
        } catch (error) {
            return res
                .status(500)
                .json({ status: 500, message: 'Something went wrong' });
        }
    }
    static async destroy(req, res) {
        try {
            const id = req.params.id;

            const news = prisma.news.findUnique({ where: { id: Number(id) } });

            if (!news) {
                return res
                    .status(400)
                    .json({ status: 400, message: 'News not found' });
            }

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
