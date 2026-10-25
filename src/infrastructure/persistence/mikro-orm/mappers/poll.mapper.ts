import { Collection as ORMCollection } from '@mikro-orm/core';
import { Series, Collection } from 'lang-extensions/list';
import { CorruptedInvariantException } from 'lang-extensions/errors';
import { UserID } from '$shared/components/base/domain/user/user.id.js';
import { PollFormatsEnum } from '$components/survey-service/domain/poll/poll-formats.enum.js';
import { PollStatisticsDisplayFormatsEnum } from '$components/survey-service/domain/poll/poll-statistics-display-formats.enum.js';
import { PollID } from '$components/survey-service/domain/poll/poll.id.js';
import { PollName } from '$components/survey-service/domain/poll/poll-name.js';
import { PollDescription } from '$components/survey-service/domain/poll/poll-description.js';
import {
    PollStatisticsNonSpecifiedAccessSettings,
    PollStatisticsSpecifiedAccessSettings,
} from '$components/survey-service/domain/poll/poll-statistics-access-settings.js';
import {
    PollDisabledStatisticsSettings,
    PollEnabledStatisticsSettings,
} from '$components/survey-service/domain/poll/poll-statistics-settings.js';
import { PollSettings } from '$components/survey-service/domain/poll/poll-settings.js';
import { PollAccessTypesEnum } from '$components/survey-service/domain/poll/poll-access-types.enum.js';
import { PollVote } from '$components/survey-service/domain/poll/poll-vote.js';
import { Poll } from '$components/survey-service/domain/poll/poll.js';
import { ElectionsPollOption, PlainPollOption } from '$components/survey-service/domain/poll/poll-option.js';
import {
    PollPublicAccessSettings,
    PollRegisteredAccessSettings,
    PollSpecifiedAccessSettings,
} from '$components/survey-service/domain/poll/poll-access-settings.js';
import { PollStatisticsAccessTypesEnum } from '$components/survey-service/domain/poll/poll-statistics-access-types.enum.js';
import { PollORMEntity } from '../orm-entities/poll.orm-entity.js';
import { PollAccessHolderORMEntity } from '../orm-entities/poll-access-holder.orm-entity.js';
import { PollOptionORMEntity } from '../orm-entities/poll-option.orm-entity.js';
import { PollVoteORMEntity } from '../orm-entities/poll-vote.orm-entity.js';
import { PollStatisticsAccessHolderORMEntity } from '../orm-entities/poll-statistics-access-holder.orm-entity.js';

