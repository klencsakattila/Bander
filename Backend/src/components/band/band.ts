export interface IBand {
    id: number | undefined | null;
    name: string;
    city: string | null;
    created_at: Date | string | null;
}

export default class Band implements IBand {
    id: number | undefined | null;
    name: string = "";
    city: string | null = null;
    created_at: Date | string | null = null;

    constructor(init?: IBand) {
        if (init) {
            Object.assign(this, init as Partial<Band>);
            
            // Ha a dátum stringként jön az adatbázisból, 
            // opcionálisan átalakíthatod valódi Date objektummá:
            if (typeof init.created_at === "string") {
                this.created_at = new Date(init.created_at);
            }
        }
    }
}