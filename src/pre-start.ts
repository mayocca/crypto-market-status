import dotenv from 'dotenv';
import path from 'path';
import { parse } from 'ts-command-line-args';

// **** Types **** //

interface IArgs {
  env: string;
}

// **** Setup **** //

const args = parse<IArgs>({
  env: {
    type: String,
    defaultValue: 'development',
    alias: 'e',
  },
});

const result = dotenv.config({
  path: path.resolve(__dirname, `../env/${args.env}.env`),
});

if (result.error) {
  throw result.error;
}
