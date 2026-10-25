export interface IUserPreviewReadModel {
    readonly id: string;
    readonly email: string;
    readonly name: string;
    readonly surname: string | null;
    readonly fullName: string;
    readonly phone: string | null;
    readonly avatarUrl: string | null;
}
