import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ChangePollStatusCommandHandler } from '$components/survey-service/application/commands/change-poll-status/change-poll-status.command-handler.js';
import { CreatePollCommandHandler } from '$components/survey-service/application/commands/create-poll/create-poll.command-handler.js';
import { EditPollCommandHandler } from '$components/survey-service/application/commands/edit-poll/edit-poll.command-handler.js';
import { SubmitPollVoteCommandHandler } from '$components/survey-service/application/commands/submit-poll-vote/submit-poll-vote.command-handler.js';
import { RetractPollVoteCommandHandler } from '$components/survey-service/application/commands/retract-poll-vote/retract-poll-vote.command-handler.js';
import { PollORMSchema } from '$infra/persistence/mikro-orm/orm-entities/poll.orm-entity.js';
import { PollOptionORMSchema } from '$infra/persistence/mikro-orm/orm-entities/poll-option.orm-entity.js';
import { PollVoteORMSchema } from '$infra/persistence/mikro-orm/orm-entities/poll-vote.orm-entity.js';
import { PollAccessHolderORMSchema } from '$infra/persistence/mikro-orm/orm-entities/poll-access-holder.orm-entity.js';
import { PollStatisticsAccessHolderORMSchema } from '$infra/persistence/mikro-orm/orm-entities/poll-statistics-access-holder.orm-entity.js';
import { PollRepository } from '$infra/persistence/mikro-orm/repositories/poll.repository.js';
import { PollController } from '$infra/http/controllers/polls/poll.controller.js';
import { PollOverviewQueryHandler } from '$infra/persistence/mikro-orm/queries/poll-overview.query-handler.js';
import { PollPreviewListQueryHandler } from '$infra/persistence/mikro-orm/queries/poll-preview-list.query-handler.js';
import { PollResultsQueryHandler } from '$infra/persistence/mikro-orm/queries/poll-results.query-handler.js';
import { AuthModule } from './auth.module.js';

@Module({
    imports: [
        AuthModule,
        MikroOrmModule.forFeature([
            PollORMSchema,
            PollOptionORMSchema,
            PollVoteORMSchema,
            PollAccessHolderORMSchema,
            PollStatisticsAccessHolderORMSchema,
        ]),
    ],
    controllers: [PollController],
    providers: [
        CreatePollCommandHandler,
        EditPollCommandHandler,
        ChangePollStatusCommandHandler,
        SubmitPollVoteCommandHandler,
        RetractPollVoteCommandHandler,
        { provide: 'IPollRepository', useClass: PollRepository },
        { provide: 'IPollPreviewListQueryHandler', useClass: PollPreviewListQueryHandler },
        { provide: 'IPollOverviewQueryHandler', useClass: PollOverviewQueryHandler },
        { provide: 'IPollResultsQueryHandler', useClass: PollResultsQueryHandler },
    ],
    exports: [],
})
export class PollModule {}
