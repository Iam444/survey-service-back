import { BadRequestException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PollFormatsEnum } from '$components/survey-service/domain/poll/poll-formats.enum.js';
import {
    SubmitVotingPollVoteRequestDTO,
    SubmitElectionsPollVoteRequestDTO,
} from '$infra/http/controllers/polls/dto/submit-poll-vote.request-dto.js';
import type { ValidationError, PipeTransform, ArgumentMetadata } from '@nestjs/common';
import type { TConstructor } from 'lang-extensions/types';

@Injectable()
export class SubmitPollVoteValidationPipe implements PipeTransform {
    public async transform(
        value: SubmitVotingPollVoteRequestDTO | SubmitElectionsPollVoteRequestDTO,
        metadata: ArgumentMetadata,
    ): Promise<SubmitVotingPollVoteRequestDTO | SubmitElectionsPollVoteRequestDTO> {
        if (metadata.type !== 'body') {
            return value;
        }

        if (!value || typeof value !== 'object') {
            throw new BadRequestException({
                message: 'Некорректные данные подвтерждения голоса',
            });
        }

        const format = value.format;

        if (!format) {
            throw new BadRequestException({
                message: 'Поле format является обязательным для подвтерждения голоса',
            });
        }

        let TargetDtoClass: TConstructor<SubmitVotingPollVoteRequestDTO | SubmitElectionsPollVoteRequestDTO>;

        if (format === PollFormatsEnum.VOTING) {
            TargetDtoClass = SubmitVotingPollVoteRequestDTO;
        } else if (format === PollFormatsEnum.ELECTIONS) {
            TargetDtoClass = SubmitElectionsPollVoteRequestDTO;
        } else {
            throw new BadRequestException({
                message: `Некорректный формат опроса: "${format}". Допустимые значения: ${Object.values(PollFormatsEnum).join(', ')}`,
            });
        }

        const entityDto = plainToInstance(TargetDtoClass, value, {
            enableImplicitConversion: false,
        });

        const errors = await validate(entityDto, {
            whitelist: true,
            forbidNonWhitelisted: false,
        });

        if (errors.length > 0) {
            throw new UnprocessableEntityException({
                message: 'Ошибка валидации при отправке голоса',
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
