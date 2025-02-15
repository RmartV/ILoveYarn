import { createClient } from '@supabase/supabase-js'

export const supabase = createClient('https://iycapcrfimbrwdixnfmt.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5Y2FwY3JmaW1icndkaXhuZm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2MTk1MzksImV4cCI6MjA1NTE5NTUzOX0.Q83ftUckbZ6Ox6bikQ-SHDZ8sXwxuzuvEFodmMjGOGg')