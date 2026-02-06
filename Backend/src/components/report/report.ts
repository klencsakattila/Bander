export interface IReport {
    id?: number | null;
    reporter_id: number;
    reported_user_id?: number | null;
    reported_band_id?: number | null;
    reported_post_id?: number | null;
    report_status?: string | null;
    report_message: string;
    created_at?: string | Date | null;
}

export default class Report implements IReport {
    id: number | null = null;
    reporter_id: number = 0;
    reported_user_id: number | null = null;
    reported_band_id: number | null = null;
    reported_post_id: number | null = null;
    report_status: string | null = null;
    report_message: string = "";
    created_at: string | Date | null = null;

    constructor(init?: Partial<IReport>) {
        if (init) {
            Object.assign(this, init);

            if (typeof init.created_at === "string") {
                this.created_at = new Date(init.created_at);
            }
        }
    }
}
