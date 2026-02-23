import { Body, Controller, Get, Query, Post, Param, UseGuards, HttpCode } from '@nestjs/common';
import { ClientsSupabaseService } from './clients.supabase.service';
import { ClientProfileDto } from './dto/client-profile.dto';
import { CreateClientDto } from './dto/create-client.dto';

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
