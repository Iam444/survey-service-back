import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { AsyncResult, Result } from 'lang-extensions/result';
import { CorruptedInvariantException } from 'lang-extensions/errors';
import { NotFoundError } from '$shared/errors/not-found.error.js';
import { NotPermittedError } from '$shared/errors/not-permitted.error.js';
import { PollStatusesEnum } from '$components/survey-service/domain/poll/poll-statuses.enum.js';
import { PollAccessTypesEnum } from '$components/survey-service/domain/poll/poll-access-types.enum.js';
import { PollStatisticsAccessTypesEnum } from '$components/survey-service/domain/poll/poll-statistics-access-types.enum.js';
import { PollFormatsEnum } from '$components/survey-service/domain/poll/poll-formats.enum.js';
import { PollStatisticsDisplayFormatsEnum } from '$components/survey-service/domain/poll/poll-statistics-display-formats.enum.js';
import { PollORMEntity } from '../orm-entities/poll.orm-entity.js';
import { UserORMEntity } from '../orm-entities/user.orm-entity.js';
import type { INotFoundError } from '$shared/errors/not-found.error.js';
import type { INotPermittedError } from '$shared/errors/not-permitted.error.js';
import type {
    IPollElectionsOptionReadModel,
    TPollOptionReadModel,
} from '$ports/queries/poll-overview/poll-option.read-model.type.js';
import type { IPollOverviewQueryHandler } from '$ports/queries/poll-overview/poll-overview.query-handler.interface.js';
import type { TPollOverviewReadModel } from '$ports/queries/poll-overview/poll-overview.read-model.interface.js';
import type { IPollOverviewQuery } from '$ports/queries/poll-overview/poll-overview.query.interface.js';
import type {
    IPollSettingsReadModel,
    IPollEnabledStatisticsSettingsReadModel,
} from '$ports/queries/poll-overview/poll-settings.read-model.interface.js';

@Injectable()
export class PollOverviewQueryHandler implements IPollOverviewQueryHandler {
    constructor(private readonly _entityManager: EntityManager) {}

