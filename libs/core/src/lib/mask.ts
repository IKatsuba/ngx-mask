export interface MaskToken {
  pattern?: string | MaskPatterns,
  default?: string;
  optional?: boolean;
  recursive?: boolean;
  escape?: boolean;

  transform?(c: string): string;
}

export interface MaskTokens {
  [key: string]: MaskToken
}

export interface MaskProcessResult {
  result: string;
  valid: boolean
}

export interface StringMaskOptions {
  reverse: boolean;
  useDefaults: boolean;
  tokens: MaskTokens;
}

export enum MaskPatterns {
  number = '\\d'
}

function insertChar(text: string, char: string, position: number) {
  const t = text.split('');
  t.splice(position, 0, char);
  return t.join('');
}


function calcOptionalNumbersToUse(pattern: string, value: string, tokens: MaskTokens) {
  const numberToken = Object.keys(tokens).find(token => tokens[token].pattern === MaskPatterns.number);
  if (!numberToken) {
    return 0;
  }

  const numbersInPattern = pattern.replace(new RegExp(`[^${numberToken}]`, 'g'), '').length;
  const numbersInValue = value.replace(/[^\d]/g, '').length;
  return numbersInValue - numbersInPattern;
}

function isEscaped(pattern: string, pos: number, tokens: MaskTokens) {
  let count = 0;
  let i = pos - 1;
  let token: MaskToken = { escape: true };
  while (i >= 0 && token?.escape) {
    token = tokens[pattern.charAt(i)];
    count += token && token.escape ? 1 : 0;
    i--;
  }
  return count > 0 && count % 2 === 1;
}


function concatChar(text: string, character: string, options: { reverse: boolean }, token: MaskToken) {
  if (token && typeof token.transform === 'function') {
    character = token.transform(character);
  }
  if (options.reverse) {
    return character + text;
  }
  return text + character;
}

function hasMoreTokens(pattern: string, pos: number, inc: number, tokens: MaskTokens) {
  const pc = pattern.charAt(pos);
  const token = tokens[pc];
  if (pc === '') {
    return false;
  }
  return token && !token.escape ? true : hasMoreTokens(pattern, pos + inc, inc, tokens);
}

function hasMoreRecursiveTokens(pattern: string, pos: number, inc: number, tokens: MaskTokens) {
  const pc = pattern.charAt(pos);
  const token = tokens[pc];
  if (pc === '') {
    return false;
  }
  return token && token.recursive
    ? true
    : hasMoreRecursiveTokens(pattern, pos + inc, inc, tokens);
}


export class Mask {
  private readonly options: StringMaskOptions;

  constructor(private pattern: string, options?: Partial<StringMaskOptions> & { tokens: MaskTokens }) {

    this.options = {
      reverse: options?.reverse ?? false,
      useDefaults: options?.useDefaults ?? options?.reverse,
      tokens: options.tokens
    };
  }

  static process(value: string, pattern: string, options: StringMaskOptions): MaskProcessResult {
    return new Mask(pattern, options).process(value);
  };

  static applyMask(value, pattern, options: StringMaskOptions): string {
    return new Mask(pattern, options).apply(value);
  };

  static validate(value, pattern, options: StringMaskOptions): boolean {
    return new Mask(pattern, options).validate(value);
  };

