import asyncio
import sys
import os

os.chdir("backend")
sys.path.append(os.path.abspath("."))
from cache import cache

async def main():
    await cache.refresh()
    data = await cache.get_all()
    print("total_leads:", data.get('total_leads'))
    print("op_venta GLOBAL:", data.get('op_venta'))
    print("merged_programs:", len(data.get('merged_programs')))
    if data.get('merged_programs'):
        prog0 = data.get('merged_programs')[0]
        print(f"First program ({prog0['programa']}) op_venta:", prog0.get('op_venta'))
        sum_op_venta = sum(p.get('op_venta', 0) for p in data.get('merged_programs', []))
        print("SUM of op_venta from programs:", sum_op_venta)

asyncio.run(main())
