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

        const decodedToken = jwt.verify(token, config.jwtSecret) as any;
        
        if(!decodedToken || !decodedToken.id){
            res.status(403).send("Invalid token: missing user data.");
            return;
        }

        if(typeof decodedToken.id !== 'number' || isNaN(decodedToken.id)){
            res.status(403).send("Invalid token: invalid user ID.");
            return;
        }

        req.user = decodedToken;

        return next();
    }
    catch(err){
        console.log(err);
        res.status(403).send("Invalid or expired token.");
    }
};

export function ensureAdmin(req: any, res: any, next: any) {
    if (!req.user || !req.user.is_admin) {
        res.status(403).send("Admin access required.");
        return;
    }

    return next();
}