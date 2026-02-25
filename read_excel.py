import pandas as pd
import json

file_path = r"C:\Users\franc\OneDrive\Escritorio\Mis Cosas\Proyectos\Nods\UnabDashboardWeb\ArchivosUtiles\mapeo_mapas.xlsx"
df = pd.read_excel(file_path)
print(df.to_json(orient='records', indent=2))
