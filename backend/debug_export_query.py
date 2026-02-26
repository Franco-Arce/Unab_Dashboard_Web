import asyncio
from database import fetch_all
import pandas as pd

async def test_export():
    where_clauses = ["1=1"]
    args = []
    
    # Simulate no_util=True
    where_clauses.append("(descrip_cat ILIKE '%no util%' OR descrip_cat ILIKE '%descarte%')")
    
    where_sql = " AND ".join(where_clauses)
    
    data_query = f"""
        SELECT 
            idinterno AS "ID INTERNO", 
            txtnombreapellido AS "NOMBRE Y APELLIDO", 
            emlmail AS "EMAIL", 
            teltelefono AS "TELEFONO", 
            txtprogramainteres AS "PROGRAMA INTERES", 
            base AS "BASE DE DATOS",
            ultima_mejor_subcat_string AS "ESTADO GESTION",
            descrip_subcat AS "DETALLE ESTADO",
            fecha_a_utilizar AS "FECHA ACTIVIDAD"
        FROM dim_contactos
        WHERE {where_sql}
        ORDER BY fecha_a_utilizar DESC NULLS LAST
    """
    
    print(f"Executing Query: {data_query}")
    rows = await fetch_all(data_query, *args)
    print(f"Found {len(rows)} rows")
    if rows:
        print("First row:", dict(rows[0]))

if __name__ == "__main__":
    asyncio.run(test_export())
