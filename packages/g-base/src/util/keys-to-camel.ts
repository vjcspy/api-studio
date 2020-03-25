import * as _ from 'lodash';

const toCamel = (s: string): string => {
  return s.replace(/([-_][a-z])/ig, ($1) => {
    return $1.toUpperCase()
      .replace('-', '')
      .replace('_', '');
  });
};

export function keysToCamel(o: any): any {
  if (_.isObject(o)) {
    const n: any = {};

    Object.keys(o)
      .forEach((k) => {
        // @ts-ignore
        n[toCamel(k)] = keysToCamel(o[k]);
      });

    return n;
  } else if (_.isArray(o)) {
    return _.map(o, (i: any) => {
      return keysToCamel(i);
    });
  }

  return o;
}
