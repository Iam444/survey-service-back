import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UserExistenceRequestDTO {
    @IsEmail({}, { message: 'Некорректный формат email' })
    @IsString({ message: 'Email должен быть строкой' })
    @IsNotEmpty({ message: 'Email обязателен для заполнения' })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
    public readonly email!: string;
}
