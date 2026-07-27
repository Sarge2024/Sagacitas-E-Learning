import { createClient } from '@supabase/supabase-js';

const finalUrl = 'http://127.0.0.1:54321';
const finalKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(finalUrl, finalKey, {
  global: {
    fetch: (url, options) => {
      const headers = new Headers(options?.headers);
      headers.set('x-user-role', 'Admin Master');
      headers.set('x-tenant-id', '00000000-0000-0000-0000-000000000001');
      return fetch(url, { ...options, headers });
    }
  }
});

async function run() {
  const { data, error } = await supabase
    .from('courses')
    .update({ description: 'Testing update' })
    .eq('id', '47d76d88-5b10-4a4c-98dd-05c2502d09cd')
    .select('*')
    .single();

  console.log('Update Result:', data, error);
}

run();
