import { IsString, Length, IsOptional, Equals, ValidateNested, IsObject, ArrayMinSize, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { PollFormatsEnum } from '$components/survey-service/domain/poll/poll-formats.enum.js';
import { PollSettingsDataNestedDTO } from './poll-settings-data.nested-dto.js';
import { PollPlainOptionDataNestedDTO, PollElectionsOptionDataNestedDTO } from './poll-option-data.nested-dto.js';
import type {
    ICreatePlainPollCommand,
    ICreateElectionsPollCommand,
    TCreatePollCommand,
} from '$components/survey-service/application/commands/create-poll/create-poll.command.type.js';

class CreatePollRequestDTOBase implements Pick<TCreatePollCommand, 'name' | 'description' | 'settings'> {
    @Length(1, 60, { message: 'Название опроса должно быть от 1 до 60 символов' })
    @IsString({ message: 'Название опроса должно быть строкой' })
    public readonly name!: string;

    @Length(1, 100, { message: 'Описание опроса должно быть от 1 до 100 символов' })
    @IsString({ message: 'Описание опроса должно быть строкой' })
    @IsOptional()
    public readonly description!: string | null;

    @ValidateNested()
    @IsObject({ message: 'Блок настроек должен быть объектом' })
    @Type(() => PollSettingsDataNestedDTO)
    public readonly settings!: PollSettingsDataNestedDTO;
}

export class CreateVotingPollRequestDTO
    extends CreatePollRequestDTOBase
    implements Pick<ICreatePlainPollCommand, 'format' | 'optionDataList'>
{
    @Equals(PollFormatsEnum.VOTING, { message: 'Формат должен быть строго VOTING' })
    public readonly format!: typeof PollFormatsEnum.VOTING;

    @ValidateNested({ each: true })
    @ArrayMinSize(1, { message: 'Опрос должен содержать хотя бы одну опцию' })
    @IsArray({ message: 'Список вариантов ответа должен быть массивом' })
    @Type(() => PollPlainOptionDataNestedDTO)
    public readonly optionDataList!: PollPlainOptionDataNestedDTO[];
}

export class CreateElectionsPollRequestDTO
    extends CreatePollRequestDTOBase
    implements Pick<ICreateElectionsPollCommand, 'format' | 'optionDataList'>
{
    @Equals(PollFormatsEnum.ELECTIONS, { message: '...' })
    public readonly format!: typeof PollFormatsEnum.ELECTIONS;

    @ValidateNested({ each: true })
    @ArrayMinSize(1, { message: 'Опрос должен содержать хотя бы одну опцию' })
    @IsArray({ message: 'Список вариантов ответа должен быть массивом' })
    @Type(() => PollElectionsOptionDataNestedDTO)
    public readonly optionDataList!: PollElectionsOptionDataNestedDTO[];
}
