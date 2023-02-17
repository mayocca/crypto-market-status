import { Router } from 'express';
import jetValidator from 'jet-validator';

// **** Variables **** //
const apiRouter = Router(),
  validator = jetValidator();

// **** Setup **** //
apiRouter.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API!' });
});

// **** Export default **** //
export default apiRouter;
