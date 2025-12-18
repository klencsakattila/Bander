export interface IUser {
    id?: number | null;
    username: string;
    email: string;
    password_hash: string;
    first_name?: string | null;
    last_name?: string | null;
    city?: string | null;
    birth_date?: string | Date | null; // A SQL DATE stringként érkezik, de Date-ként is kezelhető
    created_at?: string | Date | null;
}

export default class User implements IUser {
    id: number | null = null;
    username: string = "";
    email: string = "";
    password_hash: string = "";
    first_name: string | null = null;
    last_name: string | null = null;
    city: string | null = null;
    birth_date: string | Date | null = null;
    created_at: string | Date | null = null;

    constructor(init?: Partial<IUser>) {
        if (init) {
            Object.assign(this, init);
            
            // Ha a birth_date stringként jön (pl. API-ból), itt konvertálhatod Date objektummá igény szerint:
            if (typeof init.birth_date === 'string') {
                this.birth_date = new Date(init.birth_date);
            }
        }
    }
}