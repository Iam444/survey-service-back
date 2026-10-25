import { IsString, MinLength, MaxLength, IsEmail, IsOptional, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import type { ISignUpCommand } from '$components/base/application/commands/sign-up/sign-up.command.interface.js';

export class SignUpRequestDTO implements ISignUpCommand {
    @IsEmail({}, { message: 'Некорректный формат email' })
    @IsString({ message: 'Email должен быть строкой' })
    @IsNotEmpty({ message: 'Email обязателен для заполнения' })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
    public readonly email!: string;

    @MinLength(6, { message: 'Пароль должен быть не менее 6 символов' })
    @IsString({ message: 'Пароль должен быть строкой' })
    @IsNotEmpty({ message: 'Пароль обязателен для заполнения' })
    public readonly password!: string;

    @MaxLength(20, { message: 'Имя должно быть не более 20 символов' })
    @MinLength(2, { message: 'Имя должно состоять не менее чем из 2 символов' })
    @IsString({ message: 'Имя должно быть строкой' })
    @IsNotEmpty({ message: 'Имя обязательно для заполнения' })
    public readonly name!: string;

    @MaxLength(30, { message: 'Фамилия должна состоять не более чем из 30 символов' })
    @IsString({ message: 'Фамилия должна быть строкой' })
    @IsOptional()
    public readonly surname!: string | null;
}
