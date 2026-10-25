import { createParamDecorator } from '@nestjs/common';

export const Cookies = createParamDecorator((key: string | undefined, context) => {
    const request = context.switchToHttp().getRequest();

    return key ? request.cookies?.[key] : request.cookies;
});
