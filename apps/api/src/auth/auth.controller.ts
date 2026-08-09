import { Controller, Get, Req, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
  @Get('me')
  me(@Req() request: Request) {
    if (!request.user) {
      throw new UnauthorizedException('A valid sign-in is required.');
    }

    return {
      user: request.user,
    };
  }
}
