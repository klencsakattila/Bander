export interface IGenre {
    id?: number | null;
    name: string;
}

export default class Genre implements IGenre {
    id: number | null = null;
    name: string = "";

    constructor(init?: Partial<IGenre>) {
        if (init) {
            Object.assign(this, init);
        }
    }
}
