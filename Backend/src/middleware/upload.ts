import fs from "fs";
import path from "path";
import multer from "multer";
import config from "../config/config";

const allowedMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif"
]);

function normalizeDirName(dirName: string): string {
    return dirName.replace(/^[/\\]+/, "").replace(/[/\\]+$/, "");
}

export function getUploadRootDir(): string {
    const uploadDirName = normalizeDirName(config.uploadDir ?? "uploads");
    return path.join(config.baseDir, uploadDirName);
}

function ensureDirExists(dirPath: string): void {
    if(!fs.existsSync(dirPath)){
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

export function toPublicUrl(subdir: string, filename: string): string {
    const cleanSubdir = normalizeDirName(subdir);
    return `/uploads/${cleanSubdir}/${filename}`;
}

export function createImageUpload(subdir: string) {
    const cleanSubdir = normalizeDirName(subdir);

    const storage = multer.diskStorage({
        destination: (_req, _file, cb) => {
            const uploadRoot = getUploadRootDir();
            const destinationPath = path.join(uploadRoot, cleanSubdir);
            ensureDirExists(destinationPath);
            cb(null, destinationPath);
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase();
            const baseName = path
                .basename(file.originalname, ext)
                .replace(/[^a-zA-Z0-9_-]/g, "")
                .slice(0, 32);
            const idPart = req.params && req.params.id ? `_${req.params.id}` : "";
            const safeBase = baseName.length > 0 ? baseName : "image";
            const fileName = `${Date.now()}${idPart}_${safeBase}${ext}`;
            cb(null, fileName);
        }
    });

    return multer({
        storage,
        limits: {
            fileSize: config.maxSize
        },
        fileFilter: (_req, file, cb) => {
            if(!allowedMimeTypes.has(file.mimetype)){
                cb(new Error("Only image uploads are allowed."));
                return;
            }
            cb(null, true);
        }
    });
}
