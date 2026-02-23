import asyncio
from database import fetch_all

async def main():
    tables = await fetch_all("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name ILIKE '%agg_dim%';")
    for t in tables:
        tname = t['table_name']
        print(f"--- Schema for {tname} ---")
        cols = await fetch_all("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1", tname)
        for c in cols:
            print(f"  {c['column_name']}: {c['data_type']}")

if __name__ == "__main__":
    asyncio.run(main())
