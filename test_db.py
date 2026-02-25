import asyncio
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
from database import fetch_all

async def main():
    rows = await fetch_all('SELECT SUM(leads_op_venta) as t FROM agg_dim_contactos_leads')
    if rows:
        print(f"Total leads_op_venta: {rows[0]['t']}")
    else:
        print('No rows')

asyncio.run(main())
