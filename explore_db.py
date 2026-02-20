import asyncio
import asyncpg

async def main():
    conn = await asyncpg.connect(
        host='77.37.68.210',
        database='unab',
        user='nicoyapur',
        password='Yapur2025###'
    )

    # Distinct txtutmmedium (medio)
    print("=== DISTINCT txtutmmedium ===")
    vals = await conn.fetch("SELECT DISTINCT txtutmmedium FROM dim_contactos WHERE txtutmmedium IS NOT NULL LIMIT 30")
    for v in vals:
        print(f"  {v['txtutmmedium']}")

    # Distinct ultima_mejor_subcat_string
    print("\n=== DISTINCT ultima_mejor_subcat_string ===")
    vals = await conn.fetch("SELECT DISTINCT ultima_mejor_subcat_string FROM dim_contactos WHERE ultima_mejor_subcat_string IS NOT NULL LIMIT 30")
    for v in vals:
        print(f"  {v['ultima_mejor_subcat_string']}")

    # Distinct base
    print("\n=== DISTINCT base ===")
    vals = await conn.fetch("SELECT DISTINCT base FROM dim_contactos WHERE base IS NOT NULL LIMIT 30")
    for v in vals:
        print(f"  {v['base']}")

    # Distinct descrip_cat
    print("\n=== DISTINCT descrip_cat ===")
    vals = await conn.fetch("SELECT DISTINCT descrip_cat FROM dim_contactos WHERE descrip_cat IS NOT NULL LIMIT 30")
    for v in vals:
        print(f"  {v['descrip_cat']}")

    # Distinct descrip_subcat (top 30)
    print("\n=== TOP descrip_subcat ===")
    vals = await conn.fetch("SELECT descrip_subcat, COUNT(*) as cnt FROM dim_contactos WHERE descrip_subcat IS NOT NULL GROUP BY descrip_subcat ORDER BY cnt DESC LIMIT 30")
    for v in vals:
        print(f"  {v['descrip_subcat']}: {v['cnt']}")

    # Top programas
    print("\n=== TOP txtprogramainteres ===")
    vals = await conn.fetch("SELECT txtprogramainteres, COUNT(*) as cnt FROM dim_contactos WHERE txtprogramainteres IS NOT NULL GROUP BY txtprogramainteres ORDER BY cnt DESC LIMIT 25")
    for v in vals:
        print(f"  {v['txtprogramainteres']}: {v['cnt']}")

    # dim_subcategorias all
    print("\n=== dim_subcategorias - DISTINCT estado ===")
    vals = await conn.fetch("SELECT DISTINCT estado FROM dim_subcategorias WHERE estado IS NOT NULL")
    for v in vals:
        print(f"  {v['estado']}")

    print("\n=== dim_subcategorias - DISTINCT gestion ===")
    vals = await conn.fetch("SELECT DISTINCT gestion FROM dim_subcategorias WHERE gestion IS NOT NULL")
    for v in vals:
        print(f"  {v['gestion']}")

    print("\n=== dim_subcategorias - DISTINCT proceso ===")
    vals = await conn.fetch("SELECT DISTINCT proceso FROM dim_subcategorias WHERE proceso IS NOT NULL")
    for v in vals:
        print(f"  {v['proceso']}")

    # fact_unab_sheet - 2026 programs
    print("\n=== fact_unab_sheet (2026) ===")
    vals = await conn.fetch("SELECT programa, solicitados, admitidos, pagados, metas FROM fact_unab_sheet WHERE anio='2026' ORDER BY programa")
    for v in vals:
        print(f"  {v['programa']}: sol={v['solicitados']} adm={v['admitidos']} pag={v['pagados']} meta={v['metas']}")

    # fact_unab_sheet_aa - 2025 programs
    print("\n=== fact_unab_sheet_aa (2025) ===")
    vals = await conn.fetch("SELECT programa, solicitados_aa, admitidos_aa, pagados_aa FROM fact_unab_sheet_aa WHERE anio='2025' ORDER BY programa LIMIT 15")
    for v in vals:
        print(f"  {v['programa']}: sol_aa={v['solicitados_aa']} adm_aa={v['admitidos_aa']} pag_aa={v['pagados_aa']}")

    # fact_unab_sheet_var
    print("\n=== fact_unab_sheet_var ===")
    vals = await conn.fetch("SELECT programa, solicitados_var, admitidos_var, pagados_var FROM fact_unab_sheet_var LIMIT 15")
    for v in vals:
        print(f"  {v['programa']}: sol_var={v['solicitados_var']} adm_var={v['admitidos_var']} pag_var={v['pagados_var']}")

    # fact_unab_sheet_admitidos - status breakdown
    print("\n=== fact_unab_sheet_admitidos - status counts ===")
    vals = await conn.fetch("""
        SELECT 
            SUM(CASE WHEN pendiente_firmas = '1' THEN 1 ELSE 0 END) as pendiente,
            SUM(CASE WHEN proceso_de_pago = '1' THEN 1 ELSE 0 END) as proceso_pago,
            SUM(CASE WHEN declinado = '1' THEN 1 ELSE 0 END) as declinado,
            SUM(CASE WHEN no_contesta = '1' THEN 1 ELSE 0 END) as no_contesta,
            SUM(CASE WHEN matricula = '1' THEN 1 ELSE 0 END) as matriculado,
            COUNT(*) as total
        FROM fact_unab_sheet_admitidos
    """)
    for v in vals:
        print(f"  pendiente={v['pendiente']} proceso_pago={v['proceso_pago']} declinado={v['declinado']} no_contesta={v['no_contesta']} matriculado={v['matriculado']} total={v['total']}")

    # fact_unab_sheet_admitidos - motivo distribution
    print("\n=== fact_unab_sheet_admitidos - TOP motivo ===")
    vals = await conn.fetch("SELECT motivo, COUNT(*) as cnt FROM fact_unab_sheet_admitidos WHERE motivo IS NOT NULL AND motivo != '' GROUP BY motivo ORDER BY cnt DESC LIMIT 15")
    for v in vals:
        print(f"  {v['motivo']}: {v['cnt']}")

    # fact_contactos_subcategorias columns + sample
    print("\n=== fact_contactos_subcategorias COLUMNS ===")
    cols = await conn.fetch("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='fact_contactos_subcategorias' ORDER BY ordinal_position")
    for c in cols:
        print(f"  {c['column_name']:40s} {c['data_type']}")

    print("\n=== fact_contactos_subcategorias SAMPLE ===")
    vals = await conn.fetch("SELECT * FROM fact_contactos_subcategorias LIMIT 3")
    for i, row in enumerate(vals):
        print(f"\n--- Row {i+1} ---")
        for key, val in dict(row).items():
            print(f"  {key}: {val}")

    # fact_contacto sample
    print("\n=== fact_contacto COLUMNS ===")
    cols = await conn.fetch("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='fact_contacto' ORDER BY ordinal_position")
    for c in cols:
        print(f"  {c['column_name']:40s} {c['data_type']}")

    print("\n=== fact_contacto SAMPLE ===")
    vals = await conn.fetch("SELECT * FROM fact_contacto LIMIT 3")
    for i, row in enumerate(vals):
        print(f"\n--- Row {i+1} ---")
        for key, val in dict(row).items():
            print(f"  {key}: {val}")

    # fact_unab_sheet2 (full)
    print("\n=== fact_unab_sheet2 (all 24 rows) ===")
    cols = await conn.fetch("SELECT column_name FROM information_schema.columns WHERE table_name='fact_unab_sheet2' ORDER BY ordinal_position")
    print(f"  Columns: {[c['column_name'] for c in cols]}")
    vals = await conn.fetch("SELECT * FROM fact_unab_sheet2 LIMIT 5")
    for i, row in enumerate(vals):
        print(f"\n--- Row {i+1} ---")
        for key, val in dict(row).items():
            print(f"  {key}: {val}")

    await conn.close()

asyncio.run(main())
