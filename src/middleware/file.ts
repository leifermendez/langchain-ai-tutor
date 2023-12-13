import { Request } from "express";
import multer, { diskStorage } from "multer";

const PATH_STORAGE = `${process.cwd()}/data`;

const storage = diskStorage({
    destination(_: Request, __: Express.Multer.File, cb: any) {
        cb(null, PATH_STORAGE);
    },
    filename(_: Request, file: Express.Multer.File, cb: any) {
        const ext = file.originalname.split(".").pop();
        const fileNameRandom = `file-${Date.now()}.${ext}`;
        cb(null, fileNameRandom);
    },
});

const multerMiddleware = multer({ storage });

export default multerMiddleware;