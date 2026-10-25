import { Result } from 'lang-extensions/result';
import { CorruptedInvariantException } from 'lang-extensions/errors';
import { AbstractEntity } from 'lang-extensions/entity';
import { Collection } from 'lang-extensions/list';
import { NotPermittedError } from '$shared/errors/not-permitted.error.js';
import { ChosenOptionsCountError } from '../errors/chosen-options-count.error.js';
import { InvalidStatusTransitionError } from '../errors/invalid-status-transition.error.js';
import { StatusRestrictionsError } from '../errors/status-restrictions.error.js';
import { PollStatusesEnum } from './poll-statuses.enum.js';
import { PollID } from './poll.id.js';
import type { Series } from 'lang-extensions/list';
import type { UserID } from '$shared/components/base/domain/user/user.id.js';
import type { IViewer } from '$shared/components/base/domain/user/viewer.interface.js';
import type { INotPermittedError } from '$shared/errors/not-permitted.error.js';
import type { IChosenOptionsCountError } from '../errors/chosen-options-count.error.js';
import type { IInvalidStatusTransitionError } from '../errors/invalid-status-transition.error.js';
import type { IStatusRestrictionsError } from '../errors/status-restrictions.error.js';
import type { ElectionsPollOption, PlainPollOption } from './poll-option.js';
import type { PollDescription } from './poll-description.js';
import type { PollName } from './poll-name.js';
import type { IChangeStatusDTO } from './dto/change-status.dto.interface.js';
import type { ISubmitVoteDTO } from './dto/submit-vote.dto.interface.js';
import type { PollSettings } from './poll-settings.js';
import type { IEditPollDTO } from './dto/edit-poll.dto.interface.js';
import type { TPollFormat } from './poll-formats.enum.js';
import type { TPollStatus } from './poll-statuses.enum.js';
import type { TCreatePollDTO } from './dto/create-poll.dto.interface.js';
import type { IReconstitutePollDTO } from './dto/reconstitute-poll.dto.interface.js';
import type { PollVote } from './poll-vote.js';

export class Poll extends AbstractEntity<PollID> {
    public static reconstitute(dto: IReconstitutePollDTO): Poll {
        return new Poll(
            dto.id,
            dto.author,
            dto.format,
            dto.status,
            dto.name,
            dto.description,
            dto.settings,
            dto.options,
            dto.votes,
        );
    }

    public static create(dto: TCreatePollDTO): Result<Poll, never> {
        if (dto.options.isEmpty) {
            throw new CorruptedInvariantException(`Options list must not be empty.`, {
                options: dto.options,
                className: this.name,
                methodName: this.create.name,
            });
        }

        const poll = new Poll(
            PollID.generate(),
            dto.author,
            dto.format,
            PollStatusesEnum.CREATED,
            dto.name,
            dto.description,
            dto.settings,
            dto.options,
            Collection.empty<PollVote>(),
        );

        return Result.success(poll);
    }

    private readonly _StatusTransitionsMap: Record<TPollStatus, Partial<Record<TPollStatus, boolean>>> = {
        [PollStatusesEnum.CREATED]: { [PollStatusesEnum.OPENED]: true },
        [PollStatusesEnum.OPENED]: { [PollStatusesEnum.CREATED]: true, [PollStatusesEnum.CLOSED]: true },
        [PollStatusesEnum.CLOSED]: {},
    };

    constructor(
        id: PollID,
        private readonly _author: UserID,
        private readonly _format: TPollFormat,
        private _status: TPollStatus,
        private _name: PollName,
        private _description: PollDescription | null,
        private _settings: PollSettings,
        private _options: Series<PlainPollOption> | Series<ElectionsPollOption>,
        private _votes: Collection<PollVote>,
    ) {
        super(id);
    }

    get author(): UserID {
        return this._author;
    }

    get format(): TPollFormat {
        return this._format;
    }

    get status(): TPollStatus {
        return this._status;
    }

    get name(): PollName {
        return this._name;
    }

    get description(): PollDescription | null {
        return this._description;
    }

