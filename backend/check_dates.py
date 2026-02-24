import asyncio
from database import fetch_all

async def main():
    rows = await fetch_all("SELECT DISTINCT fecha FROM agg_dim_contactos_leads ORDER BY fecha DESC LIMIT 5")
    for r in rows:
        print(dict(r))
        
    print("---")
    rows2 = await fetch_all("SELECT DISTINCT fecha_pos FROM agg_dim_contactos_leads ORDER BY fecha_pos DESC LIMIT 5")
    for r in rows2:
        print(dict(r))

if __name__ == "__main__":
    asyncio.run(main())
