export interface IEditPollCommand {
    readonly userId: string;
    readonly isUserRegistered: boolean;
    readonly pollId: string;
    readonly name?: string | undefined;
    readonly description?: string | null | undefined;
}