export class PollMapper {
    public static mapToDomain(ormPoll: PollORMEntity): Poll {
        const id = PollID.of(ormPoll.id);
        const authorId = UserID.of(ormPoll.authorId);
        const name = PollName.of(ormPoll.name);
        const description = ormPoll.description ? PollDescription.of(ormPoll.description) : null;

        let options;

        if (ormPoll.format === PollFormatsEnum.VOTING) {
            const optionsArray = ormPoll.options
                .getItems()
                .map((option) => PlainPollOption.of(option.name, option.description));

            options = Series.reconstitute(optionsArray) satisfies Series<PlainPollOption>;
        } else {
            const optionsArray = ormPoll.options.getItems().map((option) => {
                if (!option.candidateId) {
                    throw new CorruptedInvariantException('Option must contain "candidateId" prop', {
                        pollFormat: ormPoll.format,
                        option: option,
                    });
                }

                return ElectionsPollOption.of(option.name, option.description, UserID.of(option.candidateId));
            });

            options = Series.reconstitute(optionsArray) satisfies Series<ElectionsPollOption>;
        }

        const votesArray = ormPoll.votes.getItems().map((voteOrm) => {
            let votedOptionsCollection;

            if (ormPoll.format === PollFormatsEnum.VOTING) {
                const votedOptionsArray = voteOrm.options
                    .getItems()
                    .map((option) => PlainPollOption.of(option.name, option.description));

                votedOptionsCollection = Collection.reconstitute(
                    votedOptionsArray,
                ) satisfies Collection<PlainPollOption>;
            } else {
                const votedOptionsArray = voteOrm.options.getItems().map((option) => {
                    if (!option.candidateId) {
                        throw new CorruptedInvariantException('Option must contain "candidateId" prop', {
                            pollFormat: ormPoll.format,
                            option: option,
                        });
                    }

                    return ElectionsPollOption.of(option.name, option.description, UserID.of(option.candidateId));
                });

                votedOptionsCollection = Collection.reconstitute(
                    votedOptionsArray,
                ) satisfies Collection<ElectionsPollOption>;
            }

            return PollVote.of(UserID.of(voteOrm.voterId), votedOptionsCollection);
        });

        const votes = Collection.reconstitute(votesArray);

        let accessSettings;

        if (ormPoll.accessType === PollAccessTypesEnum.SPECIFIED) {
            const accessHoldersArray = ormPoll.accessHolders.map((accessHolder) => UserID.of(accessHolder.userId));

            const accessHoldersCollection = Collection.reconstitute(accessHoldersArray);

            accessSettings = PollSpecifiedAccessSettings.of(accessHoldersCollection);
        } else if (ormPoll.accessType === PollAccessTypesEnum.REGISTERED) {
            accessSettings = PollRegisteredAccessSettings.of();
        } else {
            accessSettings = PollPublicAccessSettings.of();
        }

        const statisticsDisplayFormat = ormPoll.statisticsDisplayFormat;

        let statisticsSetting;

        if (statisticsDisplayFormat === PollStatisticsDisplayFormatsEnum.NONE) {
            statisticsSetting = PollDisabledStatisticsSettings.of();
        } else {
            if (
                !ormPoll.statisticsAccessType ||
                ormPoll.shouldShowStatisticsAfterVoting === undefined ||
                ormPoll.shouldShowStatisticsAfterVoting === null
            ) {
                throw new CorruptedInvariantException('Poll statistics settings must exist', {
                    statisticsDisplayFormat: ormPoll.statisticsDisplayFormat,
                    statisticsAccessType: ormPoll.statisticsAccessType,
                    shouldShowStatisticsAfterVoting: ormPoll.shouldShowStatisticsAfterVoting,
                });
            }

            let statisticsAccessSettings;

            if (ormPoll.statisticsAccessType === PollStatisticsAccessTypesEnum.SPECIFIED) {
                const statisticsAccessHoldersArray = ormPoll.statisticsAccessHolders.map((accessHolder) =>
                    UserID.of(accessHolder.userId),
                );

                const statisticsAccessHoldersCollection = Collection.reconstitute(statisticsAccessHoldersArray);

                statisticsAccessSettings = PollStatisticsSpecifiedAccessSettings.of(statisticsAccessHoldersCollection);
            } else {
                statisticsAccessSettings = PollStatisticsNonSpecifiedAccessSettings.of(ormPoll.statisticsAccessType);
            }

            statisticsSetting = PollEnabledStatisticsSettings.of(
                statisticsDisplayFormat,
                statisticsAccessSettings,
                ormPoll.shouldShowStatisticsAfterVoting,
            );
        }

        const settings = PollSettings.of(ormPoll.isMultiChoiceEnabled, accessSettings, statisticsSetting);

        return Poll.reconstitute({
            id,
            author: authorId,
            format: ormPoll.format,
            status: ormPoll.status,
            name,
            description,
            options,
            votes,
            settings,
        });
    }

