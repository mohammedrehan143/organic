const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Parse .env manually
const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    env[match[1].trim()] = val;
  }
});

const supabaseUrl = env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('No Supabase config found.');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanAgents() {
  const { data, error } = await supabase.from('delivery_agents').select('*');
  if (error) {
    console.error('Error fetching agents:', error);
    return;
  }
  
  if (data && data.length > 1) {
    const keepId = data[0].id;
    const deleteIds = data.slice(1).map(a => a.id);
    
    console.log('Keeping agent:', keepId);
    console.log('Deleting agents:', deleteIds);
    
    const { error: deleteError } = await supabase
      .from('delivery_agents')
      .delete()
      .in('id', deleteIds);
      
    if (deleteError) {
      console.error('Error deleting agents:', deleteError);
    } else {
      console.log('Successfully deleted extra agents from Supabase.');
    }
  } else {
    console.log('Database already has 1 or 0 agents. No action needed. Count: ' + (data ? data.length : 0));
  }
}

cleanAgents();
