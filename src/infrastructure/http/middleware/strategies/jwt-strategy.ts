import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import type { IJWTPayloadDTO } from '$ports/services/auth/jwt-payload.dto.interface.js';
import type { IUserPayloadReadModel } from '$ports/queries/user-payload/user-payload.read-model.interface.js';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(private readonly _configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: _configService.getOrThrow('JWT_ACCESS_SECRET'),
        });
    }

    public async validate(payload: IJWTPayloadDTO): Promise<IUserPayloadReadModel> {
        return { id: payload.sub, email: payload.email };
    }
}
