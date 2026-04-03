from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import os
import json
from dotenv import load_dotenv
import traceback

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

DB_CONFIG = {
    "dbname": os.getenv("DB_NAME", "skillbridge_db"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", "Anu123@sha2803"),
    "host": os.getenv("DB_HOST", "localhost"),
    "port": os.getenv("DB_PORT", "5433")
}

def get_db_connection():
    try:
        conn = psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)
        return conn
    except Exception as e:
        print(f"DB connection error: {e}")
        return None

def parse_skills(s):
    if not s:
        return []
    if isinstance(s, list):
        return [str(x).lower().strip() for x in s if x]
    if isinstance(s, str):
        s = s.strip()
        if not s or s in ('[]', 'null', '""', "''"):
            return []
        try:
            parsed = json.loads(s)
            if isinstance(parsed, list):
                return [str(x).lower().strip() for x in parsed if x]
            if isinstance(parsed, str):
                return [parsed.lower().strip()] if parsed.strip() else []
        except:
            pass
        if ',' in s:
            return [x.lower().strip() for x in s.split(',') if x.strip()]
        return [s.lower().strip()]
    return []

def compute_match_score(candidate_skills, required_skills):
    set_c = set(candidate_skills)
    set_r = set(required_skills)
    if not set_r: return 0.0
    intersection = set_c & set_r
    union = set_c | set_r
    coverage = len(intersection) / len(set_r)
    jaccard = len(intersection) / len(union) if union else 0.0
    return round((0.6 * coverage + 0.4 * jaccard) * 100, 1)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})

