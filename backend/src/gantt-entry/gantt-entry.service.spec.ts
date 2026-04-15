import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GanttEntryService, GanttEntryRecord } from './gantt-entry.service';

// ---------------------------------------------------------------------------
// Mock Supabase so no real network calls happen
// ---------------------------------------------------------------------------
const mockFrom = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn(() => ({ from: mockFrom })),
}));

// ---------------------------------------------------------------------------
// Supabase query-builder chain helpers
// ---------------------------------------------------------------------------

/** select().order() → resolves { data, error } */
function selectOrderChain(data: any, error: any = null) {
    const order = jest.fn().mockResolvedValue({ data, error });
    const select = jest.fn().mockReturnValue({ order });
    return { select, order };
}

/** insert().select().single() → resolves { data, error } */
function insertSelectSingleChain(data: any, error: any = null) {
    const single = jest.fn().mockResolvedValue({ data, error });
    const select = jest.fn().mockReturnValue({ single });
    const insert = jest.fn().mockReturnValue({ select });
    return { insert, select, single };
}

/** update().eq().select().single() → resolves { data, error } */
function updateEqSelectSingleChain(data: any, error: any = null) {
    const single = jest.fn().mockResolvedValue({ data, error });
    const select = jest.fn().mockReturnValue({ single });
    const eq = jest.fn().mockReturnValue({ select });
    const update = jest.fn().mockReturnValue({ eq });
    return { update, eq, select, single };
}

