import asyncio
from database import fetch_all

async def main():
    print("Columns in agg_no_utiles:")
    try:
        cols = await fetch_all("SELECT column_name FROM information_schema.columns WHERE table_name = 'agg_no_utiles'")
        for c in cols:
            print("  ", c['column_name'])
        rows = await fetch_all("SELECT * FROM agg_no_utiles LIMIT 3")
        print("Data:\n", rows)
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    asyncio.run(main())
