import {
    Controller,
    Post,
    Body,
    Get,
    Patch,
    Param,
    UseGuards,
    Inject,
    Delete,
    InternalServerErrorException,
    UnprocessableEntityException,
    NotFoundException,
    ForbiddenException,
    ParseUUIDPipe,
    ConflictException,
} from '@nestjs/common';
import { SharedErrorCodes } from '$shared/errors/shared-error-codes.js';
import { CreatePollCommandHandler } from '$components/survey-service/application/commands/create-poll/create-poll.command-handler.js';
import { EditPollCommandHandler } from '$components/survey-service/application/commands/edit-poll/edit-poll.command-handler.js';
import { ChangePollStatusCommandHandler } from '$components/survey-service/application/commands/change-poll-status/change-poll-status.command-handler.js';
import { SubmitPollVoteCommandHandler } from '$components/survey-service/application/commands/submit-poll-vote/submit-poll-vote.command-handler.js';
import { RetractPollVoteCommandHandler } from '$components/survey-service/application/commands/retract-poll-vote/retract-poll-vote.command-handler.js';
import { ErrorCodes } from '$components/survey-service/domain/errors/error-codes.js';
import { CreatePollValidationPipe } from '$infra/http/middleware/pipes/create-poll.validation-pipe.js';
import { SubmitPollVoteValidationPipe } from '$infra/http/middleware/pipes/submit-poll-vote.validation-pipe.js';
import { UserCredentials } from '$infra/http/middleware/decorators/user-credentials.js';
import { JWTAuthGuard } from '$infra/http/middleware/guards/jwt-auth-guard.js';
import { ChangePollStatusRequestDTO } from './dto/change-poll-status.request-dto.js';
import {
    SubmitVotingPollVoteRequestDTO,
    SubmitElectionsPollVoteRequestDTO,
} from './dto/submit-poll-vote.request-dto.js';
import { CreateVotingPollRequestDTO, CreateElectionsPollRequestDTO } from './dto/create-poll.request-dto.js';
import { PollPreviewListRequestDTO } from './dto/poll-preview-list.request-dto.js';
import { EditPollRequestDTO } from './dto/edit-poll.request-dto.js';
import type { IPollPreviewListQueryHandler } from '$ports/queries/poll-preview/poll-preview-list.query-handler.interface.js';
import type { IPollResultsQueryHandler } from '$ports/queries/poll-results/poll-results.query-handler.interface.js';
import type { IPollOverviewQueryHandler } from '$ports/queries/poll-overview/poll-overview.query-handler.interface.js';
import type { TPollPreviewListResponseDTO } from './dto/poll-preview-list.response-dto.type.js';
import type { ICreatePollResponseDTO } from './dto/create-poll.response-dto.interface.js';
import type { TPollOverviewResponseDTO } from './dto/poll-overview.response-dto.type.js';
import type { TPollResultsResponseDTO } from './dto/poll-results.response-dto.type.js';

// const delay = (ms: number): Promise<void> => {
//     return new Promise((resolve) => setTimeout(resolve, ms));
// };

@Controller('polls')
export class PollController {
    constructor(
        private readonly _createPollCommandHandler: CreatePollCommandHandler,
        private readonly _editPollCommandHandler: EditPollCommandHandler,
        private readonly _changePollStatusCommandHandler: ChangePollStatusCommandHandler,
        private readonly _submitPollVoteCommandHandler: SubmitPollVoteCommandHandler,
        private readonly _retractPollVoteCommandHandler: RetractPollVoteCommandHandler,
        @Inject('IPollPreviewListQueryHandler') private readonly _pollListQuery: IPollPreviewListQueryHandler,
        @Inject('IPollOverviewQueryHandler') private readonly _pollOverviewQueryHandler: IPollOverviewQueryHandler,
        @Inject('IPollResultsQueryHandler') private readonly _pollResultsQueryHandler: IPollResultsQueryHandler,
    ) {}

    @UseGuards(JWTAuthGuard)
    @Post('filtered-list')
    public async getList(
        @UserCredentials('id') userId: string,
        @Body() dto: PollPreviewListRequestDTO,
    ): Promise<TPollPreviewListResponseDTO> {
        // await delay(5000);

        const result = await this._pollListQuery.handle(userId, {
            ...dto,
        });

        return result.match({
            success: (pollList) => pollList,
            failure: (error) => {
                throw new InternalServerErrorException(error, 'Unhandled error');
            },
        });
    }

    @UseGuards(JWTAuthGuard)
    @Get(':pollId/overview')
    public async getOverview(
        @Param('pollId', ParseUUIDPipe) pollId: string,
        @UserCredentials('id') userId: string,
    ): Promise<TPollOverviewResponseDTO> {
        // await delay(5000);
        const result = await this._pollOverviewQueryHandler.handle({ pollId, userId });

        return result.match({
            success: (pollOverview) => pollOverview,
            failure: (error) => {
                if (error.code === SharedErrorCodes.NOT_FOUND) {
                    throw new NotFoundException({ code: error.code, message: error.message });
                }

                if (error.code === SharedErrorCodes.NOT_PERMITTED) {
                    throw new ForbiddenException({ code: error.code, message: error.message });
                }

                throw new InternalServerErrorException(error, 'Unhandled error');
            },
        });
    }

    @UseGuards(JWTAuthGuard)
    @Get(':pollId/results')
    public async getResults(
        @Param('pollId', ParseUUIDPipe) pollId: string,
        @UserCredentials('id') userId: string,
    ): Promise<TPollResultsResponseDTO> {
        // await delay(5000);
        const result = await this._pollResultsQueryHandler.handle({ pollId, userId });

        return result.match({
            success: (pollResults) => pollResults,
            failure: (error) => {
                if (error.code === SharedErrorCodes.NOT_FOUND) {
                    throw new NotFoundException({ code: error.code, message: error.message });
                }

                if (error.code === SharedErrorCodes.NOT_PERMITTED) {
                    throw new ForbiddenException({ code: error.code, message: error.message });
                }

                throw new InternalServerErrorException(error, 'Unhandled error');
            },
        });
    }

