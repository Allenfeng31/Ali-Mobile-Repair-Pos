import { afterEach, describe, expect, it, vi } from 'vitest';

const { revalidatePath } = vi.hoisted(() => ({ revalidatePath: vi.fn() }));

vi.mock('next/cache', () => ({ revalidatePath }));

import { revalidateRepairResultPaths } from './repairResultRevalidation.server';

describe('revalidateRepairResultPaths', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    revalidatePath.mockReset();
  });

  it('continues after a cache failure and logs only bounded path-count context', () => {
    revalidatePath
      .mockImplementationOnce(() => { throw new Error('cache unavailable'); })
      .mockImplementationOnce(() => undefined);
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => revalidateRepairResultPaths(['/repairs/phone/iphone/iphone-16-pro', '/'])).not.toThrow();

    expect(revalidatePath).toHaveBeenNthCalledWith(1, '/repairs/phone/iphone/iphone-16-pro');
    expect(revalidatePath).toHaveBeenNthCalledWith(2, '/');
    expect(error).toHaveBeenCalledWith(
      '[repair-results] Page revalidation failed after successful mutation.',
      { affectedPathCount: 2, failedPathCount: 1 },
    );
  });
});
