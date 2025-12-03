import { Body, Controller, Get, Query, Post, Param, UseGuards, HttpCode } from '@nestjs/common';
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
