export default async function handler(req, res) {
    try {
      const r = await fetch("https://iilbqhjwoyakuvckkqfx.supabase.co/rest/v1/APIAPIAPI?id=eq.1", {
        method: "PATCH",
        headers: {
          apikey: process.env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation", 
        },
        body: JSON.stringify({
          dummy: Date.now(), 
        }),
      });
  
      const data = await r.json();
  
      res.status(200).json({ ok: true, status: r.status, data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
  