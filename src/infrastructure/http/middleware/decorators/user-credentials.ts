import { createParamDecorator } from '@nestjs/common';
import type { IUserPayloadReadModel } from '$ports/queries/user-payload/user-payload.read-model.interface.js';

export const UserCredentials = createParamDecorator((key: keyof IUserPayloadReadModel | undefined, context) => {
    const request = context.switchToHttp().getRequest();
    const user: IUserPayloadReadModel | undefined = request.user;

    return key ? user?.[key] : user;
});
