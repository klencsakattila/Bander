import jwt from 'jsonwebtoken';
import config from "../config/config";

export function verifyToken(req: any, res: any, next: any) {
    const token = req.body?.token || req.query?.token || req.headers?.['x-access-token'];

    if(!token){
        res.status(403).send("Token needed.");
        return;
    };

    try{
        if(!config.jwtSecret){
            res.status(500).send("Theres is an error in the secret key.");
            return;
        };

        const decodedToken = jwt.verify(token, config.jwtSecret);
        req.user = decodedToken;

        return next();
    }
    catch(err){
        console.log(err);
    }
};