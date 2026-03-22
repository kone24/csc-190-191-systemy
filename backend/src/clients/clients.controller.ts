import { Body, Controller, Get, Query, Post, Patch, Delete, Param, UseGuards, HttpCode, Req, ForbiddenException, BadRequestException } from '@nestjs/common';
import type { Request } from 'express';
import { ClientsSupabaseService } from './clients.supabase.service';
import { ClientProfileDto } from './dto/client-profile.dto';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientTagsDto } from './dto/update-client-tags.dto';
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
  async create(@Body() body: CreateClientDto) {
    const saved = await this.clientsService.create(body);
    return {
      ok: true,
      message: 'Client Info Saved Successfully',
      client: saved,
    };
  }

  // Endpoint for external "Contact Us" forms to create client record.
  // Auth: shared secret via X-Api-Secret header (stored in CONTACT_FORM_SECRET env var).
  // Used by Google Apps Script bridging Squarespace/WordPress contact forms to the CRM.
  @Post('contact')
  @HttpCode(201)
  async createFromContact(@Body() body: any, @Req() req: Request) {
    const secret = process.env.CONTACT_FORM_SECRET;
    const provided = req.headers['x-api-secret'] as string | undefined;

    if (!secret || !provided || provided !== secret) {
      throw new ForbiddenException('Invalid or missing API secret');
    }

    // Record which site the submission came from (passed in body by the Apps Script)
    const source = String(body?.source ?? 'external').trim();

    const firstName = String(body?.firstName ?? '').trim();
    const email = String(body?.email ?? '').trim().toLowerCase();
    const lastName = String(body?.lastName ?? '').trim() || undefined;
    const message = String(body?.message ?? '').trim() || undefined;
    const newsletter = body?.newsletter === true || body?.newsletter === 'true' || body?.newsletter === 'yes';

    if (!firstName || !email) {
      throw new BadRequestException('Missing required fields');
    }

    const saved = await this.clientsService.createContactClient({ firstName, lastName, email, message, origin: source, newsletter });
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

  // TODO: Restrict tag updates to admin/manager roles once SYS-134 permissions branch is merged
  //@UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateClientTagsDto) {
    const updated = await this.clientsService.update(id, body);
    return { ok: true, client: updated };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const client = await this.clientsService.findOne(id);
    return { ok: true, client };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.clientsService.remove(id);
    return { ok: true, message: 'Client deleted' };
  }

  @Get(':id/profile')
  getProfile(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }
}
