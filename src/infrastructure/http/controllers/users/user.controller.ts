import {
    Controller,
    Get,
    Inject,
    Query,
    InternalServerErrorException,
    UseGuards,
    NotFoundException,
    Post,
    Body,
} from '@nestjs/common';
import { SharedErrorCodes } from '$shared/errors/shared-error-codes.js';
import { UserCredentials } from '$infra/http/middleware/decorators/user-credentials.js';
import { JWTAuthGuard } from '$infra/http/middleware/guards/jwt-auth-guard.js';
import { UserPreviewListRequestDTO } from './dto/user-preview-list.request-dto.js';
import { UserExistenceRequestDTO } from './dto/user-existence.request-dto.js';
import { KnownUserListRequestDTO } from './dto/known-user-list.request-dto.js';
import type { ICheckUserExistsQueryHandler } from '$ports/queries/check-user-exists/check-user-exists.query-handler.interface.js';
import type { IUserPreviewQueryHandler } from '$ports/queries/user/user-preview.query-handler.interface.js';
import type { IUserPreviewListQueryHandler } from '$ports/queries/user/user-preview-list.query-handler.interface.js';
import type { IKnownUserListQueryHandler } from '$ports/queries/user/known-user-list.query-handler.interface.js';
import type { IUserExistenceResponseDTO } from './dto/user-existence.response-dto.interface.js';
import type { TUserPreviewListResponseDTO } from './dto/user-preview-list.response-dto.type.js';
import type { TViewerResponseDTO } from './dto/viewer.response-dto.type.js';
import type { TKnownUserListResponseDTO } from './dto/known-user-list.response-dto.type.js';

// const delay = (ms: number): Promise<void> => {
//     return new Promise((resolve) => setTimeout(resolve, ms));
// };

@Controller('users')
export class UserController {
    constructor(
        @Inject('ICheckUserExistsQueryHandler')
        private readonly _checkUserExistsQueryHandler: ICheckUserExistsQueryHandler,
        @Inject('IUserPreviewListQueryHandler')
        private readonly _userPreviewListQueryHandler: IUserPreviewListQueryHandler,
        @Inject('IKnownUserListQueryHandler')
        private readonly _knownUserListQueryHandler: IKnownUserListQueryHandler,
        @Inject('IUserPreviewQueryHandler') private readonly _userPreviewQueryHandler: IUserPreviewQueryHandler,
    ) {}

    @Get('exists')
    public async checkIfUserIsRegistered(@Query() query: UserExistenceRequestDTO): Promise<IUserExistenceResponseDTO> {
        // await delay(5000);
        const result = await this._checkUserExistsQueryHandler.handle(query.email);

        return result.match({
            success: (isExists) => ({ isExists }),
            failure: (error) => {
                throw new InternalServerErrorException(error, 'Unhandled error');
            },
        });
    }

    @UseGuards(JWTAuthGuard)
    @Post('known')
    public async getKnownList(
        @UserCredentials('id') userId: string,
        @Body() dto: KnownUserListRequestDTO,
    ): Promise<TKnownUserListResponseDTO> {
        // await delay(5000);
        const result = await this._knownUserListQueryHandler.handle({ userId, ...dto });

        return result.match({
            success: (userList) => userList,
            failure: (error) => {
                throw new InternalServerErrorException(error, 'Unhandled error');
            },
        });
    }

    @UseGuards(JWTAuthGuard)
    @Post('filtered-list')
    public async getList(@Body() dto: UserPreviewListRequestDTO): Promise<TUserPreviewListResponseDTO> {
        // await delay(5000);
        const result = await this._userPreviewListQueryHandler.handle(dto);

        return result.match({
            success: (userList) => userList,
            failure: (error) => {
                throw new InternalServerErrorException(error, 'Unhandled error');
            },
        });
    }

    @UseGuards(JWTAuthGuard)
    @Get('me')
    public async getCurrent(@UserCredentials('id') userId: string): Promise<TViewerResponseDTO> {
        // await delay(5000);
        const result = await this._userPreviewQueryHandler.handle(userId);

        return result.match({
            success: (user) => user,
            failure: (error) => {
                if (error.code === SharedErrorCodes.NOT_FOUND) {
                    throw new NotFoundException({ code: error.code, message: error.message });
                }

                throw new InternalServerErrorException(error, 'Unhandled error');
            },
        });
    }
}
