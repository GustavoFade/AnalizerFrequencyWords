module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      from: {},
      to: { circular: true }
    },
    {
      name: 'domain-cannot-import-outer-layers',
      severity: 'error',
      from: { path: '^src/domain' },
      to: { path: '^src/(application|infrastructure|presentation)' }
    },
    {
      name: 'application-cannot-import-adapters',
      severity: 'error',
      from: { path: '^src/application' },
      to: { path: '^src/(infrastructure|presentation)' }
    },
    {
      name: 'infrastructure-cannot-import-presentation',
      severity: 'error',
      from: { path: '^src/infrastructure' },
      to: { path: '^src/presentation' }
    }
  ],
  options: {
    tsConfig: { fileName: 'tsconfig.json' },
    doNotFollow: { path: 'node_modules' },
    exclude: ['node_modules', 'dist']
  }
};
