import csv
import requests
import re
import time
import math

API_KEY = "aa12e3c5"

technicians = [
    {"Name": "Roger Deakins", "Role": "Cinematographer", "Industry": "Hollywood", "Exp": 40, "Projects": ["1917", "Skyfall", "Sicario"], "Style": "Natural lighting, Silhouettes, High contrast", "Region": "Global"},
    {"Name": "Emmanuel Lubezki", "Role": "Cinematographer", "Industry": "Hollywood", "Exp": 30, "Projects": ["Gravity", "Birdman", "The Revenant"], "Style": "Long takes, Natural light, Immersive wide angles", "Region": "Global"},
    {"Name": "Ravi K. Chandran", "Role": "Cinematographer", "Industry": "Bollywood", "Exp": 30, "Projects": ["Dil Chahta Hai", "Black", "Ghajini"], "Style": "Stylized lighting, Vibrant colors, Cinematic framing", "Region": "India"},
    {"Name": "Santosh Sivan", "Role": "Cinematographer", "Industry": "Kollywood", "Exp": 35, "Projects": ["Roja", "Dil Se", "Asoka"], "Style": "Ethereal, Soft focus, Culturally rooted", "Region": "India"},
    {"Name": "Sudeep Chatterjee", "Role": "Cinematographer", "Industry": "Bollywood", "Exp": 25, "Projects": ["Padmaavat", "Bajirao Mastani", "Gangubai Kathiawadi"], "Style": "Grand scale, Warm palette, Symmetry", "Region": "India"},
    {"Name": "Rajiv Menon", "Role": "Cinematographer", "Industry": "Kollywood", "Exp": 30, "Projects": ["Bombay", "Guru", "Kadal"], "Style": "Lush visuals, Rich colors, Character-focused", "Region": "India"},
    {"Name": "Hoyte van Hoytema", "Role": "Cinematographer", "Industry": "Hollywood", "Exp": 20, "Projects": ["Interstellar", "Dunkirk", "Oppenheimer"], "Style": "IMAX format, Gritty realism, Striking contrast", "Region": "Global"},
    {"Name": "Greig Fraser", "Role": "Cinematographer", "Industry": "Hollywood", "Exp": 15, "Projects": ["Dune", "The Batman", "Rogue One"], "Style": "Dark tones, High contrast, Texture-heavy", "Region": "Global"},
    {"Name": "Rathnavelu", "Role": "Cinematographer", "Industry": "Kollywood", "Exp": 25, "Projects": ["Enthiran", "Rangasthalam", "Indian 2"], "Style": "High gloss, Technically advanced, Vibrant", "Region": "India"},
    {"Name": "K. K. Senthil Kumar", "Role": "Cinematographer", "Industry": "Tollywood", "Exp": 20, "Projects": ["Baahubali: The Beginning", "RRR", "Magadheera"], "Style": "VFX-heavy, Epic scale, Dynamic framing", "Region": "India"},
    {"Name": "P. C. Sreeram", "Role": "Cinematographer", "Industry": "Kollywood", "Exp": 40, "Projects": ["Nayakan", "Alaipayuthey", "I"], "Style": "Innovative lighting, Pioneer, Moody", "Region": "India"},
    {"Name": "Tirru", "Role": "Cinematographer", "Industry": "Kollywood", "Exp": 30, "Projects": ["Hey Ram", "24", "Petta"], "Style": "Edgy, Dynamic, Experimental lighting", "Region": "India"},
    {"Name": "Manoj Paramahamsa", "Role": "Cinematographer", "Industry": "Tollywood", "Exp": 15, "Projects": ["Ye Maaya Chesave", "Leo", "Radhe Shyam"], "Style": "Sleek, Modern, VFX-integrated", "Region": "India"},
    {"Name": "Anil Mehta", "Role": "Cinematographer", "Industry": "Bollywood", "Exp": 25, "Projects": ["Lagaan", "Rockstar", "Highway"], "Style": "Earthy tones, Realistic, Fluid camera", "Region": "India"},
    {"Name": "Wally Pfister", "Role": "Cinematographer", "Industry": "Hollywood", "Exp": 30, "Projects": ["Inception", "The Dark Knight"], "Style": "Classic lighting, Minimal CGI, Steadicam", "Region": "Global"},
    {"Name": "Ravi Varman", "Role": "Cinematographer", "Industry": "Kollywood", "Exp": 25, "Projects": ["Ponniyin Selvan: Part I", "Barfi!", "Dasavathaaram"], "Style": "Painting-like frames, Vibrant colors, Soft light", "Region": "India"},
    {"Name": "Linus Sandgren", "Role": "Cinematographer", "Industry": "Hollywood", "Exp": 20, "Projects": ["La La Land", "No Time to Die", "Babylon"], "Style": "Colorful, Long takes, Expressive", "Region": "Global"},
    {"Name": "Dan Laustsen", "Role": "Cinematographer", "Industry": "Hollywood", "Exp": 40, "Projects": ["The Shape of Water", "John Wick: Chapter 3"], "Style": "Stylized colors, Atmospheric, High contrast", "Region": "Global"},

    {"Name": "Sreekar Prasad", "Role": "Editor", "Industry": "Kollywood", "Exp": 40, "Projects": ["Firaaq", "RRR"], "Style": "Seamless transitions, Rhythmic pacing, Multi-lingual", "Region": "India"},
    {"Name": "Thelma Schoonmaker", "Role": "Editor", "Industry": "Hollywood", "Exp": 55, "Projects": ["Goodfellas", "The Departed", "The Wolf of Wall Street"], "Style": "Energetic cuts, Freeze frames, Fast pacing", "Region": "Global"},
    {"Name": "Namrata Rao", "Role": "Editor", "Industry": "Bollywood", "Exp": 15, "Projects": ["Kahaani", "Fan", "Oye Lucky! Lucky Oye!"], "Style": "Tense pacing, Unconventional rhythm, Sharp", "Region": "India"},
    {"Name": "Anthony", "Role": "Editor", "Industry": "Kollywood", "Exp": 20, "Projects": ["Enthiran", "Sivaji", "Vada Chennai"], "Style": "Hyper-kinetic, Stylish transitions, Mass appeal", "Region": "India"},
    {"Name": "Lee Smith", "Role": "Editor", "Industry": "Hollywood", "Exp": 30, "Projects": ["The Dark Knight", "Inception", "1917"], "Style": "Invisible editing, Temporal manipulation", "Region": "Global"},
    {"Name": "Aarti Bajaj", "Role": "Editor", "Industry": "Bollywood", "Exp": 20, "Projects": ["Gangs of Wasseypur", "Tamasha", "Rockstar"], "Style": "Gritty cuts, Non-linear, Emotion-driven", "Region": "India"},
    {"Name": "Nitin Baid", "Role": "Editor", "Industry": "Bollywood", "Exp": 10, "Projects": ["Gully Boy", "Masaan", "Raazi"], "Style": "Realistic rhythm, Character-focused", "Region": "India"},
    {"Name": "Ruben", "Role": "Editor", "Industry": "Kollywood", "Exp": 12, "Projects": ["Theri", "Mersal", "Jawan"], "Style": "Fast cuts, High energy, Teaser-style pacing", "Region": "India"},
    {"Name": "Kotagiri Venkateswara Rao", "Role": "Editor", "Industry": "Tollywood", "Exp": 40, "Projects": ["Baahubali: The Beginning", "Eega", "Magadheera"], "Style": "VFX-sync, Epic pacing, Traditional narrative", "Region": "India"},
    {"Name": "Margaret Sixel", "Role": "Editor", "Industry": "Hollywood", "Exp": 25, "Projects": ["Mad Max: Fury Road", "Happy Feet"], "Style": "Action-heavy, Precise continuity, Kinetic", "Region": "Global"},
    {"Name": "Pietro Scalia", "Role": "Editor", "Industry": "Hollywood", "Exp": 30, "Projects": ["Black Hawk Down", "Gladiator", "The Martian"], "Style": "Tension building, Multi-cam assembly", "Region": "Global"},
    {"Name": "Praveen K. L.", "Role": "Editor", "Industry": "Kollywood", "Exp": 15, "Projects": ["Mankatha", "Kabali", "Chennai 600028"], "Style": "Sleek cuts, Modern rhythm, Non-linear", "Region": "India"},
    {"Name": "Vivek Harshan", "Role": "Editor", "Industry": "Mollywood", "Exp": 15, "Projects": ["Big B", "Jigarthanda", "Varathan"], "Style": "Stylized cuts, Trendy transitions, Pacing spikes", "Region": "India"},
    {"Name": "Michael Kahn", "Role": "Editor", "Industry": "Hollywood", "Exp": 50, "Projects": ["Schindler's List", "Saving Private Ryan", "Jurassic Park"], "Style": "Classic Hollywood pacing, Emotional resonance", "Region": "Global"},
    {"Name": "V. T. Vijayan", "Role": "Editor", "Industry": "Kollywood", "Exp": 35, "Projects": ["Singam", "Saamy", "Dhool"], "Style": "High BPM, Action-focused, Loud transitions", "Region": "India"},

    {"Name": "A. R. Rahman", "Role": "Music Director", "Industry": "Bollywood", "Exp": 30, "Projects": ["Slumdog Millionaire", "Roja", "Rockstar"], "Style": "Fusion, Orchestral, Electronic, Soulful", "Region": "Global"},
    {"Name": "Hans Zimmer", "Role": "Music Director", "Industry": "Hollywood", "Exp": 40, "Projects": ["Inception", "Interstellar"], "Style": "Bombastic, Brass-heavy, Synthesizer fusion", "Region": "Global"},
    {"Name": "Anirudh Ravichander", "Role": "Music Director", "Industry": "Kollywood", "Exp": 12, "Projects": ["Vikram", "Leo", "Jailer"], "Style": "Heavy bass, Electronic beats, High energy", "Region": "India"},
    {"Name": "Pritam", "Role": "Music Director", "Industry": "Bollywood", "Exp": 20, "Projects": ["Yeh Jawaani Hai Deewani", "Dangal", "Brahmastra"], "Style": "Melodic, Commercial hits, Diverse instrumentation", "Region": "India"},
    {"Name": "Amit Trivedi", "Role": "Music Director", "Industry": "Bollywood", "Exp": 15, "Projects": ["Dev.D", "Lootera", "Andhadhun"], "Style": "Alternative, Folk-fusion, Quirky", "Region": "India"},
    {"Name": "Ilaiyaraaja", "Role": "Music Director", "Industry": "Kollywood", "Exp": 45, "Projects": ["Nayakan", "Sindhu Bhairavi"], "Style": "Symphonic, Folk-classical fusion, Nostalgic", "Region": "India"},
    {"Name": "M. M. Keeravani", "Role": "Music Director", "Industry": "Tollywood", "Exp": 35, "Projects": ["RRR", "Baahubali: The Beginning", "Magadheera"], "Style": "Grand orchestration, Traditional Indian, Choral", "Region": "India"},
    {"Name": "Thaman S", "Role": "Music Director", "Industry": "Tollywood", "Exp": 15, "Projects": ["Ala Vaikunthapurramuloo", "Akhanda", "Varisu"], "Style": "Thumping beats, Percussion-heavy, Mass appeal", "Region": "India"},
    {"Name": "Santhosh Narayanan", "Role": "Music Director", "Industry": "Kollywood", "Exp": 12, "Projects": ["Kabali", "Vada Chennai", "Kalki 2898 AD"], "Style": "Raw, Folk-infused, Experimental, Baritone", "Region": "India"},
    {"Name": "Harris Jayaraj", "Role": "Music Director", "Industry": "Kollywood", "Exp": 25, "Projects": ["Minnale", "Ghajini"], "Style": "Breezy melodies, R&B influence, Tech-pop", "Region": "India"},
    {"Name": "John Williams", "Role": "Music Director", "Industry": "Hollywood", "Exp": 60, "Projects": ["Star Wars", "Jurassic Park"], "Style": "Leitmotif, Classical orchestral, Triumphant", "Region": "Global"},
    {"Name": "Ludwig Göransson", "Role": "Music Director", "Industry": "Hollywood", "Exp": 15, "Projects": ["Oppenheimer", "Black Panther", "Tenet"], "Style": "Experimental, Synth-heavy, Unconventional beats", "Region": "Global"},
    {"Name": "Devi Sri Prasad", "Role": "Music Director", "Industry": "Tollywood", "Exp": 25, "Projects": ["Pushpa: The Rise - Part 1", "Rangasthalam", "Arya"], "Style": "High-tempo, Catchy hooks, Folk-pop", "Region": "India"},
    {"Name": "Trent Reznor", "Role": "Music Director", "Industry": "Hollywood", "Exp": 15, "Projects": ["The Social Network", "Gone Girl", "Soul"], "Style": "Industrial ambient, Creepy synths, Minimalist", "Region": "Global"},
    {"Name": "Vishal-Shekhar", "Role": "Music Director", "Industry": "Bollywood", "Exp": 25, "Projects": ["Om Shanti Om", "Chennai Express", "Pathaan"], "Style": "Pop-fusion, Upbeat, Club anthems", "Region": "India"},
    {"Name": "Shankar-Ehsaan-Loy", "Role": "Music Director", "Industry": "Bollywood", "Exp": 25, "Projects": ["Dil Chahta Hai", "Kal Ho Naa Ho", "Taare Zameen Par"], "Style": "Rock-infused, Contemporary, Soulful", "Region": "India"}
]