  process(value: string): MaskProcessResult {
    if (!value) {
      return { result: '', valid: false };
    }
    const { tokens } = this.options;

    let pattern2 = this.pattern;
    let valid = true;
    let formatted = '';
    let valuePos = this.options.reverse ? value.length - 1 : 0;
    let patternPos = 0;
    let optionalNumbersToUse = calcOptionalNumbersToUse(pattern2, value, tokens);
    let escapeNext = false;
    const recursive = [];
    let inRecursiveMode = false;

    const steps = {
      start: this.options.reverse ? pattern2.length - 1 : 0,
      end: this.options.reverse ? -1 : pattern2.length,
      inc: this.options.reverse ? -1 : 1
    };


    function continueCondition(options) {
      if (
        !inRecursiveMode &&
        !recursive.length &&
        hasMoreTokens(pattern2, patternPos, steps.inc, tokens)
      ) {
        // continue in the normal iteration
        return true;
      } else if (
        !inRecursiveMode &&
        recursive.length &&
        hasMoreRecursiveTokens(pattern2, patternPos, steps.inc, tokens)
      ) {
        // continue looking for the recursive tokens
        // Note: all chars in the patterns after the recursive portion will be handled as static string
        return true;
      } else if (!inRecursiveMode) {
        // start to handle the recursive portion of the pattern
        inRecursiveMode = recursive.length > 0;
      }

      if (inRecursiveMode) {
        const pc = recursive.shift();
        recursive.push(pc);
        if (options.reverse && valuePos >= 0) {
          patternPos++;
          pattern2 = insertChar(pattern2, pc, patternPos);
          return true;
        } else if (!options.reverse && valuePos < value.length) {
          pattern2 = insertChar(pattern2, pc, patternPos);
          return true;
        }
      }

      return patternPos < pattern2.length && patternPos >= 0;
    }

    /**
     * Iterate over the pattern's chars parsing/matching the input value chars
     * until the end of the pattern. If the pattern ends with recursive chars
     * the iteration will continue until the end of the input value.
     *
     * Note: The iteration must stop if an invalid char is found.
     */
    for (
      patternPos = steps.start;
      continueCondition(this.options);
    ) {
      // Value char
      const vc = value.charAt(valuePos);
      // Pattern char to match with the value char
      const pc = pattern2.charAt(patternPos);

      let token = tokens[pc];
      if (recursive.length && token && !token.recursive) {
        // In the recursive portion of the pattern: tokens not recursive must be seen as static chars
        token = null;
      }

      // 1. Handle escape tokens in pattern
      // go to next iteration: if the pattern char is a escape char or was escaped
      if (!inRecursiveMode || vc) {
        if (this.options.reverse && isEscaped(pattern2, patternPos, this.options.tokens)) {
          // pattern char is escaped, just add it and move on
          formatted = concatChar(formatted, pc, this.options, token);
          // skip escape token
          patternPos = patternPos + steps.inc;
          patternPos = patternPos + steps.inc;
          continue;
        } else if (!this.options.reverse && escapeNext) {
          // pattern char is escaped, just add it and move on
          formatted = concatChar(formatted, pc, this.options, token);
          escapeNext = false;
          patternPos = patternPos + steps.inc;
          continue;
        } else if (!this.options.reverse && token && token.escape) {
          // mark to escape the next pattern char
          escapeNext = true;
          patternPos = patternPos + steps.inc;
          continue;
        }
      }

      // 2. Handle recursive tokens in pattern
      // go to next iteration: if the value str is finished or
      //                       if there is a normal token in the recursive portion of the pattern
      if (!inRecursiveMode && token && token.recursive) {
        // save it to repeat in the end of the pattern and handle the value char now
        recursive.push(pc);
      } else if (inRecursiveMode && !vc) {
        // in recursive mode but value is finished. Add the pattern char if it is not a recursive token
        formatted = concatChar(formatted, pc, this.options, token);
        patternPos = patternPos + steps.inc;
        continue;
      } else if (!inRecursiveMode && recursive.length > 0 && !vc) {
        // recursiveMode not started but already in the recursive portion of the pattern
        patternPos = patternPos + steps.inc;
        continue;
      }

      // 3. Handle the value
      // break iterations: if value is invalid for the given pattern
      if (!token) {
        // add char of the pattern

        formatted = concatChar(formatted, pc, this.options, token);
        if (pc === vc) {
          valuePos += steps.inc;
        }

        if (!inRecursiveMode && recursive.length) {
          // save it to repeat in the end of the pattern
          recursive.push(pc);
        }
      } else if (token.optional) {
        // if token is optional, only add the value char if it matchs the token pattern
        //                       if not, move on to the next pattern char
        if (new RegExp(token.pattern).test(vc) && optionalNumbersToUse) {
          formatted = concatChar(formatted, vc, this.options, token);
          valuePos += steps.inc;
          optionalNumbersToUse--;
        } else if (recursive.length > 0 && vc) {
          valid = false;
          break;
        }
      } else if (new RegExp(token.pattern).test(vc)) {
        // if token isn't optional the value char must match the token pattern
        formatted = concatChar(formatted, vc, this.options, token);
        valuePos += steps.inc;
      } else if (!vc && token.default && this.options.useDefaults) {
        // if the token isn't optional and has a default value, use it if the value is finished
        formatted = concatChar(formatted, token.default, this.options, token);
      } else if (vc) {
        // the string value don't match the given pattern
        valuePos += steps.inc;
        continue;
      } else {
        // the string value don't match the given pattern
        valid = false;
        break;
      }

      patternPos = patternPos + steps.inc;
    }

    return { result: formatted, valid: valid };
  }


  public apply(value): string {
    return this.process(value).result;
  }

  public validate(value): boolean {
    return this.process(value).valid;
  }


}

