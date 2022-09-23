import { postgresqlRepo } from 'src/helpers/api';

export const usersRepo = {
  findUser,
  deleteUser,
};

async function findUser(username) {
  // Retrieve from DB
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