export interface IThread {
    id?: number | null;
    created_at?: string | Date | null;
}

export default class Thread implements IThread {
    id: number | null = null;
    created_at: string | Date | null = null;

    constructor(init?: Partial<IThread>) {
        if (init) {
            Object.assign(this, init);

            if (typeof init.created_at === "string") {
                this.created_at = new Date(init.created_at);
            }
        }
    }
}
