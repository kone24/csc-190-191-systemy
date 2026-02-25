import { Body, Controller, Get, Query, Post, Patch, Param, UseGuards, HttpCode, Req, ForbiddenException } from '@nestjs/common';
import type { Request } from 'express';
import { ClientsSupabaseService } from './clients.supabase.service';
import { ClientProfileDto } from './dto/client-profile.dto';
import { CreateClientDto } from './dto/create-client.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsSupabaseService) { }

  @Get('search')
  async search(@Query('q') query: string) {
    const searchQuery = { searchTerm: query };
    return this.clientsService.searchClients(searchQuery);
  }

  @Post()
  @HttpCode(201)
  async create(@Body() body: any) {
    const saved = await this.clientsService.create(body);
    return {
      ok: true,
      message: 'Client Info Saved Successfully',
      client: saved,
    };
  }

  // Endpoint for external "Contact Us" forms to create client record.
  @Post('contact')
  @HttpCode(201)
  async createFromContact(@Body() body: any, @Req() req: Request) {
    const originHeader = (req.headers.origin as string) || (req.headers.referer as string) || '';
    if (!originHeader) throw new ForbiddenException('Missing origin');

    let hostname = '';
    try {
      const url = new URL(originHeader);
      hostname = url.hostname;
    } catch (e) {
      // try with https:// prefix
      try {
        const url = new URL(originHeader, 'https://' + originHeader);
        hostname = url.hostname;
      } catch (e) {
        throw new ForbiddenException('Invalid origin');
      }
    }

    const allowed = ['lightfold.tv', 'headword.co'];
    const ok = allowed.some((a) => hostname === a || hostname.endsWith('.' + a));
    if (!ok) throw new ForbiddenException('Forbidden origin');

    const firstName = String(body?.firstName ?? '').trim();
    const email = String(body?.email ?? '').trim().toLowerCase();
    const lastName = String(body?.lastName ?? '').trim() || undefined;
    const message = String(body?.message ?? '').trim() || undefined;

    if (!firstName || !email) {
      throw new ForbiddenException('Missing required fields');
    }

    const saved = await this.clientsService.createContactClient({ firstName, lastName, email, message, origin: hostname });
    return { ok: true, message: 'Contact client saved', client: saved };
  }

  @Get()
  async list(@Query('query') q?: string) {
    if (q) {
      const searchQuery = { searchTerm: q };
      const items = await this.clientsService.searchClients(searchQuery);
      return { ok: true, items };
    }
    const items = await this.clientsService.findAll();
    return { ok: true, items };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const updated = await this.clientsService.update(id, body);
    return { ok: true, client: updated };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const client = await this.clientsService.findOne(id);
    return { ok: true, client };
  }

  @Get(':id/profile')
  getProfile(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }
}
