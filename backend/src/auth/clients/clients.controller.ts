import { Body, Controller, Get, Query, Post, Param, UseGuards, HttpCode, Req, ForbiddenException } from '@nestjs/common';
import type { Request } from 'express';
import { ClientsService } from './clients.service';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get('search')
  async search(@Query('q') query: string) {
    return this.clientsService.searchClients(query);
  }

  @Post()
  @HttpCode(201)
  async create(@Body() body: any) {
    const saved = await this.clientsService.createClient(body);
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
  // async list(
  //   @Query('query') q?: string,
  //   @Query('page') page?: string,
  //   @Query('limit') limit?: string,
  // ) {
  //   const p = Math.max(parseInt(page ?? '1', 10) || 1, 1);
  //   const l = Math.max(parseInt(limit ?? '20', 10) || 20, 1);
  //   const offset = (p - 1) * l;
  //   const items = await this.clientsService.searchClients(q);
  //   return { ok: true, items, page: p, limit: l };
  // }
  async list(@Query('query') q?: string) {
    const items = await this.clientsService.searchClients(q ?? '');
    return { ok: true, items };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const client = await this.clientsService.getClientById(id);
    return { ok: true, client };
  }
}
