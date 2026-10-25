import { IsString, IsNotEmpty, IsUUID, Length, IsOptional } from 'class-validator';
import type {
    IPollPlainOptionData,
    IPollElectionsOptionData,
} from '$components/survey-service/domain/poll/factories/poll-option-data.dto.type.js';

export class PollPlainOptionDataNestedDTO implements IPollPlainOptionData {
    @Length(1, 60, { message: 'Название опции должно быть от 1 до 60 символов' })
    @IsString({ message: 'Название опции должно быть строкой' })
    @IsNotEmpty({ message: 'Название опции не должно быть пустым' })
    public readonly name!: string;

    @IsString({ message: 'Описание опции должно быть строкой' })
    @IsOptional()
    public readonly description!: string | null;
}

export class PollElectionsOptionDataNestedDTO implements IPollElectionsOptionData {
    @Length(1, 60, { message: 'Название опции должно быть от 1 до 60 символов' })
    @IsString({ message: 'Название опции должно быть строкой' })
    @IsNotEmpty({ message: 'Название опции не должно быть пустым' })
    public readonly name!: string;

    @IsString({ message: 'Описание опции должно быть строкой' })
    @IsOptional()
    public readonly description!: string | null;

    @IsUUID('4', { message: 'Идентификатор кандидата должен быть валидным UUID v4' })
    @IsNotEmpty({ message: 'Идентификатор кандидата обязателен' })
    public readonly candidateId!: string;
}
