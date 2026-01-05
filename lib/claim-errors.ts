export class ClaimError extends Error {
    constructor(
        message: string,
        public code:
            | "GIFT_NOT_FOUND"
            | "CAMPAIGN_INACTIVE"
            | "INSUFFICIENT_QUANTITY"
            | "INVALID_INPUT"
            | "RATE_LIMIT"
            | "ALREADY_CLAIMED"
            | "FAMILY_NOT_FOUND"
            | "DATABASE_ERROR"
    ) {
        super(message);
        this.name = "ClaimError";
    }
}
