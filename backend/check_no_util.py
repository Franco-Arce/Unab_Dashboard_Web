import asyncio
from database import fetch_all

async def main():
    rows = await fetch_all('SELECT ds.descripcion_sub, COUNT(*) as cnt FROM fact_contactos_subcategorias fcs JOIN dim_subcategorias ds ON fcs.subcategoria::int = ds.subcategoria WHERE ds.estado ILIKE ''%no útil%'' GROUP BY ds.descripcion_sub ORDER BY cnt DESC LIMIT 5')
    for r in rows:
        print(dict(r))

if __name__ == '__main__':
    asyncio.run(main())
