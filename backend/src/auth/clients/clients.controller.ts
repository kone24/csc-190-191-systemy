import { Controller, Get, Query } from '@nestjs/common';
import { ClientsService } from './clients.service';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get('search')
  async search(@Query('q') query: string) {
    return this.clientsService.searchClients(query);
  }
}
