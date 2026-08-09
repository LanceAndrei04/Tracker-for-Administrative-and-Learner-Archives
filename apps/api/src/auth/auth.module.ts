import { Global, Module, OnModuleInit } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from './auth.service';
import { SupabaseAuthGuard } from './supabase-auth.guard';

@Global()
@Module({
  providers: [
    AuthService,
    { provide: APP_GUARD, useClass: SupabaseAuthGuard },
  ],
  exports: [AuthService],
})
export class AuthModule implements OnModuleInit {
  constructor(private readonly auth: AuthService) {}

  async onModuleInit() {
    await this.auth.provisionInitialSuperAdmin();
  }
}
