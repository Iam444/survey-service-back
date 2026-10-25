import { Series } from 'lang-extensions/list';
import { UserID } from '$shared/components/base/domain/user/user.id.js';
import { PollFormatsEnum } from '../poll-formats.enum.js';
import { PlainPollOption, ElectionsPollOption } from '../poll-option.js';
import { DuplicatedOptionError } from '../../errors/duplicated-option.error.js';
import type { Result } from 'lang-extensions/result';
import type { IDuplicatedOptionError } from '../../errors/duplicated-option.error.js';
import type { TPollOptionDataDTO } from './poll-option-data.dto.type.js';

type TResult =
    | {
          readonly format: typeof PollFormatsEnum.VOTING;
          readonly options: Series<PlainPollOption>;
      }
    | {
          readonly format: typeof PollFormatsEnum.ELECTIONS;
          readonly options: Series<ElectionsPollOption>;
      };

export class PollOptionFactory {
    public static create(dto: TPollOptionDataDTO): Result<TResult, IDuplicatedOptionError> {
        if (dto.format === PollFormatsEnum.VOTING) {
            const optionsArray = dto.optionDataList.map((pollOptionData) =>
                PlainPollOption.of(pollOptionData.name, pollOptionData.description),
            );

            return Series.of(optionsArray)
                .map((options) => ({ format: dto.format, options }))
                .mapError((error) => {
                    return DuplicatedOptionError.of('Poll option names must be unique', error.details.duplicant);
                });
        }

        const optionsArray = dto.optionDataList.map((pollOptionData) =>
            ElectionsPollOption.of(
                pollOptionData.name,
                pollOptionData.description,
                UserID.of(pollOptionData.candidateId),
            ),
        );

        return Series.of(optionsArray)
            .map((options) => ({ format: dto.format, options }))
            .mapError((error) => {
                return DuplicatedOptionError.of('Candidates of poll options must be unique', error.details.duplicant);
            });
    }
}
