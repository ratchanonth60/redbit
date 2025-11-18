import json
import urllib.request
import urllib.error
import time
import sys

GRAPHQL_URL = "http://127.0.0.1:8000/graphql/"

def run_query(query, variables=None, token=None):
    data = {"query": query, "variables": variables}
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"JWT {token}"
    
    req = urllib.request.Request(GRAPHQL_URL, json.dumps(data).encode("utf-8"), headers)
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code} {e.reason}")
        return None
    except urllib.error.URLError as e:
        print(f"Request failed: {e}")
        return None

def verify_api():
    print("⏳ Waiting for backend to be ready...")
    for _ in range(20):
        try:
            urllib.request.urlopen(GRAPHQL_URL, timeout=1)
            print("✅ Backend is reachable.")
            break
        except urllib.error.HTTPError as e:
            # 400 Bad Request means server is up but didn't like the empty GET
            if e.code == 400:
                print("✅ Backend is reachable (returned 400).")
                break
            print(f"Waiting... (HTTP {e.code})")
            time.sleep(1)
        except Exception as e:
            print(f"Waiting... ({e})")
            time.sleep(1)
    else:
        print("❌ Backend is not reachable after 20s.")
        sys.exit(1)

    # 1. Register
    print("\n🔹 Testing Registration...")
    username = f"testuser_{int(time.time())}"
    email = f"{username}@example.com"
    password = "TestPassword123!"
    
    register_mutation = """
    mutation Register($username: String!, $email: String!, $password: String!) {
        registerUser(username: $username, email: $email, password: $password) {
            success
            errors
            user {
                username
            }
        }
    }
    """
    res = run_query(register_mutation, {"username": username, "email": email, "password": password})
    print(f"Response: {res}")
    
    if res and res.get("data") and res["data"].get("registerUser", {}).get("success"):
        print(f"✅ Registration successful for {username}")
    else:
        print(f"❌ Registration failed: {res}")
        # Proceeding anyway to test login (might fail if reg failed)

    # 2. Login
    print("\n🔹 Testing Login...")
    login_mutation = """
    mutation Login($username: String!, $password: String!) {
        tokenAuth(username: $username, password: $password) {
            token
            refreshToken
        }
    }
    """
    res = run_query(login_mutation, {"username": username, "password": password})
    token = res.get("data", {}).get("tokenAuth", {}).get("token")
    
    if token:
        print("✅ Login successful. Token received.")
    else:
        print(f"❌ Login failed: {res}")
        sys.exit(1)

    # 3. Fetch Posts
    print("\n🔹 Testing Fetch Posts (Feed)...")
    posts_query = """
    query {
        allPosts {
            id
            title
            author {
                username
            }
        }
    }
    """
    res = run_query(posts_query, token=token)
    print(f"Response: {res}")
    
    if res and res.get("data") and res["data"].get("allPosts") is not None:
        posts = res["data"]["allPosts"]
        print(f"✅ Fetch Posts successful. Found {len(posts)} posts.")
    else:
        print(f"❌ Fetch Posts failed: {res}")

if __name__ == "__main__":
    verify_api()