    public handle(query: IPollOverviewQuery): AsyncResult<TPollOverviewReadModel, INotFoundError | INotPermittedError> {
        return AsyncResult.wrap(
            async (): Promise<Result<TPollOverviewReadModel, INotFoundError | INotPermittedError>> => {
                const poll = await this._entityManager.findOne(PollORMEntity, { id: query.pollId });

                if (!poll) {
                    return Result.failure(NotFoundError.of('Poll', 'id', query.pollId));
                }

                if (poll.status === PollStatusesEnum.CREATED && query.userId !== poll.authorId) {
                    return Result.failure(NotPermittedError.of('Not able to interact with poll in this status.'));
                }

                await poll.accessHolders.init({ populate: ['*'] });
                await poll.statisticsAccessHolders.init({ populate: ['*'] });

                if (
                    poll.accessType === PollAccessTypesEnum.SPECIFIED &&
                    query.userId !== poll.authorId &&
                    !poll.accessHolders.exists((accessHolder) => query.userId === accessHolder.userId)
                ) {
                    return Result.failure(
                        NotPermittedError.of(`Not able to interact with poll. User does not have access to this poll.`),
                    );
                }

                let viewerSelection: TPollOverviewReadModel['viewerSelection'] = [];

                await poll.votes.init({ populate: ['options'] });

                const vote = poll.votes.find((vote) => vote.voterId === query.userId);

                if (vote) {
                    viewerSelection = vote.options.map((option) => option.id);
                }

                const userIdSet = new Set<string>([poll.authorId]);

                let rawOptions: (Pick<TPollOptionReadModel, 'id' | 'name' | 'description'> & {
                    candidateId?: string;
                })[];

                if (poll.format === PollFormatsEnum.VOTING) {
                    rawOptions = poll.options.map((option) => {
                        return { id: option.id, name: option.name, description: option.description };
                    });
                } else {
                    rawOptions = poll.options.map((option) => {
                        if (!option.candidateId) {
                            throw new CorruptedInvariantException('Option must contain prop "candidateId"', {
                                pollFormat: poll.format,
                                option: option,
                            });
                        }

                        userIdSet.add(option.candidateId);

                        return {
                            id: option.id,
                            name: option.name,
                            description: option.description,
                            candidateId: option.candidateId,
                        };
                    });
                }

                if (poll.accessType === PollAccessTypesEnum.SPECIFIED) {
                    for (const accessHolder of poll.accessHolders) {
                        userIdSet.add(accessHolder.userId);
                    }
                }

                if (
                    poll.statisticsDisplayFormat !== PollStatisticsDisplayFormatsEnum.NONE &&
                    poll.statisticsAccessType === PollStatisticsAccessTypesEnum.SPECIFIED
                ) {
                    for (const statisticsAccessHolder of poll.statisticsAccessHolders) {
                        userIdSet.add(statisticsAccessHolder.userId);
                    }
                }

                const users = await this._entityManager
                    .createQueryBuilder(UserORMEntity, 'u')
                    .select(['u.id', 'u.email', 'u.name', 'u.surname', 'u.fullName', 'u.phone', 'u.avatarUrl'])
                    .where({ id: { $in: [...userIdSet] } })
                    .getResult();

                const userMap = new Map(users.map((user) => [user.id, user]));

                const author = userMap.get(poll.authorId);

                if (!author) {
                    throw new CorruptedInvariantException('Map value lost. "author" is not defined', {
                        map: userMap,
                        key: poll.authorId,
                    });
                }

                let accessSettings: IPollSettingsReadModel['accessSettings'];

                if (poll.accessType === PollAccessTypesEnum.SPECIFIED) {
                    const accessHolders = poll.accessHolders.map((accessHolder) => {
                        const user = userMap.get(accessHolder.userId);

                        if (!user) {
                            throw new CorruptedInvariantException('Map value lost. "user" is not defined', {
                                map: userMap,
                                key: accessHolder.userId,
                            });
                        }

                        return user;
                    });

                    accessSettings = { type: poll.accessType, holders: accessHolders };
                } else {
                    accessSettings = { type: poll.accessType };
                }

                let statisticsSettings: IPollSettingsReadModel['statisticsSettings'];

                if (poll.statisticsDisplayFormat === PollStatisticsDisplayFormatsEnum.NONE) {
                    statisticsSettings = { displayFormat: poll.statisticsDisplayFormat };
                } else {
                    if (
                        !poll.statisticsAccessType ||
                        poll.shouldShowStatisticsAfterVoting === undefined ||
                        poll.shouldShowStatisticsAfterVoting === null
                    ) {
                        throw new CorruptedInvariantException('Poll statistics settings must exist', {
                            statisticsDisplayFormat: poll.statisticsDisplayFormat,
                            statisticsAccessType: poll.statisticsAccessType,
                            shouldShowStatisticsAfterVoting: poll.shouldShowStatisticsAfterVoting,
                        });
                    }

                    let statisticsAccessSettings: IPollEnabledStatisticsSettingsReadModel['accessSettings'];

                    if (poll.statisticsAccessType === PollStatisticsAccessTypesEnum.SPECIFIED) {
                        const accessHolders = poll.statisticsAccessHolders.map((accessHolder) => {
                            const user = userMap.get(accessHolder.userId);

                            if (!user) {
                                throw new CorruptedInvariantException('Map value lost. "user" is not defined', {
                                    map: userMap,
                                    key: accessHolder.userId,
                                });
                            }

                            return user;
                        });

                        statisticsAccessSettings = { type: poll.statisticsAccessType, holders: accessHolders };
                    } else {
                        statisticsAccessSettings = { type: poll.statisticsAccessType };
                    }

                    statisticsSettings = {
                        displayFormat: poll.statisticsDisplayFormat,
                        accessSettings: statisticsAccessSettings,
                        shouldShowAfterVoting: poll.shouldShowStatisticsAfterVoting,
                    };
                }

                let pollSummary: TPollOverviewReadModel;

                const pollSummaryBase = {
                    status: poll.status,
                    author,
                    name: poll.name,
                    description: poll.description,
                    viewerSelection,
                    settings: {
                        isMultiChoiceEnabled: poll.isMultiChoiceEnabled,
                        accessSettings,
                        statisticsSettings,
                    },
                };

                if (poll.format === PollFormatsEnum.VOTING) {
                    pollSummary = { ...pollSummaryBase, format: poll.format, options: rawOptions };
                } else {
                    const options = rawOptions.map((option) => {
                        if (!option.candidateId) {
                            throw new CorruptedInvariantException('Option must contain prop "candidateId"', {
                                pollFormat: poll.format,
                                option: option,
                            });
                        }

                        const user = userMap.get(option.candidateId);

                        if (!user) {
                            throw new CorruptedInvariantException('Map value lost. "user" is not defined', {
                                map: userMap,
                                key: option.candidateId,
                            });
                        }

                        const electionsOption: IPollElectionsOptionReadModel = {
                            id: option.id,
                            name: option.name,
                            description: option.description,
                            candidate: user,
                        };

                        return electionsOption;
                    });

                    pollSummary = { ...pollSummaryBase, format: poll.format, options };
                }

                return Result.success(pollSummary);
            },
        );
    }
}
