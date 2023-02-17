import './pre-start';
import logger from 'jet-logger';

import EnvVars from './constants/EnvVars';
import server from './server';

// **** Run **** //

const SERVER_START_MESSAGE =
  'Server started on port: ' + EnvVars.Port.toString();

server.listen(EnvVars.Port, () => {
  logger.info(SERVER_START_MESSAGE);
});
