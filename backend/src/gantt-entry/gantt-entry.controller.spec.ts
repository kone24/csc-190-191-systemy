import { Test, TestingModule } from '@nestjs/testing';
import { GanttEntryController } from './gantt-entry.controller';
import { GanttEntryService } from './gantt-entry.service';

describe('GanttEntryController', () => {
    let controller: GanttEntryController;
    let service: jest.Mocked<GanttEntryService>;

    const mockEntry = { id: 'ge-1', title: 'Phase 1', start: '2026-01-01', end: '2026-01-31' };

    beforeEach(async () => {
        const mockService = {
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [GanttEntryController],
            providers: [{ provide: GanttEntryService, useValue: mockService }],
        }).compile();

        controller = module.get<GanttEntryController>(GanttEntryController);
        service = module.get(GanttEntryService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    // =========================================================================
    // list()
    // =========================================================================

    describe('list()', () => {
        it('delegates to service.findAll and wraps in { ok, items }', async () => {
            service.findAll.mockResolvedValue([mockEntry] as any);
            const result = await controller.list();
            expect(service.findAll).toHaveBeenCalled();
            expect(result).toEqual({ ok: true, items: [mockEntry] });
        });
    });

    // =========================================================================
    // create()
    // =========================================================================

    describe('create()', () => {
        it('delegates to service.create and wraps in { ok, item }', async () => {
            service.create.mockResolvedValue(mockEntry as any);
            const dto: any = { title: 'Phase 1', start: '2026-01-01', end: '2026-01-31' };
            const result = await controller.create(dto);
            expect(service.create).toHaveBeenCalledWith(dto);
            expect(result).toEqual({ ok: true, item: mockEntry });
        });
    });

    // =========================================================================
    // update()
    // =========================================================================

    describe('update()', () => {
        it('delegates to service.update and wraps in { ok, item }', async () => {
            const updated = { ...mockEntry, title: 'Phase 1 Updated' };
            service.update.mockResolvedValue(updated as any);
            const dto: any = { title: 'Phase 1 Updated' };
            const result = await controller.update('ge-1', dto);
            expect(service.update).toHaveBeenCalledWith('ge-1', dto);
            expect(result).toEqual({ ok: true, item: updated });
        });
    });

    // =========================================================================
    // remove()
    // =========================================================================

    describe('remove()', () => {
        it('delegates to service.remove and returns { ok: true }', async () => {
            service.remove.mockResolvedValue(undefined as any);
            const result = await controller.remove('ge-1');
            expect(service.remove).toHaveBeenCalledWith('ge-1');
            expect(result).toEqual({ ok: true });
        });
    });
});
