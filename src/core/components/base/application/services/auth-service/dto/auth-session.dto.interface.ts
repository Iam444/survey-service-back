export interface IAuthSessionDTO {
    readonly id: string;
    readonly userId: string;
    readonly tokenHash: string;
    readonly expiresAt: Date;
    readonly createdAt: Date;
}