    get settings(): PollSettings {
        return this._settings;
    }

    get options(): Series<PlainPollOption> | Series<ElectionsPollOption> {
        return this._options;
    }

    get votes(): Collection<PollVote> | null {
        return this._votes;
    }

    public editData(dto: IEditPollDTO): Result<this, INotPermittedError | IStatusRestrictionsError> {
        if (!this._canEdit(dto.viewer)) {
            return Result.failure(NotPermittedError.of(`Only author is able to manage the poll.`));
        }

        if (this._status === PollStatusesEnum.OPENED) {
            return Result.failure(StatusRestrictionsError.of(`Not able to edit poll in current status.`, this._status));
        }

        if (dto.name) {
            this._name = dto.name;
        }

        if (dto.description || dto.description === null) {
            this._description = dto.description;
        }

        return Result.success(this);
    }

    public changeStatus(dto: IChangeStatusDTO): Result<this, INotPermittedError | IInvalidStatusTransitionError> {
        if (!this._canEdit(dto.viewer)) {
            return Result.failure(NotPermittedError.of(`Only author is able to manage the poll.`));
        }

        if (!this._isStatusTransitionValid(this._status, dto.status)) {
            return Result.failure(InvalidStatusTransitionError.of(this._status, dto.status));
        }

        this._status = dto.status;

        if (dto.status === PollStatusesEnum.CREATED) {
            this._votes = Collection.empty<PollVote>();
        }

        return Result.success(this);
    }
    public submitVote(
        dto: ISubmitVoteDTO,
    ): Result<this, IStatusRestrictionsError | INotPermittedError | IChosenOptionsCountError> {
        if (this._status !== PollStatusesEnum.OPENED) {
            return Result.failure(
                StatusRestrictionsError.of(`Not able to vote on this poll in current status.`, this._status),
            );
        }

        if (!this._canVote(dto.viewer)) {
            return Result.failure(NotPermittedError.of(`Not able to vote. User does not have access to this poll.`));
        }

        const chosenOptionsQuantity = dto.vote.options.size;

        if (!this._settings.isMultiChoiceEnabled && chosenOptionsQuantity > 1) {
            return Result.failure(ChosenOptionsCountError.of(chosenOptionsQuantity));
        }

        this._validateVoteOptions(dto.vote.options, this._options);

        this._votes.add(dto.vote);

        return Result.success(this);
    }

    public retractVote(voter: UserID): Result<this, IStatusRestrictionsError> {
        if (this._status !== PollStatusesEnum.OPENED) {
            return Result.failure(
                StatusRestrictionsError.of(`Not able to retract vote from this poll in current status.`, this._status),
            );
        }

        if (this._votes) {
            this._votes = this._votes.filter((vote) => !vote.voter.equals(voter));
        }

        return Result.success(this);
    }

    private _canEdit(viewer: IViewer): boolean {
        return viewer.user.equals(this._author);
    }

    private _canVote(viewer: IViewer): boolean {
        return viewer.user.equals(this._author) || this._settings.accessSettings.canParticipate(viewer);
    }

    private _isStatusTransitionValid(sourceStatus: TPollStatus, targetStatus: TPollStatus): boolean {
        return this._StatusTransitionsMap[sourceStatus][targetStatus] === true;
    }

    private _validateVoteOptions(
        voteOptions: Collection<PlainPollOption> | Collection<ElectionsPollOption>,
        pollOptions: Series<PlainPollOption> | Series<ElectionsPollOption>,
    ): void {
        let isValid = voteOptions.size <= pollOptions.size;

        if (isValid) {
            isValid = voteOptions
                .asArray()
                .every((voteOption) => pollOptions.find((pollOption) => pollOption.equals(voteOption)));
        }

        if (!isValid) {
            throw new CorruptedInvariantException(`Voted options do not match the poll options.`, {
                voteOptions,
                pollOptions,
                pollId: this._id,
                className: Poll.name,
                methodName: this._validateVoteOptions.name,
            });
        }
    }
}
