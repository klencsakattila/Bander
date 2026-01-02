import dotenv from "dotenv"
import path from "path"
dotenv.config()

class DBConfig {
    host: string;
    user: string;
    password: string;
    database: string;

    constructor() {
        this.host = process.env.DB_HOST ?? process.env.MYSQL_HOST ?? 'localhost';
        this.user = process.env.DB_USER ?? process.env.MYSQL_USER ?? 'root';
        this.password = process.env.DB_PASSWORD ?? process.env.MYSQL_PASSWORD ?? '';
        this.database = process.env.DATABASE ?? process.env.MYSQL_DATABASE ?? 'bander';
    }
}

const config: any = {
    jwtSecret: process.env.JWT_SECRET,
    database: new DBConfig(),
    maxSize: parseInt(process.env.MAX_FILE_SIZE ?? "2097152"),
    baseDir:     path.win32.resolve(__dirname,"../../"),
    uploadDir: process.env.UPLOAD_DIR_NAME ?? "/uploads/"

}
export default config
