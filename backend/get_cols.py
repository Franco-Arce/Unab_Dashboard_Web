import asyncio
from database import fetch_all

async def main():
    q = "SELECT column_name, data_type, table_name, table_schema FROM information_schema.columns WHERE table_name ILIKE '%agg_dim%'"
    cols = await fetch_all(q)
    for c in cols:
        print(c)
    
    # Also grab one row just in case
    print("\n--- SAMPLE ROW ---")
    try:
        row = await fetch_all("SELECT * FROM agg_dim_contactos_leads LIMIT 1")
        if row:
            print(row[0])
    except Exception as e:
        print(e)
        
if __name__ == "__main__":
    asyncio.run(main())
