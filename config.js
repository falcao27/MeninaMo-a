const SUPABASE_URL = 'https://ixouszvipgklgdvmsyyw.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4b3VzenZpcGdrbGdkdm1zeXl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE4NTc5ODgsImV4cCI6MjA0NzQzMzk4OH0.FxsdlpIFDHk9NDHp8mKn06_M54WasfIuTWLgA1L_ip8'

// Inicializar o cliente Supabase globalmente
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY); 