@app.route('/match', methods=['POST'])
def match():
    try:
        data = request.json or {}
        user_iam = str(data.get("iam", "volunteer")).lower()
        user_id = data.get("userId")
        passed_skills = parse_skills(data.get("skills", []))

        print(f"\n[Match API] iam={user_iam!r}, userId={user_id!r}, passed_skills={passed_skills}")

        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500

        cur = conn.cursor()
        results = []

        if 'ngo' in user_iam:
            target_skills = set(passed_skills)
            has_opportunities = False
            opportunity_ids = []
            if user_id:
                try:
                    uid_int = int(user_id)
                    ngo_opportunities = []
                    for r in rows:
                        opp_skills = parse_skills(r["requiredSkills"])
                        target_skills.update(opp_skills)
                        ngo_opportunities.append({
                            "id": r["id"],
                            "title": r.get("title") or "Volunteer Project",
                            "skills": opp_skills
                        })
                        opportunity_ids.append(r["id"])
                    if ngo_opportunities:
                        has_opportunities = True
                except Exception as e:
                    print(f"NGO fetch error: {e}")
            
            target_list = list(target_skills)
            
            # NGO Matching Logic: 
            # 1. We only match if the NGO has posted opportunities
            # 2. We match volunteers based on the required skills of those opportunities
            if has_opportunities and target_list:
                # Cast jsonb to text to allow ILIKE search
                placeholders = " OR ".join(["skills::text ILIKE %s" for _ in target_list])
                params = [f"%{s}%" for s in target_list]
                query = f"SELECT id, \"fullName\" as name, skills FROM users WHERE iam = 'volunteer' AND ({placeholders})"
                cur.execute(query, params)
                volunteers = cur.fetchall()
            elif not has_opportunities:
                # No opportunities = no matches possible
                volunteers = []
            else:
                # NGO exists but has no special skills in opportunities? Fetch some anyway to avoid total empty state?
                # Actually, better to stay strict: no skills = no matches.
                volunteers = []
            
            for vol in volunteers:
                vol_skills = parse_skills(vol["skills"])
                score = compute_match_score(vol_skills, target_list)
                
                app_status = None
                is_applied = False
                if opportunity_ids:
                    cur.execute(
                        'SELECT status FROM applications WHERE "volunteerId" = %s AND "opportunityId" = ANY(%s) LIMIT 1',
                        (vol["id"], opportunity_ids)
                    )
                    app_row = cur.fetchone()
                    if app_row:
                        is_applied = True
                        app_status = app_row["status"]

                if app_status not in ['accepted', 'rejected']:
                    # Find which specific NGO opportunity matches this volunteer best
                    best_opp_title = "one of our projects"
                    best_opp_id = None
                    max_opp_score = -1
                    
                    for opp in ngo_opportunities:
                        opp_score = compute_match_score(vol_skills, opp["skills"])
                        if opp_score > max_opp_score:
                            max_opp_score = opp_score
                            best_opp_title = opp["title"]
                            best_opp_id = opp["id"]

                    results.append({
                        "id": vol["id"],
                        "name": vol["name"] or "Volunteer",
                        "skills": vol_skills,
                        "matchScore": score,
                        "isApplied": is_applied,
                        "applicationStatus": app_status,
                        "matchedOpportunityTitle": best_opp_title,
                        "matchedOpportunityId": best_opp_id
                    })
        else:
            # OPTIMIZATION: Filter opportunities based on skills
            if passed_skills:
                # Optimized matching using ILIKE on text-casted jsonb
                skill_conditions = []
                skill_params = []
                for s in passed_skills:
                    skill_conditions.append("(o.\"requiredSkills\"::text ILIKE %s OR o.title ILIKE %s)")
                    skill_params.append(f"%{s}%")
                    skill_params.append(f"%{s}%")
                
                placeholders = " OR ".join(skill_conditions)
                
                query = f"""
                    SELECT o.id, o.title, o."requiredSkills", o.location, o."ngoId", u."organizationName" as "ngoName" 
                    FROM opportunities o
                    LEFT JOIN users u ON o."ngoId" = u.id
                    WHERE COALESCE(o.status, 'open') ILIKE 'open' 
                    AND ({placeholders})
                """
                print(f"[Debug] Volunteer Matching Skills: {passed_skills}")
                print(f"[Debug] Running Query for volunteer matching...")
                cur.execute(query, skill_params)
            else:
                query = """
                    SELECT o.id, o.title, o."requiredSkills", o.location, o."ngoId", u."organizationName" as "ngoName" 
                    FROM opportunities o
                    LEFT JOIN users u ON o."ngoId" = u.id
                    WHERE COALESCE(o.status, 'open') ILIKE 'open'
                """
                print(f"[Debug] Fetching all open opportunities for volunteer...")
                cur.execute(query)
            
            opportunities = cur.fetchall()
            print(f"[Debug] Found {len(opportunities)} potential matches.")
            
            for opp in opportunities:
                opp_skills = parse_skills(opp["requiredSkills"])
                score = compute_match_score(passed_skills, opp_skills)
                
                app_status = None
                is_applied = False
                if user_id:
                    cur.execute(
                        'SELECT status FROM applications WHERE "volunteerId" = %s AND "opportunityId" = %s',
                        (user_id, opp["id"])
                    )
                    app_row = cur.fetchone()
                    if app_row:
                        is_applied = True
                        app_status = app_row["status"]

                if app_status not in ['accepted', 'rejected']:
                    results.append({
                        "id": opp["id"],
                        "title": opp["title"],
                        "ngoName": opp["ngoName"] or "SkillBridge Partner",
                        "skills": opp_skills,
                        "location": opp.get("location", ""),
                        "ngoId": opp.get("ngoId"),
                        "matchScore": score,
                        "isApplied": is_applied,
                        "applicationStatus": app_status
                    })

        cur.close()
        conn.close()
        results = sorted(results, key=lambda x: x["matchScore"], reverse=True)
        
        response_data = {
            "matches": results[:10],
            "hasOpportunities": True # Default for volunteers
        }
        if 'ngo' in user_iam:
            response_data["hasOpportunities"] = has_opportunities

        return jsonify(response_data)
    except Exception as e:
        print(f"Match error: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5001))
    print(f"AI Service starting on port {port}")
    app.run(host="0.0.0.0", port=port, debug=True)