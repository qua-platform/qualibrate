async function globalTeardown() {
  console.log('Stopping QUAlibrate server...');
  const server = (global as any).__SERVER__;
  if (server) {
    server.kill('SIGTERM');
  }
}

export default globalTeardown;

