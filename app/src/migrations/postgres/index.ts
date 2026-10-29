import * as migration_20261029_140408_initial from './20261029_140408_initial';

export const migrations = [
  {
    up: migration_20261029_140408_initial.up,
    down: migration_20261029_140408_initial.down,
    name: '20261029_140408_initial'
  },
];