    public static mapToORM(domainPoll: Poll, ormPoll: PollORMEntity): void {
        if (!ormPoll.options) {
            ormPoll.options = new ORMCollection<PollOptionORMEntity>(ormPoll);
        }

        if (!ormPoll.votes) {
            ormPoll.votes = new ORMCollection(ormPoll);
        }

        if (!ormPoll.accessHolders) {
            ormPoll.accessHolders = new ORMCollection(ormPoll);
        }

        if (!ormPoll.statisticsAccessHolders) {
            ormPoll.statisticsAccessHolders = new ORMCollection(ormPoll);
        }

        ormPoll.authorId = domainPoll.author.value;
        ormPoll.name = domainPoll.name.value;
        ormPoll.description = domainPoll.description ? domainPoll.description.value : null;
        ormPoll.format = domainPoll.format;
        ormPoll.status = domainPoll.status;
        ormPoll.isMultiChoiceEnabled = domainPoll.settings.isMultiChoiceEnabled;
        ormPoll.accessType = domainPoll.settings.accessSettings.type;
        ormPoll.statisticsDisplayFormat = domainPoll.settings.statisticsSettings.displayFormat;

        const domainOptions = domainPoll.options.asArray();

        const isSameOption = (
            domainOption: PlainPollOption | ElectionsPollOption,
            ormOption: PollOptionORMEntity,
        ): boolean => {
            if (domainOption instanceof ElectionsPollOption) {
                return ormOption.candidateId === domainOption.candidate.value;
            }

            return ormOption.name === domainOption.name;
        };

        for (const ormOption of ormPoll.options.getItems()) {
            const isExisting = domainOptions.some((item) => isSameOption(item, ormOption));

            if (!isExisting) {
                ormPoll.options.remove(ormOption);
            }
        }

        const ormOptionMap = new Map<string, PollOptionORMEntity>();

        for (const domainOption of domainOptions) {
            let ormOption = ormPoll.options.find((item) => isSameOption(domainOption, item));

            if (!ormOption) {
                ormOption = new PollOptionORMEntity();
                ormOption.poll = ormPoll;
                ormPoll.options.add(ormOption);
            }

            ormOption.name = domainOption.name;
            ormOption.description = domainOption.description;
            ormOption.candidateId = domainOption instanceof ElectionsPollOption ? domainOption.candidate.value : null;

            const mapKey =
                domainOption instanceof ElectionsPollOption ? domainOption.candidate.value : domainOption.name;

            ormOptionMap.set(mapKey, ormOption);
        }

        if (domainPoll.votes) {
            const domainVotes = domainPoll.votes.asArray();
            const domainVoterIds = new Set(domainVotes.map((item) => item.voter.value));

            for (const ormVote of ormPoll.votes.getItems()) {
                if (!domainVoterIds.has(ormVote.voterId)) {
                    ormPoll.votes.remove(ormVote);
                }
            }

            for (const domainVote of domainVotes) {
                let ormVote = ormPoll.votes.getItems().find((item) => item.voterId === domainVote.voter.value);

                if (!ormVote) {
                    ormVote = new PollVoteORMEntity();
                    ormVote.poll = ormPoll;
                    ormVote.voterId = domainVote.voter.value;
                    ormVote.options = new ORMCollection<PollOptionORMEntity>(ormVote);

                    ormPoll.votes.add(ormVote);
                }

                const matchedOrmOptions: PollOptionORMEntity[] = [];

                for (const domainOption of domainVote.options.asArray()) {
                    const mapKey =
                        domainOption instanceof ElectionsPollOption ? domainOption.candidate.value : domainOption.name;

                    const ormOption = ormOptionMap.get(mapKey);

                    if (ormOption) {
                        matchedOrmOptions.push(ormOption);
                    }
                }

                ormVote.options.set(matchedOrmOptions);
            }
        } else {
            ormPoll.votes.removeAll();
        }

        if (domainPoll.settings.accessSettings.type === PollAccessTypesEnum.SPECIFIED) {
            const domainAccessHolders = domainPoll.settings.accessSettings.holders.asArray();
            const domainUserIds = new Set(domainAccessHolders.map((item) => item.value));

            for (const ormAccessHolder of ormPoll.accessHolders.getItems()) {
                if (!domainUserIds.has(ormAccessHolder.userId)) {
                    ormPoll.accessHolders.remove(ormAccessHolder);
                }
            }

            for (const domainAccessHolder of domainAccessHolders) {
                const isExists = ormPoll.accessHolders
                    .getItems()
                    .some((ormAH) => ormAH.userId === domainAccessHolder.value);

                if (!isExists) {
                    const newAccessHolder = new PollAccessHolderORMEntity();

                    newAccessHolder.poll = ormPoll;
                    newAccessHolder.userId = domainAccessHolder.value;
                    ormPoll.accessHolders.add(newAccessHolder);
                }
            }
        } else {
            ormPoll.accessHolders.removeAll();
        }

        ormPoll.statisticsDisplayFormat = domainPoll.settings.statisticsSettings.displayFormat;

        if (domainPoll.settings.statisticsSettings.displayFormat === PollStatisticsDisplayFormatsEnum.NONE) {
            ormPoll.shouldShowStatisticsAfterVoting = null;
            ormPoll.statisticsAccessType = null;
            ormPoll.statisticsAccessHolders.removeAll();
        } else {
            ormPoll.shouldShowStatisticsAfterVoting = domainPoll.settings.statisticsSettings.shouldShowAfterVoting;
            ormPoll.statisticsAccessType = domainPoll.settings.statisticsSettings.accessSettings.type;

            if (
                domainPoll.settings.statisticsSettings.accessSettings.type === PollStatisticsAccessTypesEnum.SPECIFIED
            ) {
                const domainAccessHolders = domainPoll.settings.statisticsSettings.accessSettings.holders.asArray();
                const domainAccessHolderIds = new Set(domainAccessHolders.map((item) => item.value));

                for (const ormAccessHolder of ormPoll.statisticsAccessHolders.getItems()) {
                    if (!domainAccessHolderIds.has(ormAccessHolder.userId)) {
                        ormPoll.statisticsAccessHolders.remove(ormAccessHolder);
                    }
                }

                for (const domainAccessHolder of domainAccessHolders) {
                    const isExists = ormPoll.statisticsAccessHolders
                        .getItems()
                        .some((item) => item.userId === domainAccessHolder.value);
                    if (!isExists) {
                        const newAccessHolder = new PollStatisticsAccessHolderORMEntity();

                        newAccessHolder.poll = ormPoll;
                        newAccessHolder.userId = domainAccessHolder.value;
                        ormPoll.statisticsAccessHolders.add(newAccessHolder);
                    }
                }
            } else {
                ormPoll.statisticsAccessHolders.removeAll();
            }
        }
    }
}
