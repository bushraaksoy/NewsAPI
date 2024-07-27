import { getImageUrl } from '../utils/helper.js';

class NewsApiTransform {
    static transform(news) {
        return {
            id: news.id,
            heading: news.title,
            content: news.content,
            image: getImageUrl(news.image),
            created_at: news.created_at,
            reporter: {
                id: news?.user.id,
                name: news?.user.name,
                profile:
                    news?.user?.profile != null
                        ? getImageUrl(news.user.profile)
                        : 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/User-avatar.svg/2048px-User-avatar.svg.png',
            },
        };
    }
}

export default NewsApiTransform;