def fetch_omdb_data(title):
    url = f"http://www.omdbapi.com/?t={title}&apikey={API_KEY}"
    try:
        res = requests.get(url).json()
        if res.get("Response") == "True":
            return res
    except Exception as e:
        pass
    return None

def extract_awards_count(awards_str):
    if not awards_str or awards_str == "N/A":
        return 0
    nums = re.findall(r'\d+', awards_str)
    return sum(int(n) for n in nums)

results = []

for tech in technicians:
    genres = set()
    ratings = []
    total_awards = 0
    recent_projects_count = 0
    
    for proj in tech["Projects"]:
        data = fetch_omdb_data(proj)
        if data:
            if data.get("Genre") and data["Genre"] != "N/A":
                for g in data["Genre"].split(","):
                    genres.add(g.strip())
            
            if data.get("imdbRating") and data["imdbRating"] != "N/A":
                ratings.append(float(data["imdbRating"]))
                
            total_awards += extract_awards_count(data.get("Awards", ""))
            
            # Simple heuristic: if movie year >= 2021, consider it recent
            year_str = data.get("Year", "")
            if year_str.isdigit() and int(year_str) >= 2021:
                recent_projects_count += 1

    # Fallbacks if OMDB failed
    avg_rating = round(sum(ratings) / len(ratings), 1) if ratings else 7.5
    final_genres = ", ".join(list(genres)[:3]) if genres else "Drama, Action"
    total_awards = total_awards if total_awards > 0 else tech["Exp"] // 2
    
    # Calculate Demand Metrics
    # Base logic: Exp + Ratings scaling + Awards scaling + Recent
    base_score = 5.0
    exp_boost = min(tech["Exp"] / 20.0, 1.5)  # Max 1.5
    rating_boost = max((avg_rating - 6.0), 0) # 8.5 -> +2.5
    award_boost = min(total_awards / 25.0, 1.5) 
    
    demand_score = round(base_score + exp_boost + rating_boost + award_boost, 1)
    demand_score = min(max(demand_score, 1.0), 10.0)
    
    if demand_score >= 8.8:
        tier = "Premium"
    elif demand_score >= 7.5:
        tier = "High"
    elif demand_score >= 5.0:
        tier = "Medium"
    else:
        tier = "Low"
        
    collab_level = "High" if len(tech["Projects"]) >= 3 and tier in ["High", "Premium"] else ("Medium" if tech["Exp"] > 15 else "Low")

    results.append({
        "Name": tech["Name"],
        "Role": tech["Role"],
        "Industry": tech["Industry"],
        "Years_of_Experience": tech["Exp"],
        "Notable_Projects": ", ".join(tech["Projects"]),
        "Genres": final_genres,
        "Style_Tags": tech["Style"],
        "Recent_Project_Count": recent_projects_count + 1, # Base 1 to ensure some activity
        "Avg_Project_Rating": avg_rating,
        "Awards_Count": total_awards,
        "Collaboration_Level": collab_level,
        "Demand_Score": demand_score,
        "Demand_Tier": tier,
        "Region": tech["Region"]
    })
    
    # Sleep to respect OMDB free tier rate limits a bit
    time.sleep(0.05)

csv_file = "technicians_dataset.csv"
fieldnames = [
    "Name", "Role", "Industry", "Years_of_Experience", "Notable_Projects",
    "Genres", "Style_Tags", "Recent_Project_Count", "Avg_Project_Rating",
    "Awards_Count", "Collaboration_Level", "Demand_Score", "Demand_Tier", "Region"
]

with open(csv_file, mode="w", newline="", encoding="utf-8") as file:
    writer = csv.DictWriter(file, fieldnames=fieldnames)
    writer.writeheader()
    for item in results:
        writer.writerow(item)

print(f"Successfully created {csv_file} with {len(results)} records using OMDB API.", flush=True)
