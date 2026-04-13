import { Test, TestingModule } from '@nestjs/testing';
import { VendorsController } from './vendors.controller';
import { VendorsSupabaseService } from './vendors.supabase.service';

// ---------------------------------------------------------------------------
// Shared test data
// ---------------------------------------------------------------------------

const MOCK_VENDOR = {
  id: 'uuid-vendor-001',
  first_name: 'Acme',
  last_name: 'Corp',
  email: 'contact@acme.example.com',
  company: 'Acme Corporation',
  business_name: 'Acme Supplies',
  status: 'active',
  outcome: 'approved',
  date_meet: '2026-03-15',
  additional_info: 'Preferred supplier',
  tags: ['Preferred|#22C55E'],
  project_id: 'proj-001',
  project: { project_id: 'proj-001', name: 'Website Redesign' },
  created_at: '2026-03-22T00:00:00Z',
  updated_at: '2026-03-22T00:00:00Z',
};

const CREATE_DTO = {
  first_name: 'Acme',
  last_name: 'Corp',
  email: 'contact@acme.example.com',
  company: 'Acme Corporation',
  business_name: 'Acme Supplies',
  project_id: 'proj-001',
};

// ---------------------------------------------------------------------------
// Mock VendorsSupabaseService — controller-layer tests only
// ---------------------------------------------------------------------------

const mockVendorsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  search: jest.fn(),
};

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('VendorsController', () => {
  let controller: VendorsController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VendorsController],
      providers: [
        { provide: VendorsSupabaseService, useValue: mockVendorsService },
      ],
    }).compile();

    controller = module.get<VendorsController>(VendorsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // =========================================================================
  // POST /vendors — Create a new vendor
  // =========================================================================

  describe('POST /vendors — create a new vendor', () => {
    it('should create a vendor and return ok:true with the saved vendor', async () => {
      mockVendorsService.create.mockResolvedValue(MOCK_VENDOR);

      const result = await controller.create(CREATE_DTO as any);

      expect(mockVendorsService.create).toHaveBeenCalledWith(CREATE_DTO);
      expect(result).toEqual({
        ok: true,
        message: 'Vendor created successfully',
        vendor: MOCK_VENDOR,
      });
    });

    it('should include project join data in the created vendor', async () => {
      mockVendorsService.create.mockResolvedValue(MOCK_VENDOR);

      const result = await controller.create(CREATE_DTO as any);

      expect((result as any).vendor.project).toEqual({
        project_id: 'proj-001',
        name: 'Website Redesign',
      });
    });

    it('should propagate errors thrown by the service', async () => {
      mockVendorsService.create.mockRejectedValue(new Error('DB insert failed'));

      await expect(controller.create(CREATE_DTO as any)).rejects.toThrow(
        'DB insert failed',
      );
    });
  });

  // =========================================================================
  // GET /vendors/:id — Fetch a single vendor
  // =========================================================================

  describe('GET /vendors/:id — fetch a single vendor', () => {
    it('should return ok:true with the vendor when found by ID', async () => {
      mockVendorsService.findOne.mockResolvedValue(MOCK_VENDOR);

      const result = await controller.get(MOCK_VENDOR.id);

      expect(mockVendorsService.findOne).toHaveBeenCalledWith(MOCK_VENDOR.id);
      expect(result).toEqual({ ok: true, vendor: MOCK_VENDOR });
    });

    it('should propagate a "not found" error when the id does not exist', async () => {
      mockVendorsService.findOne.mockRejectedValue(
        new Error('Vendor with ID non-existent-id not found'),
      );

      await expect(controller.get('non-existent-id')).rejects.toThrow(
        'not found',
      );
    });

    it('should return the same vendor that was just created (create → get round-trip)', async () => {
      mockVendorsService.create.mockResolvedValue(MOCK_VENDOR);
      const created = await controller.create(CREATE_DTO as any);
      const createdId = (created as any).vendor.id;

      mockVendorsService.findOne.mockResolvedValue(MOCK_VENDOR);
      const fetched = await controller.get(createdId);

      expect((fetched as any).vendor.id).toBe(createdId);
      expect((fetched as any).vendor.email).toBe(CREATE_DTO.email);
    });
  });

  // =========================================================================
  // GET /vendors — List all vendors
  // =========================================================================

  describe('GET /vendors — list all vendors', () => {
    it('should return all vendors as a raw array', async () => {
      const vendors = [MOCK_VENDOR, { ...MOCK_VENDOR, id: 'uuid-vendor-002', first_name: 'Beta' }];
      mockVendorsService.findAll.mockResolvedValue(vendors);

      const result = await controller.list();

      expect(mockVendorsService.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });

    it('should return an empty array when no vendors exist', async () => {
      mockVendorsService.findAll.mockResolvedValue([]);

      const result = await controller.list();

      expect(result).toEqual([]);
    });

    it('should include project join data for each vendor', async () => {
      mockVendorsService.findAll.mockResolvedValue([MOCK_VENDOR]);

      const result = await controller.list();

      expect(result[0].project).toEqual({
        project_id: 'proj-001',
        name: 'Website Redesign',
      });
    });

    it('should include the newly created vendor in the full list', async () => {
      mockVendorsService.create.mockResolvedValue(MOCK_VENDOR);
      await controller.create(CREATE_DTO as any);

      mockVendorsService.findAll.mockResolvedValue([MOCK_VENDOR]);
      const listResult = await controller.list();

      const found = listResult.find((v: any) => v.id === MOCK_VENDOR.id);
      expect(found).toBeDefined();
      expect(found!.email).toBe(MOCK_VENDOR.email);
    });
  });

  // =========================================================================
  // PATCH /vendors/:id — Update a vendor
  // =========================================================================

  describe('PATCH /vendors/:id — update a vendor', () => {
    it('should update a vendor and return ok:true with the updated record', async () => {
      const updateDto = { company: 'Acme Corp Updated', status: 'inactive' };
      const updatedVendor = { ...MOCK_VENDOR, ...updateDto };
      mockVendorsService.update.mockResolvedValue(updatedVendor);

      const result = await controller.update(MOCK_VENDOR.id, updateDto as any);

      expect(mockVendorsService.update).toHaveBeenCalledWith(
        MOCK_VENDOR.id,
        updateDto,
      );
      expect(result).toEqual({ ok: true, vendor: updatedVendor });
    });

    it('should reflect updated fields while preserving unchanged ones', async () => {
      const updateDto = { company: 'New Company Name' };
      const updatedVendor = { ...MOCK_VENDOR, ...updateDto };
      mockVendorsService.update.mockResolvedValue(updatedVendor);

      const result = await controller.update(MOCK_VENDOR.id, updateDto as any);

      expect((result as any).vendor.company).toBe('New Company Name');
      expect((result as any).vendor.email).toBe(MOCK_VENDOR.email);
    });

    it('should propagate an error when updating a non-existent vendor', async () => {
      mockVendorsService.update.mockRejectedValue(
        new Error('Vendor with ID bad-id not found'),
      );

      await expect(
        controller.update('bad-id', { first_name: 'X' } as any),
      ).rejects.toThrow('not found');
    });

    it('should support partial tag updates', async () => {
      const tagUpdate = { tags: ['Preferred|#22C55E', 'New|#3B82F6'] };
      const updatedVendor = { ...MOCK_VENDOR, tags: tagUpdate.tags };
      mockVendorsService.update.mockResolvedValue(updatedVendor);

      const result = await controller.update(MOCK_VENDOR.id, tagUpdate as any);

      expect((result as any).vendor.tags).toEqual(tagUpdate.tags);
    });

    it('should support updating project_id', async () => {
      const updateDto = { project_id: 'proj-002' };
      const updatedVendor = {
        ...MOCK_VENDOR,
        project_id: 'proj-002',
        project: { project_id: 'proj-002', name: 'New Project' },
      };
      mockVendorsService.update.mockResolvedValue(updatedVendor);

      const result = await controller.update(MOCK_VENDOR.id, updateDto as any);

      expect((result as any).vendor.project_id).toBe('proj-002');
      expect((result as any).vendor.project.name).toBe('New Project');
    });
  });

  // =========================================================================
  // DELETE /vendors/:id — Delete a vendor
  // =========================================================================

  describe('DELETE /vendors/:id — delete a vendor', () => {
    it('should delete a vendor and return ok:true with confirmation message', async () => {
      mockVendorsService.remove.mockResolvedValue(undefined);

      const result = await controller.delete(MOCK_VENDOR.id);

      expect(mockVendorsService.remove).toHaveBeenCalledWith(MOCK_VENDOR.id);
      expect(result).toEqual({ ok: true, message: 'Vendor deleted' });
    });

    it('should propagate an error when deleting a non-existent vendor', async () => {
      mockVendorsService.remove.mockRejectedValue(
        new Error('Failed to delete vendor: record not found'),
      );

      await expect(controller.delete('ghost-id')).rejects.toThrow(
        'Failed to delete vendor',
      );
    });

    it('should confirm the vendor is no longer retrievable after deletion', async () => {
      mockVendorsService.remove.mockResolvedValue(undefined);
      await controller.delete(MOCK_VENDOR.id);

      mockVendorsService.findOne.mockRejectedValue(
        new Error(`Vendor with ID ${MOCK_VENDOR.id} not found`),
      );

      await expect(controller.get(MOCK_VENDOR.id)).rejects.toThrow('not found');
    });
  });

  // =========================================================================
  // GET /vendors/search — Search vendors
  // =========================================================================

  describe('GET /vendors/search — search vendors', () => {
    it('should search by query string and return matching vendors', async () => {
      mockVendorsService.search.mockResolvedValue([MOCK_VENDOR]);

      const result = await controller.search('Acme');

      expect(mockVendorsService.search).toHaveBeenCalledWith('Acme');
      expect(result).toHaveLength(1);
      expect(result[0].first_name).toBe('Acme');
    });

    it('should return an empty array when no vendors match', async () => {
      mockVendorsService.search.mockResolvedValue([]);

      const result = await controller.search('zzz-no-match');

      expect(result).toEqual([]);
    });

    it('should pass empty string when query is undefined', async () => {
      mockVendorsService.search.mockResolvedValue([]);

      const result = await controller.search(undefined as any);

      expect(mockVendorsService.search).toHaveBeenCalledWith('');
      expect(result).toEqual([]);
    });
  });
});
