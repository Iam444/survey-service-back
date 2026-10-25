import { IsEnum } from 'class-validator';
import { PollStatusesEnum } from '$components/survey-service/domain/poll/poll-statuses.enum.js';
import type { TPollStatus } from '$components/survey-service/domain/poll/poll-statuses.enum.js';
import type { IChangePollStatusCommand } from '$components/survey-service/application/commands/change-poll-status/change-poll-status.command.interface.js';

export class ChangePollStatusRequestDTO implements Pick<IChangePollStatusCommand, 'status'> {
    @IsEnum(PollStatusesEnum, {
        message: `Статус должен быть одним из следующих значений: ${Object.values(PollStatusesEnum).join(', ')}`,
    })
    public readonly status!: TPollStatus;
}
