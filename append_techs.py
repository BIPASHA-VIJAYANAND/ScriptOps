import csv

new_rows = [
    {"Name": "Ravi Basrur", "Role": "Music Director", "Industry": "Tollywood", "Years_of_Experience": 10, "Notable_Projects": "K.G.F: Chapter 1, Salaar", "Genres": "Action, Thriller", "Style_Tags": "Heavy brass, Bass-drop, Mass-elevation", "Recent_Project_Count": 4, "Avg_Project_Rating": 8.1, "Awards_Count": 6, "Collaboration_Level": "High", "Demand_Score": 9.3, "Demand_Tier": "Premium", "Region": "India"},
    {"Name": "Hildur Gudnadottir", "Role": "Music Director", "Industry": "Hollywood", "Years_of_Experience": 15, "Notable_Projects": "Joker, Chernobyl", "Genres": "Drama, Thriller", "Style_Tags": "Cello-heavy, Haunting ambient", "Recent_Project_Count": 3, "Avg_Project_Rating": 8.6, "Awards_Count": 11, "Collaboration_Level": "Medium", "Demand_Score": 9.1, "Demand_Tier": "Premium", "Region": "Global"},
    {"Name": "Gopi Sundar", "Role": "Music Director", "Industry": "Mollywood", "Years_of_Experience": 20, "Notable_Projects": "Charlie, Bangalore Days", "Genres": "Romance, Drama", "Style_Tags": "Feel-good melodies, Youthful", "Recent_Project_Count": 6, "Avg_Project_Rating": 7.6, "Awards_Count": 4, "Collaboration_Level": "High", "Demand_Score": 7.8, "Demand_Tier": "High", "Region": "India"}
]

csv_file = "technicians_dataset.csv"
fieldnames = ["Name", "Role", "Industry", "Years_of_Experience", "Notable_Projects", "Genres", "Style_Tags", "Recent_Project_Count", "Avg_Project_Rating", "Awards_Count", "Collaboration_Level", "Demand_Score", "Demand_Tier", "Region"]

with open(csv_file, mode="a", newline="", encoding="utf-8") as file:
    writer = csv.DictWriter(file, fieldnames=fieldnames)
    for row in new_rows:
        writer.writerow(row)

print("Appended rows.")
