export interface IInstrument {
    id?: number | null;
    name: string;
}

export default class Instrument implements IInstrument {
    id: number | null = null;
    name: string = "";

    constructor(init?: Partial<IInstrument>) {
        if (init) {
            Object.assign(this, init);
        }
    }
}
