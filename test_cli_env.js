const { spawn } = require('child_process');

const token = 'sbp_oauth_0fb68fafc8f4485891f5f5b91ee0f3a8a206f5cd';

const child = spawn('npx', ['supabase', 'projects', 'list'], {
  env: {
    ...process.env,
    SUPABASE_ACCESS_TOKEN: token
  },
  shell: true
});

let stdout = '';
let stderr = '';

child.stdout.on('data', (data) => {
  stdout += data;
});

child.stderr.on('data', (data) => {
  stderr += data;
});

child.on('close', (code) => {
  console.log(`Exit code: ${code}`);
  console.log('STDOUT:');
  console.log(stdout);
  console.log('STDERR:');
  console.log(stderr);
});
