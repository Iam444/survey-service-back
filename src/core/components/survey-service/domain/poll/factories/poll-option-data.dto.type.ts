import { PollFormatsEnum } from '$components/survey-service/domain/poll/poll-formats.enum.js';

export type TPollOptionDataDTO = IPlainPollOptionDataWithFormat | IElectionsPollOptionDataWithFormat;

export interface IPlainPollOptionDataWithFormat {
    readonly format: typeof PollFormatsEnum.VOTING;
    readonly optionDataList: IPollPlainOptionData[];
}

export interface IElectionsPollOptionDataWithFormat {
    readonly format: typeof PollFormatsEnum.ELECTIONS;
    readonly optionDataList: IPollElectionsOptionData[];
}

export interface IPollPlainOptionData {
    readonly name: string;
    readonly description: string | null;
}

export interface IPollElectionsOptionData extends IPollPlainOptionData {
    readonly candidateId: string;
}
