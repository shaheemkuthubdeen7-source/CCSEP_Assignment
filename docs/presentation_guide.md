# ISEC3004 Live Presentation & Demonstration Guide
## Speaker Segment: Aadhil Rizwan (Vulnerable Application Development Lead)
**Name:** Aadhil Rizwan
**Allocated Speaking Time:** 4–5 minutes  
**Audience:** Unit Coordinator, Lab Demonstrator, and Peers  
**Key Goal:** Demonstrate legitimate normal use of both features, then transition into explaining the architectural root causes by pointing directly to the vulnerable lines of code.

---

## 1. Quick Setup Checklist Before Presentation Starts

1. **Terminal 1 (Backend Server):**
   ```bash
   cd isec3004-vulnerable-app
   npm start
   ```
   *(Ensure terminal window displays server startup message and is positioned to show live incoming trace logs).*
2. **Web Browser:**
   - Open `http://localhost:3000` to the demonstration portal.
   - Maximize screen or adjust zoom (110%) for projector clarity.
3. **IDE / Code Editor:**
   - Have `routes/auth.js` open at line 58.
   - Have `routes/documents.js` open at line 74.

---

## 2. Step-by-Step Demonstration Script

### Part 1: Introduction & Architecture (30 Seconds)
- **What to say:**
  > *"Good morning/afternoon everyone. My name is Aadhil, and I served as the Vulnerable Application Development Lead for our group project. For our assignment, our team investigated two major vulnerability classes: NoSQL Injection and Path Traversal. My responsibility was to design and implement a realistic, reliable baseline web application where both features function properly under normal conditions, while containing clearly identifiable architectural flaws that my teammates Kav, Sachin, and Shaheem can analyze, exploit, trace, and mitigate."*

---

### Part 2: Feature 1 - NoSQL Injection Demo & Code Inspection (2 Minutes)

#### A. Live Normal Operation:
- **Action:**
  - Click on **Tab 1: Authentication Portal** in the web browser.
  - Click the quick-fill button **"Admin (Alice)"** (`alice_admin` / `AdminSecret#2026`).
  - Click **"Authenticate via POST /api/auth/login"**.
- **What to say:**
  > *"Here on our enterprise portal, we have an authentication service backed by MongoDB. Under normal conditions, an authorized user such as Alice submits valid credentials. As you can see, the server verifies the identity, returning an HTTP 200 OK along with her administrative role and session token."*
- **Action:**
  - Click the quick-fill button **"Invalid Credentials"** (`alice_admin` / `WrongPassword123`).
  - Click **"Authenticate"**.
- **What to say:**
  > *"Similarly, when invalid credentials are provided, the system correctly rejects the request with an HTTP 401 Unauthorized."*

#### B. Pointing to the Vulnerable Source Line:
- **Action:**
  - Switch to IDE or click on the code snippet box in the UI (`routes/auth.js`).
  - Highlight **Line 44**: `password: password`.
- **What to say:**
  > *"Now let us inspect the backend source code in `routes/auth.js` at line 44. Notice that we pass `req.body.password` directly into Mongoose's `User.findOne()` filter without asserting that it is a string primitive.*
  > 
  > *Because Express deserializes incoming JSON payloads into JavaScript objects, an attacker does not have to send a string. If an attacker submits a nested object with a MongoDB query operator—such as `{ "$ne": "" }`—MongoDB interprets it as a logical condition rather than literal text. Since Alice's stored password is not an empty string, the query evaluates to true, completely bypassing authentication.*
  > 
  > *I will now hand over to Kav, who will demonstrate how an adversary weaponizes this flaw."*
- *(Kav performs live NoSQL exploitation demo)*.

---

### Part 3: Feature 2 - Path Traversal Demo & Code Inspection (2 Minutes)

#### A. Live Normal Operation:
- **Action:**
  - Click on **Tab 2: Compliance Archive** in the web browser.
  - Click on `audit_report_2026.txt`.
- **What to say:**
  > *"Our second feature is an internal document viewing service in `routes/documents.js`. The intended business requirement is to allow internal staff to view public audit and security policies strictly confined to the `public/documents/` folder. When I click `audit_report_2026.txt`, the server fetches the file and displays the compliance report cleanly."*

#### B. Pointing to the Vulnerable Source Line:
- **Action:**
  - Switch to IDE or UI code inspector for `routes/documents.js`.
  - Highlight **Line 54**: `const targetFilePath = path.join(PERMITTED_DOCUMENT_DIR, fileName);`.
- **What to say:**
  > *"Now look at line 54 in `routes/documents.js`. The application uses Node's standard `path.join()` to combine the permitted directory path with the user-supplied filename.*
  > 
  > *While `path.join` normalizes path segments, it does not enforce a boundary sandbox. If an attacker supplies dot-dot-slash traversal sequences such as `../../config/.env.secrets`, `path.join` resolves the relative path right out of the intended directory.*
  > 
  > *Crucially, the code fails to verify whether the canonical resolved path still starts with the permitted base directory. Consequently, the Node process will open and return arbitrary files from across the server filesystem.*
  > 
  > *I will now pass the presentation back to Kav to execute the traversal exploit, followed by Sachin who will show the trace signatures captured during this attack."*

---

## 3. Anticipated Questions from Markers & Model Answers

**Q1: Why did you use Express with MongoDB instead of an SQL database?**
> *"MongoDB represents modern NoSQL document stores commonly deployed in Node.js microservices. In relational SQL databases, parameterization and prepared statements are well understood, but developers frequently misunderstand that JSON deserialization in Node allows objects to be injected directly into NoSQL query filters. Demonstrating this highlights a prevalent, modern OWASP vulnerability."*

**Q2: What was your strategy for making sure the baseline was stable for your team?**
> *"I implemented two key controls: First, an automated test suite (`verify_normal.sh`) that runs on every build to verify that legitimate logins and documents work before any attack tests. Second, I integrated an automatic in-memory MongoDB fallback into `config/db.js` so that if my teammates or the markers do not have a local MongoDB daemon running, the app starts seamlessly without configuration errors."*

**Q3: How was your work reviewed before Shaheem began writing the fixes?**
> *"We followed our team QA protocol where Shaheem reviewed my branch and tested the baseline against our checklist in `docs/project_management.md`. Once Shaheem verified that the vulnerable lines were isolated, cleanly commented, and stable, we tagged `v1.0.0-vulnerable-baseline` in Git, allowing Shaheem to branch off into `feature/mitigation` without merge conflicts."*
