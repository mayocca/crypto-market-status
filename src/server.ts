import morgan from 'morgan';
import express, { NextFunction, Request, Response } from 'express';
import logger from 'jet-logger';

import BaseRouter from '@src/routes/api';
import Paths from '@src/routes/constants/Paths';

import EnvVars from '@src/constants/EnvVars';

import { NodeEnvs } from '@src/constants/misc';

// **** Variables **** //

const app = express();

// **** Setup **** //

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

if (EnvVars.NodeEnv === NodeEnvs.Development) {
  app.use(morgan('dev'));
}

app.use(Paths.Base, BaseRouter);

// error handler
app.use((err: Error, _: Request, res: Response, next: NextFunction) => {
  if (EnvVars.NodeEnv !== NodeEnvs.Test) {
    logger.err(err, true);
  }

  return res.status(422).json({ error: err.message });
});

// **** Export default **** //

export default app;
