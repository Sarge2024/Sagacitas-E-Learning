import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dbService } from '../dbService';
import { supabase } from '../../lib/supabaseClient';

// Mock Supabase client
vi.mock('../../lib/supabaseClient', () => {
  const mockSelect = vi.fn();
  const mockOrder = vi.fn();
  const mockEq = vi.fn();
  const mockSingle = vi.fn();
  const mockInsert = vi.fn();

  // Setup the chainable mock
  mockSelect.mockReturnValue({ order: mockOrder, eq: mockEq, single: mockSingle });
  mockOrder.mockReturnValue({ eq: mockEq, data: [], error: null });
  mockEq.mockReturnValue({ order: mockOrder, single: mockSingle, data: [], error: null });
  mockSingle.mockReturnValue({ data: null, error: null });
  mockInsert.mockReturnValue({ select: mockSelect });

  return {
    supabase: {
      from: vi.fn(() => ({
        select: mockSelect,
        insert: mockInsert,
      })),
    },
    getCurrentTenantId: vi.fn(() => 'test-tenant-id'),
  };
});

describe('Database Service (dbService)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getCategories should fetch and order categories', async () => {
    const mockData = [{ id: '1', name: 'Tech' }];
    
    // We need to specifically mock the return value for this chain
    const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null });
    const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });
    vi.mocked(supabase.from).mockReturnValueOnce({ select: mockSelect } as any);

    const result = await dbService.getCategories();
    
    expect(supabase.from).toHaveBeenCalledWith('course_categories');
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockOrder).toHaveBeenCalledWith('code', { ascending: true });
    expect(result).toEqual(mockData);
  });

  it('enrollStudent should insert and return the new enrollment', async () => {
    const mockEnrollment = { id: '123', student_id: 's1', class_id: 'c1' };
    
    const mockSingle = vi.fn().mockResolvedValue({ data: mockEnrollment, error: null });
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
    vi.mocked(supabase.from).mockReturnValueOnce({ insert: mockInsert } as any);

    const result = await dbService.enrollStudent('s1', 'c1');
    
    expect(supabase.from).toHaveBeenCalledWith('class_enrollments');
    expect(mockInsert).toHaveBeenCalledWith({
      student_id: 's1',
      class_id: 'c1',
      tenant_id: 'test-tenant-id',
    });
    expect(result).toEqual(mockEnrollment);
  });
});
