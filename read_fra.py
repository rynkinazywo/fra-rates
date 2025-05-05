import json

with open("fra_rates.json", "r", encoding="utf-8") as f:
    rates = json.load(f)

for period, value in rates.items():
    print(f"FRA {period}: {value}")
