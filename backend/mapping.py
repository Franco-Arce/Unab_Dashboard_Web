import pandas as pd
import os
import json

# Absolute path to the mapping file
EXCEL_PATH = r"C:\Users\franc\OneDrive\Escritorio\Mis Cosas\Proyectos\Nods\UnabDashboardWeb\ArchivosUtiles\mapeo_mapas.xlsx"

class ProgramMapping:
    def __init__(self):
        self.mapping = {}
        self.load_mapping()

    def load_mapping(self):
        try:
            if not os.path.exists(EXCEL_PATH):
                print(f"[Mapping] Warning: Excel file not found at {EXCEL_PATH}")
                return

            df = pd.read_excel(EXCEL_PATH)
            # The structure detected in previous step:
            # Column 1: "ADMINISTRACIÓN DE EMPRESAS" (Original Program) -> No, this was data.
            # Let's look at the mapping logic based on the output of the script:
            # {
            #   "ADMINISTRACIÓN DE EMPRESAS": "CONTADURÍA PUBLICA", (This seems to be a label?)
            #   "ECONOMÍA Y NEGOCIOS": "ECONOMÍA Y NEGOCIOS",
            #   "GRADO": "GRADO" (This is clearly the level)
            # }
            # Wait, looking at the JSON output again:
            # The column NAMED "ADMINISTRACIÓN DE EMPRESAS" (which is likely the header of col A)
            # contains actual program names (CONTADURÍA PUBLICA, etc.).
            # The column NAMED "GRADO" (header of col C) contains "GRADO" or "POSGRADO".
            
            # Since the header names are actually values from row 0 in many excels, let's read without headers and map.
            df = pd.read_excel(EXCEL_PATH, header=None)
            
            # Let's assume:
            # Col 1 (index 1): Program Name
            # Col 2 (index 2): Faculty/Area
            # Col 3 (index 3? or it was index 2 in the JSON): Level
            
            # From the JSON output:
            # "ADMINISTRACIÓN DE EMPRESAS":"CONTADURÍA PUBLICA" -> Key is Header A, Value is Program
            # "ECONOMÍA Y NEGOCIOS":"ECONOMÍA Y NEGOCIOS" -> Key is Header B, Value is Area
            # "GRADO":"GRADO" -> Key is Header C, Value is Level
            
            # Re-reading with proper headers if possible, or just mapping the columns.
            # Usually, the first row IS the header if not specified. 
            # In the previous run, it treated the first row as headers.
            
            headers = df.columns.tolist() # ["ADMINISTRACIÓN DE EMPRESAS", "ECONOMÍA Y NEGOCIOS", "GRADO"]
            
            # Map everything to uppercase for safety
            self.mapping = {}
            for _, row in df.iterrows():
                prog = str(row[0]).strip().upper()
                level = str(row[headers[2]]).strip().upper()
                self.mapping[prog] = level
                
            # Also add the headers themselves as they were treated as keys in the JSON
            self.mapping[str(headers[0]).strip().upper()] = str(headers[2]).strip().upper()

            print(f"[Mapping] Loaded {len(self.mapping)} program mappings.")
        except Exception as e:
            print(f"[Mapping] Error loading Excel: {e}")

    def get_level(self, program_name: str) -> str:
        if not program_name:
            return "OTROS"
        
        clean_name = str(program_name).strip().upper()
        return self.mapping.get(clean_name, "OTROS")

# Singleton instance
mapping = ProgramMapping()
