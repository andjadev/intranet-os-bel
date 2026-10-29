import * as migration_20261028_150130_initial from './20261028_150130_initial';

export const migrations = [
  {
    up: migration_20261028_150130_initial.up,
    down: migration_20261028_150130_initial.down,
    name: '20261028_150130_initial'
  },
];
