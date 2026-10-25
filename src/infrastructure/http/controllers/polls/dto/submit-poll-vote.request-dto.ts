import { IsArray, ArrayMinSize, ValidateNested, Equals } from 'class-validator';
import { Type } from 'class-transformer';
import { PollFormatsEnum } from '$components/survey-service/domain/poll/poll-formats.enum.js';
import { PollPlainOptionDataNestedDTO, PollElectionsOptionDataNestedDTO } from './poll-option-data.nested-dto.js';
import type {
    IPlainPollOptionDataWithFormat,
    IElectionsPollOptionDataWithFormat,
} from '$components/survey-service/domain/poll/factories/poll-option-data.dto.type.js';

export class SubmitVotingPollVoteRequestDTO implements IPlainPollOptionDataWithFormat {
    @Equals(PollFormatsEnum.VOTING, { message: 'Формат должен быть строго VOTING' })
    public readonly format!: typeof PollFormatsEnum.VOTING;

    @ValidateNested({ each: true })
    @ArrayMinSize(1, { message: 'Необходимо выбрать хотя бы одну опцию' })
    @IsArray({ message: 'Список опций должен быть массивом' })
    @Type(() => PollPlainOptionDataNestedDTO)
    public readonly optionDataList!: PollPlainOptionDataNestedDTO[];
}

export class SubmitElectionsPollVoteRequestDTO implements IElectionsPollOptionDataWithFormat {
    @Equals(PollFormatsEnum.ELECTIONS, { message: 'Формат должен быть "Выборы"' })
    public readonly format!: typeof PollFormatsEnum.ELECTIONS;

    @ValidateNested({ each: true })
    @ArrayMinSize(1, { message: 'Необходимо выбрать хотя бы одну опцию' })
    @IsArray({ message: 'Список опций должен быть массивом' })
    @Type(() => PollElectionsOptionDataNestedDTO)
    public readonly optionDataList!: PollElectionsOptionDataNestedDTO[];
}
