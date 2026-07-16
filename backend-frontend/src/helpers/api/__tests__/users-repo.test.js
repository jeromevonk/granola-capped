import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('src/helpers/api', () => ({
  postgresqlRepo: {
    findUser: vi.fn(),
  },
}));

import { postgresqlRepo } from 'src/helpers/api';
import { usersRepo } from 'src/helpers/api/users-repo';

describe('usersRepo.findUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the user (with hash as string) when found', async () => {
    postgresqlRepo.findUser.mockResolvedValue([
      { id: 1, username: 'jerome', hash: Buffer.from('bcrypt-hash') },
    ]);

    const user = await usersRepo.findUser('jerome');

    expect(user).toMatchObject({ id: 1, username: 'jerome' });
    expect(user.hash).toBe('bcrypt-hash');
  });

  it('returns false when no user matches the username', async () => {
    postgresqlRepo.findUser.mockResolvedValue([]);

    expect(await usersRepo.findUser('nobody')).toBe(false);
  });

  it('propagates a DB error instead of swallowing it to false', async () => {
    // Regression: a swallowed error used to be indistinguishable from
    // "user not found", which the login route mis-reported as a wrong
    // password and counted against the rate limiter.
    postgresqlRepo.findUser.mockRejectedValue(new Error('connection timeout'));

    await expect(usersRepo.findUser('jerome')).rejects.toThrow('connection timeout');
  });
});
