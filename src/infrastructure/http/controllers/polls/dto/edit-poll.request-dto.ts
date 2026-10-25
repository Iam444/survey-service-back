import { IsString, Length, IsOptional } from 'class-validator';
import type { IEditPollCommand } from '$components/survey-service/application/commands/edit-poll/edit-poll.command.interface.js';

export class EditPollRequestDTO implements Pick<IEditPollCommand, 'name' | 'description'> {
    @Length(1, 50, { message: 'Название опроса должно быть от 1 до 50 символов' })
    @IsString({ message: 'Название опроса должно быть строкой' })
    @IsOptional()
    public readonly name?: string;

    @Length(1, 500, { message: 'Описание опроса должно быть от 1 до 500 символов' })
    @IsString({ message: 'Описание опроса должно быть строкой' })
    @IsOptional()
    public readonly description?: string | null;
}
