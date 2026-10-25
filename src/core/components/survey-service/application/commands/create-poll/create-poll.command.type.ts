import type { PollFormatsEnum } from '$components/survey-service/domain/poll/poll-formats.enum.js';
import type {
    IPollPlainOptionData,
    IPollElectionsOptionData,
    TPollOptionDataDTO,
} from '$components/survey-service/domain/poll/factories/poll-option-data.dto.type.js';
import type { IPollSettingsDataDTO } from '$components/survey-service/domain/poll/factories/poll-settings-data.dto.interface.js';

export type TCreatePollCommand = ICreatePollCommand & TPollOptionDataDTO;

interface ICreatePollCommand {
    readonly userId: string;
    readonly name: string;
    readonly description: string | null;
    readonly settings: IPollSettingsDataDTO;
}

export interface ICreatePlainPollCommand extends ICreatePollCommand {
    readonly format: typeof PollFormatsEnum.VOTING;
    readonly optionDataList: IPollPlainOptionData[];
}

export interface ICreateElectionsPollCommand extends ICreatePollCommand {
    readonly format: typeof PollFormatsEnum.ELECTIONS;
    readonly optionDataList: IPollElectionsOptionData[];
}
