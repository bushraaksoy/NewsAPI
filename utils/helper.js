import { supportedMimes } from '../config/filesystem.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

export const imageValidator = (size, mime) => {
    if (bytesToMb(size) > 2) {
        return 'image size must be less that 2 MB';
    } else if (!supportedMimes.includes(mime)) {
        console.log('mime: ', mime);
        return 'File type is not supported, must be png, jpg, gif, svg, jpeg or webp...';
    }

    return null;
};

export const bytesToMb = (bytes) => {
    bytes / (1024 * 1024);
};

export const generateRandomNum = (filename) => {
    return uuidv4();
};

export const generateFileName = (originalName) => {
    const timestamp = Date.now();
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext);
    return `${baseName}-${timestamp}${ext}`;
};

export const getImageUrl = (filename) =>
    `${process.env.APP_URL}/images/${filename};`;

export const uploadImage = (image) => {
    const filename = generateFileName(image.name);
    const uploadPath = process.cwd() + '/public/images/' + filename;

    image.mv(uploadPath, (err) => {
        if (err) throw err;
    });

    return filename;
};

export const delelteImage = (filename) => {
    const path = process.cwd() + '/public/images/' + filename;
    // if the image exists in the path, it will be deleted
    if (fs.existsSync(path)) {
        fs.unlinkSync(path);
    }
};
