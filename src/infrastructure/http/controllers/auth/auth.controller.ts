import {
    Controller,
    HttpCode,
    Post,
    Body,
    Res,
    HttpStatus,
    UnauthorizedException,
    ConflictException,
    InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SharedErrorCodes } from '$shared/errors/shared-error-codes.js';
import { LogInCommandHandler } from '$components/base/application/commands/log-in/log-in.command-handler.js';
import { LogOutCommandHandler } from '$components/base/application/commands/log-out/log-out.command-handler.js';
import { SignUpCommandHandler } from '$components/base/application/commands/sign-up/sign-up.command-handler.js';
import { RefreshSessionCommandHandler } from '$components/base/application/commands/refresh-session/refresh-session.command-handler.js';
import { AuthErrorCodes } from '$components/base/application/services/auth-service/errors/auth-error-codes.js';
import { Cookies } from '$infra/http/middleware/decorators/cookies.js';
import { LogInRequestDTO } from './dto/log-in.request-dto.js';
import { SignUpRequestDTO } from './dto/sign-up.request-dto.js';
import type { Response, CookieOptions } from 'express';
import type { IRefreshSessionResponseDTO } from './dto/refresh-session.response-dto.interface.js';
import type { ISignUpResponseDTO } from './dto/sign-up.response-dto.interface.js';
import type { ILogInResponseDTO } from './dto/log-in.response-dto.interface.js';

// const delay = (ms: number): Promise<void> => {
//     return new Promise((resolve) => setTimeout(resolve, ms));
// };

@Controller('auth')
export class AuthController {
    private readonly _CookieOptions: CookieOptions;

    constructor(
        private readonly _configService: ConfigService,
        private readonly _logInCommandHandler: LogInCommandHandler,
        private readonly _logOutCommandHandler: LogOutCommandHandler,
        private readonly _signUpCommandHandler: SignUpCommandHandler,
        private readonly _refreshSessionCommandHandler: RefreshSessionCommandHandler,
    ) {
        this._CookieOptions = {
            httpOnly: true,
            secure: _configService.get('NODE_ENV') === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/api/v1/auth/refresh',
        } as const;
    }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    public async logIn(
        @Body() dto: LogInRequestDTO,
        @Res({ passthrough: true }) response: Response,
    ): Promise<ILogInResponseDTO> {
        // await delay(5000);
        const result = await this._logInCommandHandler.handle(dto);

        return result
            .tap(({ refreshToken }) => response.cookie('refreshToken', refreshToken, this._CookieOptions))
            .match({
                success: ({ accessToken }) => ({ accessToken }),
                failure: (error) => {
                    if (error.code === AuthErrorCodes.INVALID_CREDENTIALS) {
                        throw new UnauthorizedException({
                            code: error.code,
                            message: error.message,
                        });
                    }

                    throw new InternalServerErrorException(error, 'Unhandled error');
                },
            });
    }

    @Post('signup')
    public async signUp(
        @Body() dto: SignUpRequestDTO,
        @Res({ passthrough: true }) response: Response,
    ): Promise<ISignUpResponseDTO> {
        // await delay(5000);
        const result = await this._signUpCommandHandler.handle(dto);

        return result
            .tap(({ refreshToken }) => response.cookie('refreshToken', refreshToken, this._CookieOptions))
            .match({
                success: ({ accessToken }) => ({ accessToken }),
                failure: (error) => {
                    if (error.code === AuthErrorCodes.INVALID_CREDENTIALS) {
                        throw new ConflictException({
                            code: error.code,
                            message: error.message,
                        });
                    }

                    throw new InternalServerErrorException(error, 'Unhandled error');
                },
            });
    }

    @HttpCode(HttpStatus.OK)
    @Post('logout')
    public async logOut(
        @Res({ passthrough: true }) response: Response,
        @Cookies('refreshToken') refreshToken?: string,
    ): Promise<void> {
        // await delay(5000);
        const result = await this._logOutCommandHandler.handle(refreshToken);

        return result
            .tap(() => response.clearCookie('refreshToken', this._CookieOptions))
            .tapError(() => response.clearCookie('refreshToken', this._CookieOptions))
            .match({
                success: () => {},
                failure: (error) => {
                    if (
                        error.code === AuthErrorCodes.INVALID_REFRESH_TOKEN ||
                        error.code === SharedErrorCodes.NOT_FOUND
                    ) {
                        return;
                    }

                    throw new InternalServerErrorException(error, 'Unhandled error');
                },
            });
    }

    @HttpCode(HttpStatus.OK)
    @Post('refresh')
    public async refreshSession(
        @Res({ passthrough: true }) response: Response,
        @Cookies('refreshToken') refreshToken?: string,
    ): Promise<IRefreshSessionResponseDTO> {
        // await delay(5000);
        const result = await this._refreshSessionCommandHandler.handle(refreshToken);

        return result
            .tap(({ refreshToken }) => response.cookie('refreshToken', refreshToken, this._CookieOptions))
            .tapError(() => response.clearCookie('refreshToken', this._CookieOptions))
            .match({
                success: ({ accessToken }) => ({ accessToken }),
                failure: (error) => {
                    if (
                        error.code === AuthErrorCodes.INVALID_REFRESH_TOKEN ||
                        error.code === SharedErrorCodes.NOT_FOUND
                    ) {
                        throw new UnauthorizedException({
                            code: error.code,
                            message: `${error.message} Try to re-login.`,
                        });
                    }

                    throw new InternalServerErrorException(error, 'Unhandled error');
                },
            });
    }
}