/** delete().eq() → resolves { error } */
function deleteEqChain(error: any = null) {
    const eq = jest.fn().mockResolvedValue({ error });
    const deleteOp = jest.fn().mockReturnValue({ eq });
    return { delete: deleteOp, eq };
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------
describe('GanttEntryService', () => {
    let service: GanttEntryService;

    beforeEach(async () => {
        mockFrom.mockReset();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GanttEntryService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string) => {
                            if (key === 'SUPABASE_URL') return 'https://fake.supabase.co';
                            if (key === 'SUPABASE_ANON_KEY') return 'fake-anon-key';
                            return undefined;
                        }),
                    },
                },
            ],
        }).compile();

        service = module.get<GanttEntryService>(GanttEntryService);
    });

    // =========================================================================
    // findAll
    // =========================================================================
    describe('findAll()', () => {
        it('returns all gantt entries ordered by start_date', async () => {
            const entries = [
                {
                    gantt_entry_id: 'e1',
                    client_id: 'c1',
                    project_id: 'p1',
                    title: 'Website Rebrand',
                    assignee: 'Alice',
                    color: 'blue',
                    start_date: '2026-04-07',
                    end_date: '2026-04-11',
                    lane: 0,
                },
                {
                    gantt_entry_id: 'e2',
                    client_id: 'c2',
                    project_id: 'p2',
                    title: 'Q1 Campaign',
                    assignee: 'Bob',
                    color: 'green',
                    start_date: '2026-04-14',
                    end_date: '2026-04-25',
                    lane: 1,
                },
            ];
            const chain = selectOrderChain(entries);
            mockFrom.mockReturnValue(chain);

            const result = await service.findAll();

            expect(result).toHaveLength(2);
            expect(result[0].title).toBe('Website Rebrand');
            expect(result[1].title).toBe('Q1 Campaign');
            expect(chain.select).toHaveBeenCalledWith(
                'gantt_entry_id, client_id, project_id, title, assignee, color, start_date, end_date, lane'
            );
            expect(chain.order).toHaveBeenCalledWith('start_date', { ascending: true });
        });

        it('returns empty array when no entries exist', async () => {
            mockFrom.mockReturnValue(selectOrderChain(null));

            const result = await service.findAll();

            expect(result).toEqual([]);
        });

        it('returns empty array when Supabase returns empty data', async () => {
            mockFrom.mockReturnValue(selectOrderChain([]));

            const result = await service.findAll();

            expect(result).toEqual([]);
        });

        it('throws error when Supabase returns an error', async () => {
            mockFrom.mockReturnValue(selectOrderChain(null, { message: 'DB connection failed' }));

            await expect(service.findAll()).rejects.toThrow(
                'Failed to fetch gantt entries: DB connection failed'
            );
        });
    });

    // =========================================================================
    // create
    // =========================================================================
    describe('create()', () => {
        it('successfully creates a new entry with all required fields', async () => {
            const createdEntry: GanttEntryRecord = {
                gantt_entry_id: 'e123',
                client_id: 'c1',
                project_id: 'p1',
                title: 'App Launch',
                assignee: 'Charlie',
                color: 'purple',
                start_date: '2026-04-21',
                end_date: '2026-05-02',
                lane: 2,
            };
            const chain = insertSelectSingleChain(createdEntry);
            mockFrom.mockReturnValue(chain);

            const result = await service.create({
                client_id: 'c1',
                project_id: 'p1',
                title: 'App Launch',
                assignee: 'Charlie',
                color: 'purple',
                start_date: '2026-04-21',
                end_date: '2026-05-02',
                lane: 2,
            });

            expect(result).toEqual(createdEntry);
            expect(chain.insert).toHaveBeenCalledWith({
                client_id: 'c1',
                project_id: 'p1',
                title: 'App Launch',
                assignee: 'Charlie',
                color: 'purple',
                start_date: '2026-04-21',
                end_date: '2026-05-02',
                lane: 2,
            });
        });

        it('creates entry with null assignee and lane when not provided', async () => {
            const createdEntry: GanttEntryRecord = {
                gantt_entry_id: 'e456',
                client_id: 'c1',
                project_id: 'p1',
                title: 'Testing Phase',
                assignee: null,
                color: 'yellow',
                start_date: '2026-05-05',
                end_date: '2026-05-16',
                lane: null,
            };
            const chain = insertSelectSingleChain(createdEntry);
            mockFrom.mockReturnValue(chain);

            const result = await service.create({
                client_id: 'c1',
                project_id: 'p1',
                title: 'Testing Phase',
                color: 'yellow',
                start_date: '2026-05-05',
                end_date: '2026-05-16',
            });

            expect(result.assignee).toBeNull();
            expect(result.lane).toBeNull();
            expect(chain.insert).toHaveBeenCalledWith({
                client_id: 'c1',
                project_id: 'p1',
                title: 'Testing Phase',
                assignee: null,
                color: 'yellow',
                start_date: '2026-05-05',
                end_date: '2026-05-16',
                lane: null,
            });
        });

        it('throws error when Supabase returns an error during insert', async () => {
            mockFrom.mockReturnValue(insertSelectSingleChain(null, { message: 'Constraint violation' }));

            await expect(
                service.create({
                    client_id: 'c1',
                    project_id: 'p1',
                    title: 'Failed Entry',
                    color: 'red',
                    start_date: '2026-04-07',
                    end_date: '2026-04-11',
                })
            ).rejects.toThrow('Failed to create gantt entry: Constraint violation');
        });
    });

    // =========================================================================
    // update
    // =========================================================================
    describe('update()', () => {
        it('successfully updates an existing entry by gantt_entry_id', async () => {
            const updatedEntry: GanttEntryRecord = {
                gantt_entry_id: 'e1',
                client_id: 'c1',
                project_id: 'p1',
                title: 'Updated Title',
                assignee: 'Alice',
                color: 'red',
                start_date: '2026-04-07',
                end_date: '2026-04-11',
                lane: 0,
            };
            const chain = updateEqSelectSingleChain(updatedEntry);
            mockFrom.mockReturnValue(chain);

            const result = await service.update('e1', { title: 'Updated Title', color: 'red' });

            expect(result).toEqual(updatedEntry);
            expect(chain.update).toHaveBeenCalledWith({ title: 'Updated Title', color: 'red' });
            expect(chain.eq).toHaveBeenCalledWith('gantt_entry_id', 'e1');
        });

        it('only includes defined fields in the update payload', async () => {
            const updatedEntry: GanttEntryRecord = {
                gantt_entry_id: 'e1',
                client_id: 'c1',
                project_id: 'p1',
                title: 'Website Rebrand',
                assignee: 'Updated Name',
                color: 'blue',
                start_date: '2026-04-07',
                end_date: '2026-04-11',
                lane: 0,
            };
            const chain = updateEqSelectSingleChain(updatedEntry);
            mockFrom.mockReturnValue(chain);

            await service.update('e1', { assignee: 'Updated Name' });

            expect(chain.update).toHaveBeenCalledWith({ assignee: 'Updated Name' });
        });

        it('throws NotFoundException when entry is not found', async () => {
            const chain = updateEqSelectSingleChain(null);
            mockFrom.mockReturnValue(chain);

            await expect(service.update('nonexistent', { title: 'New Title' })).rejects.toThrow(
                'Gantt entry nonexistent not found'
            );
        });

        it('throws error when Supabase returns an error', async () => {
            mockFrom.mockReturnValue(updateEqSelectSingleChain(null, { message: 'DB error' }));

            await expect(service.update('e1', { title: 'New Title' })).rejects.toThrow(
                'Failed to update gantt entry: DB error'
            );
        });
    });

    // =========================================================================
    // remove
    // =========================================================================
    describe('remove()', () => {
        it('successfully deletes an entry by gantt_entry_id', async () => {
            const chain = deleteEqChain(null);
            mockFrom.mockReturnValue(chain);

            await expect(service.remove('e1')).resolves.toBeUndefined();
            expect(chain.delete).toHaveBeenCalled();
            expect(chain.eq).toHaveBeenCalledWith('gantt_entry_id', 'e1');
        });

        it('throws error when Supabase returns an error', async () => {
            mockFrom.mockReturnValue(deleteEqChain({ message: 'Cannot delete: row locked' }));

            await expect(service.remove('e1')).rejects.toThrow(
                'Failed to delete gantt entry: Cannot delete: row locked'
            );
        });
    });

    // =========================================================================
    // Date filtering logic
    // =========================================================================
    describe('Date filtering (for 2-week preview window)', () => {
        it('correctly identifies entries overlapping with a 2-week window', () => {
            // Window: Apr 7 (Mon) to Apr 18 (Fri) — 10 working days
            const windowStart = '2026-04-07';
            const windowEnd = '2026-04-18';

            const entries = [
                // Entry in current week (Apr 7-11) — should PASS
                {
                    title: 'Week 1 Only',
                    start_date: '2026-04-07',
                    end_date: '2026-04-11',
                },
                // Entry in next week (Apr 14-18) — should PASS
                {
                    title: 'Week 2 Only',
                    start_date: '2026-04-14',
                    end_date: '2026-04-18',
                },
                // Entry spanning both weeks — should PASS
                {
                    title: 'Spans Both Weeks',
                    start_date: '2026-04-07',
                    end_date: '2026-04-18',
                },
                // Entry starting before window — should PASS (overlaps Apr 7-11)
                {
                    title: 'Starts Before Window',
                    start_date: '2026-04-06',
                    end_date: '2026-04-11',
                },
                // Entry ending after window — should PASS (overlaps Apr 14-18)
                {
                    title: 'Ends After Window',
                    start_date: '2026-04-14',
                    end_date: '2026-04-25',
                },
                // Entry entirely before window (ends Apr 4) — should FAIL
                {
                    title: 'Entirely Before',
                    start_date: '2026-03-31',
                    end_date: '2026-04-04',
                },
                // Entry entirely after window (starts Apr 21) — should FAIL
                {
                    title: 'Entirely After',
                    start_date: '2026-04-21',
                    end_date: '2026-04-25',
                },
            ];

            // Filter logic: entry.start_date <= windowEnd AND entry.end_date >= windowStart
            const overlapping = entries.filter(
                (e) => e.start_date <= windowEnd && e.end_date >= windowStart
            );

            expect(overlapping).toHaveLength(5);
            expect(overlapping.map((e) => e.title)).toEqual([
                'Week 1 Only',
                'Week 2 Only',
                'Spans Both Weeks',
                'Starts Before Window',
                'Ends After Window',
            ]);
        });

        it('correctly handles entries on exact window boundaries', () => {
            const windowStart = '2026-04-07';
            const windowEnd = '2026-04-18';

            const entries = [
                // Starts exactly at window start
                { title: 'Exact Start', start_date: '2026-04-07', end_date: '2026-04-11' },
                // Ends exactly at window end
                { title: 'Exact End', start_date: '2026-04-14', end_date: '2026-04-18' },
                // Entry one day before window start
                { title: 'One Day Before', start_date: '2026-04-06', end_date: '2026-04-06' },
                // Entry one day after window end
                { title: 'One Day After', start_date: '2026-04-19', end_date: '2026-04-19' },
            ];

            const overlapping = entries.filter(
                (e) => e.start_date <= windowEnd && e.end_date >= windowStart
            );

            expect(overlapping.map((e) => e.title)).toEqual([
                'Exact Start',
                'Exact End',
                // "One Day Before" (Apr 6–Apr 6) is excluded: end_date < windowStart
                // "One Day After" (Apr 19–Apr 19) is excluded: start_date > windowEnd
            ]);
            expect(overlapping).toHaveLength(2);
        });
    });
});
