module.exports = {
  transforms: [
    {
      mode: 'sql',
      include: '**/*.sql',
      emitTemplate: '{{dir}}/{{name}}.queries.ts',
    },
  ],
  srcDir: './',
  failOnError: false,
  camelCaseColumnNames: false,
  db: {
    host: 'aws-0-ap-southeast-1.pooler.supabase.com',
    user: 'postgres.rviwahseiudskolyjvdv',
    dbName: 'postgres',
    password: 'Akmal.14032002',
    port: 6543,
  },
};
