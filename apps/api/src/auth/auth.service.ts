import { ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from './auth.types';

@Injectable()
export class AuthService {
  private readonly supabase: SupabaseClient;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const url = config.get<string>('SUPABASE_URL');
    const secretKey = config.get<string>('SUPABASE_SECRET_KEY');
    if (!url || !secretKey) {
      throw new Error('SUPABASE_URL and SUPABASE_SECRET_KEY must be configured on the API server.');
    }

    this.supabase = createClient(url, secretKey, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
      realtime: { transport: WebSocket as any },
    });
  }

  async authenticate(accessToken: string): Promise<AuthenticatedUser> {
    const { data, error } = await this.supabase.auth.getUser(accessToken);
    if (error || !data.user?.email) {
      throw new UnauthorizedException('A valid sign-in is required.');
    }

    const user = await this.prisma.user.findUnique({
      where: { supabaseUserId: data.user.id },
      select: { id: true, email: true, role: true, isActive: true },
    });
    if (!user || !user.isActive) {
      throw new ForbiddenException('This account is not approved to access TALA.');
    }

    return { id: user.id, email: user.email, role: user.role };
  }

  async provisionInitialSuperAdmin(): Promise<void> {
    const email = this.config.get<string>('INITIAL_SUPER_ADMIN_EMAIL')?.trim().toLowerCase();
    if (!email) {
      throw new Error('INITIAL_SUPER_ADMIN_EMAIL must be configured on the API server.');
    }
    const users = await this.listUsersWithRetry();
    const authUser = users.find((user) => user.email?.toLowerCase() === email);
    if (!authUser) {
      throw new Error(`Initial Super Admin ${email} does not exist in Supabase Auth.`);
    }

    await this.prisma.user.upsert({
      where: { supabaseUserId: authUser.id },
      update: { email, role: 'SUPER_ADMIN', isActive: true },
      create: { supabaseUserId: authUser.id, email, role: 'SUPER_ADMIN', isActive: true },
    });
  }

  async inviteTeacher(fullName: string, email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const redirectTo = `${(this.config.get<string>('WEB_ORIGIN') ?? 'http://localhost:3000').split(',')[0].trim()}/set-password`;
    const { data, error } = await this.supabase.auth.admin.inviteUserByEmail(normalizedEmail, {
      data: { full_name: fullName.trim() },
      redirectTo,
    });
    if (error || !data.user) {
      throw new ForbiddenException('The teacher invitation could not be created.');
    }

    await this.prisma.user.upsert({
      where: { supabaseUserId: data.user.id },
      update: { email: normalizedEmail, role: 'TEACHER', isActive: true },
      create: { supabaseUserId: data.user.id, email: normalizedEmail, role: 'TEACHER', isActive: true },
    });
    return { email: normalizedEmail, role: 'TEACHER' as const };
  }

  async approveExistingSupabaseUser(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const users = await this.listUsersWithRetry();
    const authUser = users.find((user) => user.email?.toLowerCase() === normalizedEmail);
    if (!authUser) throw new NotFoundException('No matching Supabase user was found. Invite the teacher in Supabase first.');

    const user = await this.prisma.user.upsert({
      where: { supabaseUserId: authUser.id },
      update: { email: normalizedEmail, role: 'TEACHER', isActive: true },
      create: { supabaseUserId: authUser.id, email: normalizedEmail, role: 'TEACHER', isActive: true },
    });
    return { id: user.id, email: user.email, role: user.role };
  }

  private async listUsersWithRetry() {
    let lastError: unknown;
    for (const delayMs of [0, 500, 1_000]) {
      if (delayMs) await new Promise((resolve) => setTimeout(resolve, delayMs));
      try {
        const { data, error } = await this.supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
        if (error) throw error;
        return data.users;
      } catch (error) {
        lastError = error;
      }
    }
    throw new Error('Unable to reach Supabase Auth while provisioning the initial Super Admin.', { cause: lastError });
  }
}
