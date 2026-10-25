import { BadRequestException, UnprocessableEntityException, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PollFormatsEnum } from '$components/survey-service/domain/poll/poll-formats.enum.js';
import {
    CreateElectionsPollRequestDTO,
    CreateVotingPollRequestDTO,
} from '$infra/http/controllers/polls/dto/create-poll.request-dto.js';
import type { PipeTransform, ArgumentMetadata, ValidationError } from '@nestjs/common';
import type { TConstructor } from 'lang-extensions/types';

@Injectable()
export class CreatePollValidationPipe implements PipeTransform {
    public async transform(
        value: CreateVotingPollRequestDTO | CreateElectionsPollRequestDTO,
        metadata: ArgumentMetadata,
    ): Promise<CreateVotingPollRequestDTO | CreateElectionsPollRequestDTO> {
        if (metadata.type !== 'body') {
            return value;
        }

        if (!value || typeof value !== 'object') {
            throw new BadRequestException({
                message: 'Некорректные данные создания опроса',
            });
        }

        const format = value.format;

        if (!format) {
            throw new BadRequestException({
                message: 'Поле format является обязательным для определения типа опроса',
            });
        }

        let TargetDtoClass: TConstructor<CreateVotingPollRequestDTO | CreateElectionsPollRequestDTO>;

        if (format === PollFormatsEnum.VOTING) {
            TargetDtoClass = CreateVotingPollRequestDTO;
        } else if (format === PollFormatsEnum.ELECTIONS) {
            TargetDtoClass = CreateElectionsPollRequestDTO;
        } else {
            throw new BadRequestException({
                message: `Некорректный формат опроса: "${format}". Допустимые значения: ${Object.values(PollFormatsEnum).join(', ')}`,
            });
        }

        const entityDto = plainToInstance(TargetDtoClass, value, {
            enableImplicitConversion: false,
        });

        // Запускаем валидацию
        const errors = await validate(entityDto, {
            whitelist: true,
            forbidNonWhitelisted: false,
        });

        if (errors.length > 0) {
            throw new UnprocessableEntityException({
                message: 'Ошибка валидации данных опроса',
                errors: this.formatErrors(errors),
            });
        }

        return entityDto;
    }

    private formatErrors(errors: ValidationError[]): Record<string, string[]> {
        const result: Record<string, string[]> = {};

        const mapErrors = (errorList: ValidationError[], parentPath = '') => {
            for (const error of errorList) {
                const currentPath = parentPath ? `${parentPath}.${error.property}` : error.property;

                if (error.constraints) {
                    result[currentPath] = Object.values(error.constraints);
                }

                if (error.children && error.children.length > 0) {
                    mapErrors(error.children, currentPath);
                }
            }
        };

        mapErrors(errors);

        return result;
    }
}
