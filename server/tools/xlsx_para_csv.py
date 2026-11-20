"""Converte a aba "Estoque" da planilha-modelo (Modelo-Estoque.xlsx) em CSV UTF-8 com ';'.
Uso: python xlsx_para_csv.py Estoque-do-cliente.xlsx estoque.csv"""
import csv
import sys

from openpyxl import load_workbook

if len(sys.argv) != 3:
    sys.exit("Uso: python xlsx_para_csv.py entrada.xlsx saida.csv")
ws = load_workbook(sys.argv[1], data_only=True)["Estoque"]
with open(sys.argv[2], "w", newline="", encoding="utf-8-sig") as out:
    writer = csv.writer(out, delimiter=";")
    for row in ws.iter_rows(values_only=True):
        if any(cell not in (None, "") for cell in row):
            writer.writerow(["" if cell is None else cell for cell in row])
print("ok", sys.argv[2])
