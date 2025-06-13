// supabase.js
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "https://matclwrgpccuphcymbzu.supabase.co"; // substitua pela sua URL
const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hdGNsd3JncGNjdXBoY3ltYnp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3ODE5NTMsImV4cCI6MjA2NTM1Nzk1M30.W_iGC9_PRy0bkchLKOQKKlo4I0d5ZeR-SIHD04TFvzo"; // substitua pela sua chave anon
export const supabase = createClient(supabaseUrl, supabaseKey);
