import { IArgs } from './yt-dlp.args.interface';

// based on https://github.com/sindresorhus/dargs/blob/main/index.js
export const objToCommandLineArgs = (object: Partial<IArgs>) => {
  const arguments_: string[] = [];
  let extraArguments: Array<unknown> = [];
  let separatedArguments: Array<unknown> = [];

  const makeArguments = (key: string, value: string | undefined) => {
    const prefix = key.length === 1 ? '-' : '--';
    const kebabCaseKey = key.replace(/[A-Z]/g, '-$&').toLowerCase();

    const prefixedKebabCaseKey = prefix + kebabCaseKey;

    arguments_.push(prefixedKebabCaseKey);

    if (value) {
      arguments_.push(value);
    }
  };

  for (const [key, value] of Object.entries(object)) {
    if (key === '--') {
      if (!Array.isArray(value)) {
        throw new TypeError(
          `Expected key \`--\` to be Array, got ${typeof value}`,
        );
      }

      separatedArguments = value;
      continue;
    }

    if (key === '_') {
      if (!Array.isArray(value)) {
        throw new TypeError(
          `Expected key \`_\` to be Array, got ${typeof value}`,
        );
      }

      extraArguments = value;
      continue;
    }

    if (value === true) {
      makeArguments(key, '');
    }

    if (value === false) {
      makeArguments(`no-${key}`, undefined);
    }

    if (typeof value === 'string') {
      makeArguments(key, value);
    }

    if (typeof value === 'number' && !Number.isNaN(value)) {
      makeArguments(key, String(value));
    }

    if (Array.isArray(value)) {
      for (const arrayValue of value) {
        makeArguments(key, arrayValue);
      }
    }
  }

  for (const argument of extraArguments) {
    arguments_.push(String(argument));
  }

  if (separatedArguments.length > 0) {
    arguments_.push('--');
  }

  for (const argument of separatedArguments) {
    arguments_.push(String(argument));
  }

  return arguments_;
};
