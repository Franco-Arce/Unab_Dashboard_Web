import asyncio
from database import fetch_all

async def main():
    rows = await fetch_all("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'no_utiles'")
    for r in rows:
        print(dict(r))
    
    print("--- SAMPLE ROW ---")
    sr = await fetch_all("SELECT * FROM no_utiles LIMIT 1")
    if sr: print(dict(sr[0]))

if __name__ == '__main__':
    asyncio.run(main())
