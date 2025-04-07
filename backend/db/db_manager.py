import pandas as pd
import sqlite3
from datetime import datetime
import os
import git

def process_excel_files(file1_path, file2_path):
    # Leer archivos Excel
    df1 = pd.read_excel(file1_path)
    df2 = pd.read_excel(file2_path)
    
    # Combinar datos
    combined_df = pd.concat([df1, df2]).reset_index(drop=True)
    
    # Conectar a la base de datos
    conn = sqlite3.connect('sales_data.db')
    
    # Guardar en la base de datos
    combined_df.to_sql('sales', conn, if_exists='replace', index=False)
    
    conn.close()
    return combined_df

def push_to_github():
    repo = git.Repo('.')
    repo.git.add('.')
    repo.git.commit('-m', f'Actualización automática {datetime.now()}')
    repo.git.push('origin', 'main')

if __name__ == "__main__":
    # Ejemplo de uso
    process_excel_files('ventas2022.xlsx', 'ventas2023.xlsx')
    push_to_github()
