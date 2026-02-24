import asyncio
from database import fetch_all

async def main():
    print("Checking dim_contactos for 7d and 14d:")
    try:
        rows = await fetch_all("""
            SELECT 
                descrip_subcat,
                COUNT(*) AS cnt,
                SUM(CASE WHEN fecha_a_utilizar >= NOW() - INTERVAL '7 days' THEN 1 ELSE 0 END) AS leads_7d,
                SUM(CASE WHEN fecha_a_utilizar >= NOW() - INTERVAL '14 days' THEN 1 ELSE 0 END) AS leads_14d
            FROM dim_contactos
            WHERE descrip_estado_crm ILIKE '%no util%'
               OR descrip_estado_crm ILIKE '%descarte%'
            GROUP BY descrip_subcat
            ORDER BY cnt DESC
            LIMIT 5
        """)
        for r in rows:
            print(dict(r))
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    asyncio.run(main())
