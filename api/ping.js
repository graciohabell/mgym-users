export default async function handler(req, res) {
    try {
      const r = await fetch("https://<YOUR_PROJECT>.supabase.co/rest/v1/APIAPIAPI?limit=1", {
        headers: {
          apikey: process.env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
      });
  
      
      res.status(200).json({ ok: true, status: r.status });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
  