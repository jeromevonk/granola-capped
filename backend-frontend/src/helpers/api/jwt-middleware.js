const { expressjwt: jwt } = require("express-jwt");

export { jwtMiddleware };

function jwtMiddleware(req, res) {
  // Initialize the JWT middleware
  const middleware = jwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['HS256'],
  }).unless({
    path: [
      // public routes that don't require authentication
      '/api/users/register',
      '/api/users/authenticate',
      '/api/status',
    ],
  });

  // Return a Promise directly
  return new Promise((resolve, reject) => {
    middleware(req, res, (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}