    @UseGuards(JWTAuthGuard)
    @Post()
    public async create(
        @UserCredentials('id') userId: string,
        @Body(CreatePollValidationPipe) dto: CreateVotingPollRequestDTO | CreateElectionsPollRequestDTO,
    ): Promise<ICreatePollResponseDTO> {
        // await delay(5000);

        const result = await this._createPollCommandHandler.handle({
            userId,
            ...dto,
        });

        return result.match({
            success: (pollId) => ({ id: pollId.value }),
            failure: (error) => {
                if (error.code === ErrorCodes.DUPLICATED_OPTION || error.code === ErrorCodes.DUPLICATED_ACCESS_HOLDER) {
                    throw new UnprocessableEntityException({ code: error.code, message: error.message });
                }

                throw new InternalServerErrorException(error, 'Unhandled error');
            },
        });
    }

    @UseGuards(JWTAuthGuard)
    @Patch(':pollId')
    public async edit(
        @UserCredentials('id') userId: string,
        @Param('pollId', ParseUUIDPipe) pollId: string,
        @Body() dto: EditPollRequestDTO,
    ): Promise<void> {
        // await delay(5000);
        const result = await this._editPollCommandHandler.handle({
            pollId: pollId,
            userId,
            isUserRegistered: true,
            ...dto,
        });

        return result.match({
            success: () => {},
            failure: (error) => {
                if (error.code === SharedErrorCodes.NOT_FOUND) {
                    throw new NotFoundException({ code: error.code, message: error.message });
                }

                if (error.code === ErrorCodes.STATUS_RESTRICTIONS) {
                    throw new UnprocessableEntityException({ code: error.code, message: error.message });
                }

                if (error.code === SharedErrorCodes.NOT_PERMITTED) {
                    throw new ForbiddenException({ code: error.code, message: error.message });
                }

                throw new InternalServerErrorException(error, 'Unhandled error');
            },
        });
    }

    @UseGuards(JWTAuthGuard)
    @Patch(':pollId/status')
    public async changeStatus(
        @UserCredentials('id') userId: string,
        @Param('pollId', ParseUUIDPipe) pollId: string,
        @Body() dto: ChangePollStatusRequestDTO,
    ): Promise<void> {
        // await delay(5000);
        const result = await this._changePollStatusCommandHandler.handle({
            pollId,
            userId,
            isUserRegistered: true,
            ...dto,
        });

        return result.match({
            success: () => {},
            failure: (error) => {
                if (error.code === SharedErrorCodes.NOT_FOUND) {
                    throw new NotFoundException({ code: error.code, message: error.message });
                }

                if (error.code === SharedErrorCodes.NOT_PERMITTED) {
                    throw new ForbiddenException({ code: error.code, message: error.message });
                }

                if (error.code === ErrorCodes.INVALID_STATUS_TRANSITION) {
                    throw new ConflictException({ code: error.code, message: error.message });
                }

                throw new InternalServerErrorException(error, 'Unhandled error');
            },
        });
    }

    @UseGuards(JWTAuthGuard)
    @Post(':pollId/vote')
    public async submitVote(
        @UserCredentials('id') userId: string,
        @Param('pollId', ParseUUIDPipe) pollId: string,
        @Body(SubmitPollVoteValidationPipe) dto: SubmitVotingPollVoteRequestDTO | SubmitElectionsPollVoteRequestDTO,
    ): Promise<void> {
        // await delay(5000);
        const result = await this._submitPollVoteCommandHandler.handle({
            pollId: pollId,
            userId,
            isUserRegistered: true,
            ...dto,
        });

        return result.match({
            success: () => {},
            failure: (error) => {
                if (error.code === SharedErrorCodes.NOT_FOUND) {
                    throw new NotFoundException({ code: error.code, message: error.message });
                }

                if (error.code === SharedErrorCodes.NOT_PERMITTED) {
                    throw new ForbiddenException({ code: error.code, message: error.message });
                }

                if (
                    [
                        ErrorCodes.DUPLICATED_OPTION,
                        ErrorCodes.CHOSEN_OPTIONS_COUNT,
                        ErrorCodes.STATUS_RESTRICTIONS,
                    ].includes(error.code)
                ) {
                    throw new UnprocessableEntityException({ code: error.code, message: error.message });
                }

                throw new InternalServerErrorException(error, 'Unhandled error');
            },
        });
    }

    @UseGuards(JWTAuthGuard)
    @Delete(':pollId/vote')
    public async retractVote(
        @UserCredentials('id') userId: string,
        @Param('pollId', ParseUUIDPipe) pollId: string,
    ): Promise<void> {
        // await delay(5000);
        const result = await this._retractPollVoteCommandHandler.handle({
            pollId: pollId,
            userId,
        });

        return result.match({
            success: () => {},
            failure: (error) => {
                if (error.code === SharedErrorCodes.NOT_FOUND) {
                    throw new NotFoundException({ code: error.code, message: error.message });
                }

                if (error.code === SharedErrorCodes.NOT_PERMITTED) {
                    throw new ForbiddenException({ code: error.code, message: error.message });
                }

                if (error.code === ErrorCodes.STATUS_RESTRICTIONS) {
                    throw new UnprocessableEntityException({ code: error.code, message: error.message });
                }

                throw new InternalServerErrorException(error, 'Unhandled error');
            },
        });
    }
}
