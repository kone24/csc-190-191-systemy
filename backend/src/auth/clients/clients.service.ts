import { Injectable } from '@nestjs/common';
import clientsData from '../../../data/clients.json'; 

@Injectable()
export class ClientsService {
  private clients = clientsData;

  searchClients(query: string) {
    const q = query.toLowerCase();
    return this.clients.filter(
      client =>
        client.name.toLowerCase().includes(q) ||
        client.email.toLowerCase().includes(q) ||
        client.notes.toLowerCase().includes(q) ||
        client.tags.some(tag => tag.toLowerCase().includes(q))
    );
  }
}
