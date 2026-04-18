import { Test, TestingModule } from '@nestjs/testing';
import { ClientsController } from './clients.controller';
import { ClientsSupabaseService } from './clients.supabase.service';
import { AuditService } from '../audit/audit.service';

// ---------------------------------------------------------------------------
// Shared test data
// ---------------------------------------------------------------------------

const MOCK_CLIENT = {
  id: 'uuid-test-001',
  first_name: 'Jane',
  last_name: 'Doe',
  email: 'jane.doe@example.com',
  phone_number: '555-123-4567',
  business_name: 'Doe Enterprises',
  title: 'CEO',
  industry: 'Technology',
  website: 'https://doe.example.com',
  additional_info: 'Met at industry conference',
  tags: [],
  created_at: '2026-03-22T00:00:00Z',
  updated_at: '2026-03-22T00:00:00Z',
};

const CREATE_DTO = {
  first_name: 'Jane',
  last_name: 'Doe',
  email: 'jane.doe@example.com',
  phone_number: '555-123-4567',
  business_name: 'Doe Enterprises',
};

// ---------------------------------------------------------------------------
// Mock ClientsSupabaseService — controller-layer tests only
// ---------------------------------------------------------------------------

const mockClientsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  searchClients: jest.fn(),
};

// ---------------------------------------------------------------------------
// Mock Audit Service
// ---------------------------------------------------------------------------
const mockAuditService = {
  logCreate: jest.fn(),
  logUpdate: jest.fn(),
  logDelete: jest.fn(),
  createAudit: jest.fn(),
};

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('ClientsController', () => {
  let controller: ClientsController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [
        { provide: ClientsSupabaseService, useValue: mockClientsService },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    controller = module.get<ClientsController>(ClientsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // =========================================================================
  // POST /clients — Create a new contact
  // =========================================================================

  describe('POST /clients — create a new contact', () => {
    it('should create a client and return ok:true with the saved client', async () => {
      mockClientsService.create.mockResolvedValue(MOCK_CLIENT);

      const result = await controller.create(CREATE_DTO as any);

      expect(mockClientsService.create).toHaveBeenCalledWith(CREATE_DTO);
      expect(result).toEqual({
        ok: true,
        message: 'Client Info Saved Successfully',
        client: MOCK_CLIENT,
      });
    });

    it('should propagate errors thrown by the service', async () => {
      mockClientsService.create.mockRejectedValue(new Error('DB insert failed'));

      await expect(controller.create(CREATE_DTO as any)).rejects.toThrow(
        'DB insert failed',
      );
    });
  });

  // =========================================================================
  // GET /clients/:id — Verify new client appears in the database
  // =========================================================================

  describe('GET /clients/:id — verify client exists in database', () => {
    it('should return ok:true with the created client when found by ID', async () => {
      mockClientsService.findOne.mockResolvedValue(MOCK_CLIENT);

      const result = await controller.get(MOCK_CLIENT.id);

      expect(mockClientsService.findOne).toHaveBeenCalledWith(MOCK_CLIENT.id);
      expect(result).toEqual({ ok: true, client: MOCK_CLIENT });
    });

    it('should propagate a "not found" error when the id does not exist', async () => {
      mockClientsService.findOne.mockRejectedValue(
        new Error(`Client with ID non-existent-id not found`),
      );

      await expect(controller.get('non-existent-id')).rejects.toThrow(
        'not found',
      );
    });

    it('should return the same client that was just created (create → get round-trip)', async () => {
      // Step 1 — create
      mockClientsService.create.mockResolvedValue(MOCK_CLIENT);
      const created = await controller.create(CREATE_DTO as any);
      const createdId = (created as any).client.id;

      // Step 2 — fetch the newly created client by ID
      mockClientsService.findOne.mockResolvedValue(MOCK_CLIENT);
      const fetched = await controller.get(createdId);

      expect((fetched as any).client.id).toBe(createdId);
      expect((fetched as any).client.email).toBe(CREATE_DTO.email);
    });
  });

  // =========================================================================
  // GET /clients — List all contacts
  // =========================================================================

  describe('GET /clients — list all contacts', () => {
    it('should return all clients when no search query is provided', async () => {
      const clients = [MOCK_CLIENT, { ...MOCK_CLIENT, id: 'uuid-test-002', first_name: 'John' }];
      mockClientsService.findAll.mockResolvedValue(clients);

      const result = await controller.list();

      expect(mockClientsService.findAll).toHaveBeenCalled();
      expect((result as any).items).toHaveLength(2);
    });

    it('should use search when a query param is present', async () => {
      mockClientsService.searchClients.mockResolvedValue([MOCK_CLIENT]);

      const result = await controller.list('Jane');

      expect(mockClientsService.searchClients).toHaveBeenCalledWith({
        searchTerm: 'Jane',
      });
      expect((result as any).items).toHaveLength(1);
    });

    it('should include the newly created client in the full list', async () => {
      // Simulate create then list
      mockClientsService.create.mockResolvedValue(MOCK_CLIENT);
      await controller.create(CREATE_DTO as any);

      mockClientsService.findAll.mockResolvedValue([MOCK_CLIENT]);
      const listResult = await controller.list();

      const found = (listResult as any).items.find(
        (c: any) => c.id === MOCK_CLIENT.id,
      );
      expect(found).toBeDefined();
      expect(found.email).toBe(MOCK_CLIENT.email);
    });
  });

  // =========================================================================
  // PATCH /clients/:id — Edit a contact
  // =========================================================================

  describe('PATCH /clients/:id — edit a contact (edit button)', () => {
    it('should update a client and return ok:true with the updated record', async () => {
      const updateDto = { first_name: 'Janet', business_name: 'Updated Corp' };
      const updatedClient = { ...MOCK_CLIENT, ...updateDto };
      mockClientsService.update.mockResolvedValue(updatedClient);

      const result = await controller.update(MOCK_CLIENT.id, updateDto as any);

      expect(mockClientsService.update).toHaveBeenCalledWith(
        MOCK_CLIENT.id,
        updateDto,
      );
      expect(result).toEqual({ ok: true, client: updatedClient });
    });

    it('should reflect updated fields in the returned client', async () => {
      const updateDto = { first_name: 'Janet', business_name: 'Updated Corp' };
      const updatedClient = { ...MOCK_CLIENT, ...updateDto };
      mockClientsService.update.mockResolvedValue(updatedClient);

      const result = await controller.update(MOCK_CLIENT.id, updateDto as any);

      expect((result as any).client.first_name).toBe('Janet');
      expect((result as any).client.business_name).toBe('Updated Corp');
      // Unchanged fields are preserved
      expect((result as any).client.email).toBe(MOCK_CLIENT.email);
    });

    it('should propagate an error when updating a non-existent client', async () => {
      mockClientsService.update.mockRejectedValue(
        new Error('Client with ID bad-id not found'),
      );

      await expect(
        controller.update('bad-id', { first_name: 'X' } as any),
      ).rejects.toThrow('not found');
    });

    it('should support partial tag updates (PATCH only tags)', async () => {
      const tagUpdate = { tags: ['VIP|#8A38F5', 'Hot Lead|#EF4444'] };
      const updatedClient = { ...MOCK_CLIENT, tags: tagUpdate.tags };
      mockClientsService.update.mockResolvedValue(updatedClient);

      const result = await controller.update(MOCK_CLIENT.id, tagUpdate as any);

      expect((result as any).client.tags).toEqual(tagUpdate.tags);
    });
  });

  // =========================================================================
  // DELETE /clients/:id — Delete a contact
  // =========================================================================

  describe('DELETE /clients/:id — delete a contact (delete button)', () => {
    it('should delete a client and return ok:true with confirmation message', async () => {
      mockClientsService.remove.mockResolvedValue(undefined);

      const result = await controller.delete(MOCK_CLIENT.id);

      expect(mockClientsService.remove).toHaveBeenCalledWith(MOCK_CLIENT.id);
      expect(result).toEqual({ ok: true, message: 'Client deleted' });
    });

    it('should propagate an error when deleting a non-existent client', async () => {
      mockClientsService.remove.mockRejectedValue(
        new Error('Failed to delete client: record not found'),
      );

      await expect(controller.delete('ghost-id')).rejects.toThrow(
        'Failed to delete client',
      );
    });

    it('should confirm the client is no longer retrievable after deletion (delete → get round-trip)', async () => {
      // Step 1 — delete succeeds
      mockClientsService.remove.mockResolvedValue(undefined);
      await controller.delete(MOCK_CLIENT.id);

      // Step 2 — subsequent fetch throws "not found"
      mockClientsService.findOne.mockRejectedValue(
        new Error(`Client with ID ${MOCK_CLIENT.id} not found`),
      );

      await expect(controller.get(MOCK_CLIENT.id)).rejects.toThrow('not found');
    });
  });

  // =========================================================================
  // GET /clients/search — Search contacts
  // =========================================================================

  describe('GET /clients/search — search contacts', () => {
    it('should search by query string and return matching clients', async () => {
      mockClientsService.searchClients.mockResolvedValue([MOCK_CLIENT]);

      const result = await controller.search('Jane');

      expect(mockClientsService.searchClients).toHaveBeenCalledWith({
        searchTerm: 'Jane',
      });
      expect(result).toHaveLength(1);
      expect(result[0].first_name).toBe('Jane');
    });

    it('should return an empty array when no clients match the query', async () => {
      mockClientsService.searchClients.mockResolvedValue([]);

      const result = await controller.search('zzz-no-match');

      expect(result).toEqual([]);
    });
  });
});
