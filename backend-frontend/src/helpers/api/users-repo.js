import { postgresqlRepo } from 'src/helpers/api';

export const usersRepo = {
  findUser,
  deleteUser,
};

// Lets DB errors propagate (apiHandler's global error handler turns
// them into a proper 500) instead of returning false, which the
// caller can't tell apart from "no such user" — a swallowed DB error
// used to be misreported as a wrong password and count against the
// login rate limiter.
async function findUser(username) {
  const data = await postgresqlRepo.findUser(username);

  // Find the user with corresponding username
  const user = data.find(u => u.username === username);
  if (!user) return false;

  // Convert hash from Buffer to string
  user.hash = user.hash.toString()
  return user;
}

async function deleteUser(user) {
  return postgresqlRepo.deleteUser(user);
}
