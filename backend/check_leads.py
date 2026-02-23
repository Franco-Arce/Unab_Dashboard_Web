import asyncio
from database import fetch_one, fetch_all

async def main():
    print("Checking dim_contactos_neotel_unab...")
    try:
        row = await fetch_one("SELECT * FROM dim_contactos_neotel_unab LIMIT 1")
        if row:
            print("Found dim_contactos_neotel_unab data!")
            for k, v in row.items():
                print(f"  {k}: {v}")
    except Exception as e:
        print("Error:", e)

    print("\nChecking fact_contactos_unab...")
    try:
        row = await fetch_one("SELECT * FROM fact_contactos_unab LIMIT 1")
        if row:
            print("Found fact_contactos_unab data!")
            for k, v in row.items():
                print(f"  {k}: {v}")
    except Exception as e:
        print("Error:", e)
        
    print("\nChecking dim_contactos...")
    try:
        row = await fetch_one("SELECT * FROM dim_contactos LIMIT 1")
        if row:
            print("Found dim_contactos data!")
            for k, v in row.items():
                print(f"  {k}: {v}")
    except Exception as e:
        print("Error:", e)

if __name__ == '__main__':
    asyncio.run(main())
