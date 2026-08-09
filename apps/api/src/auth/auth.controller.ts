import { Body, Controller, Get, Post, Req, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { ApproveSupabaseUserDto } from './dto/approve-supabase-user.dto';
import { AuthService } from './auth.service';
import { Roles } from './roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Get('me')
  me(@Req() request: Request) {
    if (!request.user) {
      throw new UnauthorizedException('A valid sign-in is required.');
    }

    return {
      user: request.user,
    };
  }

  @Post('approve-supabase-user')
  @Roles('SUPER_ADMIN')
  approveSupabaseUser(@Body() dto: ApproveSupabaseUserDto) {
    return this.auth.approveExistingSupabaseUser(dto.email);
  }
}
