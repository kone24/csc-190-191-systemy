import { Body, Controller, Get, Query, Post, Param, UseGuards, HttpCode } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientProfileDto } from './dto/client-profile.dto';

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

  @Get()
  async list(@Query('query') q?: string) {
    const items = await this.clientsService.searchClients(q ?? '');
    return { ok: true, items };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const client = await this.clientsService.getClientById(id);
    return { ok: true, client };
  }

  @Get(':id/profile')
  getProfile(@Param('id') id: string) {
    return this.clientsService.getClientProfile(id);
  }
}
