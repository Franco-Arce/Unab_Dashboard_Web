import asyncio
from database import fetch_all

async def main():
    try:
        rows = await fetch_all("SELECT * FROM agg_no_utiles LIMIT 1")
        if rows:
            print(list(rows[0].keys()))
        else:
            print("No rows found")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
