import { sql, EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Result, AsyncResult } from 'lang-extensions/result';
import { CorruptedInvariantException } from 'lang-extensions/errors';
import { NotFoundError } from '$shared/errors/not-found.error.js';
import { NotPermittedError } from '$shared/errors/not-permitted.error.js';
import { PollAccessTypesEnum } from '$components/survey-service/domain/poll/poll-access-types.enum.js';
import { PollStatusesEnum } from '$components/survey-service/domain/poll/poll-statuses.enum.js';
import { PollStatisticsDisplayFormatsEnum } from '$components/survey-service/domain/poll/poll-statistics-display-formats.enum.js';
import { PollStatisticsAccessTypesEnum } from '$components/survey-service/domain/poll/poll-statistics-access-types.enum.js';
import { PollORMEntity } from '../orm-entities/poll.orm-entity.js';
import { UserORMEntity } from '../orm-entities/user.orm-entity.js';
import { PollVoteORMEntity } from '../orm-entities/poll-vote.orm-entity.js';
import type { INotFoundError } from '$shared/errors/not-found.error.js';
import type { INotPermittedError } from '$shared/errors/not-permitted.error.js';
import type { IPollResultsQueryHandler } from '$ports/queries/poll-results/poll-results.query-handler.interface.js';
import type {
    IPollResultsReadModel,
    IPollResultsSummaryReadModel,
    IPollOptionStatisticsReadModel,
    IPollVoteReadModel,
    IPollResultsStatisticsReadModel,
} from '$ports/queries/poll-results/poll-results.read-model.interface.js';
import type { IPollResultsQuery } from '$ports/queries/poll-results/poll-results.query.interface.js';
import type { IPollPlainOptionReadModel } from '$ports/queries/poll-overview/poll-option.read-model.type.js';

@Injectable()
export class PollResultsQueryHandler implements IPollResultsQueryHandler {
    constructor(private readonly _entityManager: EntityManager) {}

