import { Transform } from 'class-transformer';
import { IsString, IsEmail, IsNotEmpty } from 'class-validator';
import type { ILogInCommand } from '$components/base/application/commands/log-in/log-in.command.js';

export class LogInRequestDTO implements ILogInCommand {
    @IsEmail({}, { message: 'Некорректный формат email' })
    @IsString({ message: 'Email должен быть строкой' })
    @IsNotEmpty({ message: 'Email обязателен для заполнения' })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
    public readonly email!: string;

    @IsString({ message: 'Пароль должен быть строкой' })
    @IsNotEmpty({ message: 'Пароль обязателен для заполнения' })
    public readonly password!: string;
}
