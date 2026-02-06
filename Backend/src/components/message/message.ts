export interface IMessage {
    id?: number | null;
    thread_id: number;
    sender_id: number;
    message: string;
    sent_at?: string | Date | null;
}

export default class Message implements IMessage {
    id: number | null = null;
    thread_id: number = 0;
    sender_id: number = 0;
    message: string = "";
    sent_at: string | Date | null = null;

    constructor(init?: Partial<IMessage>) {
        if (init) {
            Object.assign(this, init);

            if (typeof init.sent_at === "string") {
                this.sent_at = new Date(init.sent_at);
            }
        }
    }
}
