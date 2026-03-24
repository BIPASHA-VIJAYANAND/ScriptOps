import csv

input_file = "technicians_dataset.csv"
output_file = "technicians_dataset_v2.csv"

rows = []
with open(input_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames + ["Estimated_Day_Rate_USD"]
    for row in reader:
        tier = row.get("Demand_Tier", "Medium")
        industry = row.get("Industry", "Hollywood")
        role = row.get("Role", "Cinematographer")
        
        # Base rates per day
        base = 1000
        if role == "Music Director":
            base = 2500
        elif role == "Cinematographer":
            base = 1500
        elif role == "Editor":
            base = 1200
            
        # Tier multiplier
        if tier == "Premium":
            base *= 4
        elif tier == "High":
            base *= 2.5
        elif tier == "Low":
            base *= 0.6
            
        # Regional PPP multiplier
        if industry in ["Bollywood", "Tollywood", "Kollywood", "Mollywood"]:
            base *= 0.45
            
        # Add minor variance for realism based on name length
        variance = (len(row.get("Name", "")) % 5) * 150
        final_rate = int(round(base + variance, -2)) # Round to nearest 100
        
        row["Estimated_Day_Rate_USD"] = final_rate
        rows.append(row)

with open(output_file, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

print(f"Successfully created {output_file} with budget column.", flush=True)
