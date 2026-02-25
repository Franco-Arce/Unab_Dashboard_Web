import asyncio
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
from cache import cache

async def main():
    await cache.refresh()
    data = await cache.get_all()
    print("total_leads:", data.get('total_leads'))
    print("op_venta:", data.get('op_venta'))
    print("first program op_venta:", data.get('merged_programs')[0].get('op_venta') if data.get('merged_programs') else None)

asyncio.run(main())