    public handle(query: IPollResultsQuery): AsyncResult<IPollResultsReadModel, INotFoundError | INotPermittedError> {
        return AsyncResult.wrap(
            async (): Promise<Result<IPollResultsReadModel, INotFoundError | INotPermittedError>> => {
                const poll = await this._entityManager.findOne(PollORMEntity, { id: query.pollId });

                if (!poll) {
                    return Result.failure(NotFoundError.of('Poll', 'id', query.pollId));
                }

                await poll.accessHolders.init({ populate: ['*'] });
                await poll.statisticsAccessHolders.init({ populate: ['*'] });

                if (
                    poll.accessType === PollAccessTypesEnum.SPECIFIED &&
                    query.userId !== poll.authorId &&
                    !poll.accessHolders.exists((accessHolder) => accessHolder.userId === query.userId)
                ) {
                    return Result.failure(NotPermittedError.of(`Does not have the access.`));
                }

                const totalVotesQuantityQueryResult = await this._entityManager
                    .createQueryBuilder(PollVoteORMEntity, 'v')
                    .leftJoin('v.options', 'o')
                    .count()
                    .where({ poll: query.pollId })
                    .execute<{ count: string }>('get');

                const totalVotesQuantity = totalVotesQuantityQueryResult
                    ? Math.trunc(Number(totalVotesQuantityQueryResult.count))
                    : null;

                let isShowStatistics: boolean = false;

                if (poll.statisticsDisplayFormat !== PollStatisticsDisplayFormatsEnum.NONE) {
                    if (poll.statisticsAccessType === PollStatisticsAccessTypesEnum.SPECIFIED) {
                        isShowStatistics =
                            poll.statisticsAccessHolders.exists(
                                (accessHolder) => query.userId === accessHolder.userId,
                            ) || query.userId === poll.authorId;
                    } else if (poll.statisticsAccessType === PollStatisticsAccessTypesEnum.PRIVATE) {
                        isShowStatistics = query.userId === poll.authorId;
                    } else {
                        isShowStatistics = true;
                    }
                }

                if (isShowStatistics && !totalVotesQuantity) {
                    isShowStatistics = false;
                }

                const isShowSummary = poll.status === PollStatusesEnum.CLOSED && Boolean(totalVotesQuantity);

                let summary: IPollResultsSummaryReadModel | null = null;
                let statistics: IPollResultsStatisticsReadModel | null = null;

                if (isShowSummary || isShowStatistics) {
                    let maxVotesQuantity = 0;

                    const optionVotesQuantityMap = new Map<number, number>();

                    const optionVotesQuantityListQueryResult = await this._entityManager
                        .createQueryBuilder(PollVoteORMEntity, 'v')
                        .leftJoin('v.options', 'o')
                        .select([sql`COUNT(v.id)`.as('votesQuantity'), 'o.id'])
                        .where({ poll: query.pollId })
                        .groupBy('o.id')
                        .execute<{ id: number; votesQuantity: string }[]>('all', true);

                    for (const option of optionVotesQuantityListQueryResult) {
                        const votesQuantity = Math.trunc(Number(option.votesQuantity));

                        if (votesQuantity > maxVotesQuantity) {
                            maxVotesQuantity = votesQuantity;
                        }

                        optionVotesQuantityMap.set(option.id, votesQuantity);
                    }

                    const viewerVoteQueryResult = await this._entityManager.findOne(PollVoteORMEntity, {
                        poll: query.pollId,
                        voterId: query.userId,
                    });

                    const viewerSelection: IPollResultsSummaryReadModel['viewerSelection'] = viewerVoteQueryResult
                        ? viewerVoteQueryResult.options.map((option) => ({
                              id: option.id,
                              name: option.name,
                              description: option.description,
                          }))
                        : [];

                    if (isShowSummary) {
                        const leadingOptions: IPollResultsSummaryReadModel['leadingOptions'] = poll.options
                            .filter((option) => optionVotesQuantityMap.get(option.id) === maxVotesQuantity)
                            .map((option) => {
                                const plainOption: IPollPlainOptionReadModel = {
                                    id: option.id,
                                    name: option.name,
                                    description: option.description,
                                };

                                return plainOption;
                            });

                        summary = { leadingOptions, viewerSelection };
                    }

                    if (isShowStatistics && totalVotesQuantity) {
                        let votesMap: Map<number, IPollVoteReadModel[]> | undefined;

                        if (poll.statisticsDisplayFormat === PollStatisticsDisplayFormatsEnum.FULL) {
                            const usersIdSet = new Set<string>();

                            const votesOrm = await this._entityManager
                                .createQueryBuilder(PollVoteORMEntity, 'v')
                                .joinAndSelect('v.options', 'o')
                                .where({ poll: query.pollId })
                                .getResultList();

                            for (const voteOrm of votesOrm) usersIdSet.add(voteOrm.voterId);

                            const users = await this._entityManager
                                .createQueryBuilder(UserORMEntity, 'user')
                                .select([
                                    'user.id',
                                    'user.email',
                                    'user.name',
                                    'user.surname',
                                    'user.fullName',
                                    'user.phone',
                                    'user.avatarUrl',
                                ])
                                .where({ id: { $in: [...usersIdSet] } })
                                .getResult();

                            const userMap = new Map(users.map((user) => [user.id, user]));

                            const localVotesMap = new Map<number, IPollVoteReadModel[]>();

                            for (const voteOrm of votesOrm) {
                                const voter = userMap.get(voteOrm.voterId);

                                if (!voter) {
                                    throw new CorruptedInvariantException('Map value lost. "voter" is not defined', {
                                        map: userMap,
                                        key: voteOrm.voterId,
                                    });
                                }

                                const vote: IPollVoteReadModel = {
                                    votedBy: voter,
                                    votedAt: Number(voteOrm.createdAt),
                                };

                                for (const optionOrm of voteOrm.options) {
                                    const votesArray = localVotesMap.get(optionOrm.id) || [];
                                    localVotesMap.set(optionOrm.id, [...votesArray, vote]);
                                }
                            }

                            votesMap = localVotesMap;
                        }

                        const optionStatisticsList: IPollOptionStatisticsReadModel[] = poll.options.map((optionOrm) => {
                            const votesQuantity = optionVotesQuantityMap.get(optionOrm.id) || 0;

                            const votesPercentage = Math.round((votesQuantity / totalVotesQuantity) * 100);

                            const isLeading = Boolean(votesQuantity) && votesQuantity === maxVotesQuantity;

                            const isSelectedByUser = viewerSelection.some((o) => o.id === optionOrm.id);

                            let votes;

                            if (poll.statisticsDisplayFormat === PollStatisticsDisplayFormatsEnum.FULL) {
                                if (!votesMap) {
                                    throw new CorruptedInvariantException('Votes map supposed to exist', {
                                        map: votesMap,
                                    });
                                }

                                votes = votesMap.get(optionOrm.id) || [];
                            }

                            const optionStatistics: IPollOptionStatisticsReadModel = {
                                option: { id: optionOrm.id, name: optionOrm.name, description: optionOrm.description },
                                isSelectedByUser,
                                isLeading,
                                votesQuantity,
                                votesPercentage,
                                votes,
                            };

                            return optionStatistics;
                        });

                        statistics = { totalVotesQuantity, optionStatisticsList };
                    }
                }
                return Result.success({
                    isInMultiChoiceMode: poll.isMultiChoiceEnabled,
                    isInFullStatisticsMode: poll.statisticsDisplayFormat === 'full',
                    summary,
                    statistics,
                });
            },
        );
    }
}
