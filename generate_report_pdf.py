import re
from playwright.sync_api import sync_playwright

html_content = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Placement Year Log Report - Vihanga Randima</title>
<style>
  @page {
    size: A4 portrait;
    margin: 12mm 16mm 12mm 16mm;
  }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body {
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
    color: #1e293b;
    line-height: 1.40;
    font-size: 9.2pt;
    margin: 0;
    padding: 0;
    background-color: #ffffff;
  }
  .page-container {
    page-break-after: always;
    break-after: page;
  }
  .page-container:last-child {
    page-break-after: avoid;
    break-after: avoid;
  }
  h1.doc-title {
    text-align: center;
    font-size: 13.5pt;
    font-weight: 800;
    letter-spacing: 0.5px;
    margin: 0 0 10px 0;
    color: #0f172a;
    text-transform: uppercase;
    border-bottom: 2px solid #0f172a;
    padding-bottom: 4px;
  }
  .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 11px; }
  .meta-table td { border: 1px solid #94a3b8; padding: 5px 8px; font-size: 9pt; }
  .meta-label { font-weight: 700; background-color: #f1f5f9; width: 28%; color: #0f172a; }
  .meta-val { width: 72%; color: #1e293b; }
  h2.section-header {
    font-size: 9.9pt;
    font-weight: 700;
    color: #0f172a;
    margin-top: 8px;
    margin-bottom: 4px;
    padding-bottom: 2px;
    border-bottom: 1.5px solid #cbd5e1;
  }
  p { margin: 0 0 6px 0; text-align: justify; line-height: 1.40; }
  .month-block { margin-bottom: 7px; }
  .month-title { font-weight: 700; color: #0f172a; margin-bottom: 2px; font-size: 9.3pt; }
  ul.task-list { margin: 0 0 5px 0; padding-left: 18px; }
  ul.task-list li { margin-bottom: 3.5px; line-height: 1.38; text-align: justify; }
  ul.task-list li strong { color: #0f172a; }
  .achievement-box {
    background-color: #f8fafc;
    border-left: 3.5px solid #0284c7;
    padding: 7px 11px;
    margin: 8px 0;
    border-radius: 0 4px 4px 0;
  }
  .achievement-box h3 { margin: 0 0 3px 0; font-size: 9.4pt; color: #0369a1; font-weight: 700; }
  .eval-table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 10px; }
  .eval-table th, .eval-table td { border: 1px solid #64748b; padding: 6px 6px; font-size: 8.8pt; text-align: center; }
  .eval-table th { background-color: #f1f5f9; font-weight: 700; color: #0f172a; }
  .eval-table td.criteria-col { text-align: left; font-weight: 600; color: #1e293b; width: 42%; }
  .eval-table th.criteria-head { text-align: left; width: 42%; }
  .eval-table td.rating-col { width: 11.6%; height: 24px; }
  .sig-block { margin-top: 14px; margin-bottom: 10px; display: flex; justify-content: space-between; font-size: 9.2pt; }
  .sig-row { margin-bottom: 6px; line-height: 1.6; }
  .footer-instruction {
    font-size: 7.8pt;
    color: #475569;
    margin-top: 10px;
    padding-top: 6px;
    border-top: 1px dashed #cbd5e1;
    line-height: 1.35;
    text-align: justify;
    font-style: italic;
  }
  .tag-note { font-size: 8.2pt; color: #64748b; font-style: italic; margin-top: 3px; margin-bottom: 5px; }
</style>
</head>
<body>

  <!-- ==================== PAGE 1 ==================== -->
  <div class="page-container">
    <h1 class="doc-title">COMPUTING STUDENTS &ndash; PLACEMENT YEAR LOG REPORT</h1>

    <table class="meta-table">
      <tr>
        <td class="meta-label">Student Name:</td>
        <td class="meta-val"><strong>A. G. Vihanga Randima</strong> (Student ID: 20232157 | UoW ID: w2120022)</td>
      </tr>
      <tr>
        <td class="meta-label">Placement Provider &amp; Department:</td>
        <td class="meta-val"><strong>LeapGen Accelerator &ndash; Informatics Institute of Technology (IIT)</strong></td>
      </tr>
      <tr>
        <td class="meta-label">Workplace Supervisor Name:</td>
        <td class="meta-val">....................................................................................................................</td>
      </tr>
      <tr>
        <td class="meta-label">Date:</td>
        <td class="meta-val">29/10/2026</td>
      </tr>
    </table>

    <h2 class="section-header">Description of activities, including projects, tasks, roles and achievements ***</h2>
    <p>
      My role during this placement period was <strong>Full-Stack Developer &amp; Product Engineer</strong> at the <strong>LeapGen Accelerator (Informatics Institute of Technology)</strong>, working on our startup venture <strong>Yamu Car Rentals (CarRents.lk / yamucarrentals.lk)</strong> which my team and I developed as our incubator project. Yamu Car Rentals is a dedicated online vehicle rental marketplace for Sri Lanka, designed to connect individual vehicle owners and rental fleet businesses with local travelers and international tourists. Within our team, I was responsible for full-stack software architecture—engineering the React frontend, Node.js and Express REST APIs, MongoDB data layer, company fleet management dashboards, and the central booking dispatch CRM. Concurrently, I spearheaded <strong>vehicle onboarding operations</strong> (inspecting, photographing, cataloguing, and publishing vehicle inventory with technical specs and rental policies) and executed <strong>digital marketing initiatives</strong> (technical SEO architecture, search engine indexing, promotional creatives, and customer acquisition campaigns). My records cover the 4-month period from <strong>1 July 2026 to 29 October 2026</strong>.
    </p>

    <div class="month-block">
      <div class="month-title">July 2026</div>
      <ul class="task-list">
        <li><strong>Accelerator Project Setup &amp; Architecture:</strong> Initialized the Yamu Car Rentals platform architecture under the LeapGen Accelerator framework; authored comprehensive project documentation (<code>README.md</code>), configured continuous integration/deployment on Vercel (frontend) and Render (backend), and established Git workflow standards for team collaboration.</li>
        <li><strong>Navigation &amp; Global State Management:</strong> Developed modern, responsive <code>Navbar</code> components with intuitive search pathways, integrated <code>CurrencyContext</code> for seamless real-time multi-currency conversions, and optimized hero banner responsiveness across mobile and desktop viewports.</li>
        <li><strong>Vehicle Data Modeling &amp; Research:</strong> Researched Sri Lankan vehicle rental operational requirements, designed Mongoose schemas for vehicle attributes (engine capacity, transmission, fuel type, daily rates, deposit rules), and categorized fleets into cars, premium cars, vans, mini-vans, three-wheelers, and motorbikes.</li>
      </ul>
    </div>

    <div class="month-block">
      <div class="month-title">August 2026</div>
      <ul class="task-list">
        <li><strong>Company Dashboard Revamp:</strong> Redesigned and implemented the company/host administrative dashboard UI featuring a compact branded orange aesthetic, custom fleet metrics, live rental indicators, secure authentication, and session termination controls.</li>
        <li><strong>Vehicle Cataloguing &amp; Dynamic Form Controls:</strong> Implemented dynamic cascading dropdown selectors for vehicle brand and model classification, integrated fuel type and transmission options, and built an interactive vehicle availability calendar replacing static lead forms to eliminate double-booking.</li>
        <li><strong>Map &amp; Geo-Radius Optimization:</strong> Integrated Google Maps API to visually display vehicle pickup and return hubs across Sri Lanka (Colombo, Kandy, Galle), optimizing rendering performance and location geocoding.</li>
        <li><strong>Vehicle Onboarding (Adding Fleet Inventory):</strong> Commenced hands-on vehicle onboarding operations. Directly coordinated with individual car owners and rental hosts to inspect and catalogue vehicles; verified registration, fuel types, transmission, and seating; captured and curated mandatory 5-angle photographic sets; and uploaded live listings onto the platform with customized daily rental rates and deposit terms.</li>
      </ul>
    </div>
  </div>

  <!-- ==================== PAGE 2 ==================== -->
  <div class="page-container">
    <div class="month-block">
      <div class="month-title">September 2026</div>
      <ul class="task-list">
        <li><strong>Landing Page &amp; Category Showcase Overhaul:</strong> Re-engineered the public landing page with dynamic category cards (Sedans, SUVs, Electric, Vans, Tuk-Tuks, Bikes), curated fleet collections, and verified customer testimonials to improve user retention.</li>
        <li><strong>Cloud Media Pipeline Integration:</strong> Replaced local server storage by integrating Cloudinary CDN image streaming in the backend; implemented direct image uploading, automatic format transformation, and responsive delivery for all vehicle photo assets.</li>
        <li><strong>Automated Location &amp; District Intelligence:</strong> Built an automated district detection mechanism utilizing a Sri Lankan town dictionary, Google address components, and geographic coordinate mapping to ensure accurate regional filtering for renters.</li>
        <li><strong>Digital Marketing &amp; Technical SEO Infrastructure:</strong> Configured comprehensive on-page and technical SEO for <em>yamucarrentals.lk</em>, generating dynamic <code>sitemap.xml</code>, <code>robots.txt</code>, Open Graph social preview cards, and semantic JSON-LD structured schema markup (<code>AutoRental</code> schema). Structured semantic H1/H2 hierarchies targeting organic keywords such as <em>"car rental Sri Lanka"</em>, <em>"self-drive car hire Colombo"</em>, and <em>"van hire with driver"</em>.</li>
      </ul>
    </div>

    <div class="month-block">
      <div class="month-title">October 2026</div>
      <ul class="task-list">
        <li><strong>Quick Fleet Add &amp; Inline Fleet Management:</strong> Engineered an intuitive "Quick Add" vehicle interface enabling hosts and fleet administrators to rapidly publish vehicles with pre-filled saved address profiles and multi-image uploads, cutting vehicle onboarding time by over 60%.</li>
        <li><strong>Real-Time Availability &amp; Date-Aware Badging:</strong> Deployed live status badges on vehicle cards showing real-time "Booked" vs. "Available" status along with the exact next available rental date, substantially reducing dropped rental inquiries.</li>
        <li><strong>Central Bookings CRM &amp; WhatsApp Dispatch Integration:</strong> Connected the frontend "Confirm &amp; Book" button directly to the central admin CRM dispatch desk; built automated WhatsApp click-to-chat messaging templates to enable instant booking verification and vehicle dispatching by Yamu agents.</li>
        <li><strong>Admin Dashboard Phone Layout &amp; Light Mode:</strong> Designed a dedicated mobile dashboard layout with light mode support, empowering rental dispatchers and fleet owners to manage bookings and update availability seamlessly from smartphones.</li>
        <li><strong>Renter Privacy Protection &amp; Security:</strong> Built backend data sanitization middleware to conceal car owners' private telephone numbers and exact residential street addresses from public viewers, routing all inquiries through verified Yamu dispatch channels to protect host privacy.</li>
        <li><strong>Site-Wide Asset Compression:</strong> Performed comprehensive image and asset compression across the platform (reducing image payloads from 15.7 MB down to 2.8 MB), dramatically enhancing page load times on 4G/mobile networks across Sri Lanka.</li>
        <li><strong>Marketing Creatives &amp; Fleet Expansion:</strong> Created branded promotional graphics, vehicle cutouts (<code>yamu_fleet_cutout.png</code>), and social media marketing cards for promotional campaigns across Meta platforms (Facebook and Instagram); conducted proactive host outreach to onboard new sedans, SUVs, and passenger vans into the Colombo and Southern coastal fleet.</li>
      </ul>
    </div>

    <div class="achievement-box">
      <h3>Key achievements</h3>
      <ul class="task-list" style="margin-bottom: 0;">
        <li><strong>Engineered Complete Vehicle Onboarding Architecture:</strong> Built and launched the full vehicle listing ecosystem (Quick Fleet Add, 5-image verification grid, Sri Lankan district auto-detection, and inline fleet editing), successfully onboarding dozens of vehicles into our project's active rental inventory.</li>
        <li><strong>Implemented Full SEO Architecture &amp; Indexing:</strong> Configured technical SEO (schema markup, dynamic sitemaps, semantic tags, and meta cards), securing complete Google Search indexing for <em>yamucarrentals.lk</em> and generating organic search impressions and booking leads.</li>
        <li><strong>Delivered Central Booking CRM &amp; WhatsApp Dispatch Desk:</strong> Connected customer vehicle booking requests directly to a centralized admin dispatch pipeline with automated WhatsApp templates, speeding up customer confirmation turnaround time.</li>
        <li><strong>Delivered 82% Asset Weight Reduction &amp; Mobile Optimization:</strong> Compressed platform assets from 15.7 MB to 2.8 MB and delivered dedicated phone views for company and admin dashboards, achieving rapid load speeds and high usability on mobile devices.</li>
      </ul>
    </div>
    <div class="tag-note">*** it is advisable to present your answers for questions 1 and 2 in chronological order e.g. per month.</div>
  </div>

  <!-- ==================== PAGE 3 ==================== -->
  <div class="page-container">
    <h2 class="section-header">Description of any internal/external training undertaken ***</h2>
    <div class="month-block">
      <div class="month-title">July to August 2026</div>
      <ul class="task-list">
        <li><strong>Hands-on Full-Stack Engineering &amp; Modern Frameworks:</strong> Undertook self-directed technical upskilling on MERN stack architecture (MongoDB, Express, React, Node.js), Vite bundling, React hooks, and RESTful API authentication workflows.</li>
        <li><strong>Cloud Media Delivery &amp; CDN Infrastructure:</strong> Completed self-paced practical training on Cloudinary API integration, learning secure unsigned/signed image streaming, dynamic asset transformations, and CDN caching concepts.</li>
        <li><strong>Teamwork &amp; Version Control Best Practices:</strong> Internal peer training and practice on collaborative Git workflows within our LeapGen team, handling feature branches, resolving multi-developer merge conflicts, and maintaining semantic commit histories.</li>
      </ul>
    </div>

    <div class="month-block">
      <div class="month-title">September to October 2026</div>
      <ul class="task-list">
        <li><strong>LeapGen Accelerator (IIT): 90-Day Learning and Growth Demo Day (11 September 2026):</strong> Attended and presented Yamu Car Rentals at the incubator showcase, learning about early-stage startup growth, market positioning, and tech-driven product validation.</li>
        <li><strong>LeapGen Orientation Support (17 September 2026):</strong> Assisted faculty and peers during the startup accelerator orientation program at Informatics Institute of Technology (IIT).</li>
        <li><strong>NEDA Entrepreneurship &amp; Digitalization Workshop (22 to 24 September 2026, 3 days):</strong> Participated in the National Enterprise Development Authority workshop focused on digital adoption for local enterprises, customer relationship management, and commercial operations.</li>
        <li><strong>Web Performance &amp; Technical SEO Workshop (29 September 2026):</strong> Completed a focused workshop on Core Web Vitals, Google PageSpeed optimization, structured data (Schema.org), and search engine crawling architectures.</li>
        <li><strong>Self-Directed Automotive Market Research:</strong> Researched Sri Lankan rent-a-car industry regulations, vehicle insurance coverage standards, and self-drive versus chauffeur-driven market expectations to directly guide platform features and privacy policies.</li>
      </ul>
    </div>

    <h2 class="section-header" style="margin-top: 14px;">Reflection on your learning (e.g. skills and knowledge gained) from the above</h2>
    <p>
      My placement at the <strong>LeapGen Accelerator (IIT)</strong> developing our startup project <strong>Yamu Car Rentals (CarRents.lk)</strong> provided an exceptional bridge connecting academic computer science principles with real-world commercial software delivery and startup execution. In technical terms, architecting the full-stack system deepened my proficiency in component-driven UI engineering with React, global state management, RESTful API design in Node.js and Express, and database modeling in MongoDB. Implementing Cloudinary CDN streaming and asset compression taught me the vital importance of performance engineering and bandwidth optimization in real-world environments.
    </p>
    <p>
      Crucially, onboarding vehicles and executing digital marketing within an accelerator environment gave me practical insights that cannot be gained solely in an isolated coding environment. By cataloguing cars, gathering vehicle specifications, and taking quality photos, I learned how software data schemas directly reflect physical operational constraints. Implementing technical SEO, schema markup, and metadata gave me an in-depth understanding of organic user acquisition, showing how search engine bots crawl, parse, and rank web applications. Furthermore, architecting the WhatsApp CRM booking dispatch desk and car owner privacy safeguards demonstrated how technology must be structured to build customer confidence and protect supplier security in a competitive peer-to-peer marketplace.
    </p>
  </div>

  <!-- ==================== PAGE 4 ==================== -->
  <div class="page-container">
    <h2 class="section-header">Identify any areas requiring improvement (if any)</h2>
    <ul class="task-list">
      <li><strong>Consistency of Daily Documentation:</strong> During high-intensity development and onboarding sprints, some daily log entries were consolidated retroactively rather than recorded on the same day; I need to establish a strict end-of-day logging habit with technical granularity.</li>
      <li><strong>Automated Test Coverage:</strong> While manual end-to-end testing across devices and browsers was extensive, the project lacked automated unit and integration tests (such as Jest or Supertest for API routes); establishing automated testing will prevent regressions during future deployments.</li>
      <li><strong>Centralized Bug &amp; Issue Tracking:</strong> Bug fixes and operational UI adjustments were frequently tracked through direct team communication channels and Git commit messages rather than formal issue tracking software; using structured issue tracking will improve traceability.</li>
      <li><strong>Task Estimation and Sprint Pacing:</strong> Rapid concurrent delivery of marketing assets, fleet onboarding, and feature development occasionally resulted in overlapping Git branches and complex merges; I need to refine sprint scoping and estimation techniques.</li>
    </ul>

    <h2 class="section-header" style="margin-top: 12px;">Your goals or targets for the next couple of months based on areas requiring improvement (if any)</h2>
    <ul class="task-list">
      <li><strong>Implement Automated Testing Suites:</strong> Author unit tests for backend vehicle and booking controllers, as well as integration tests for authentication and Cloudinary image upload workflows using Jest and Supertest.</li>
      <li><strong>Adopt Structured Project &amp; Bug Tracking:</strong> Establish a formalized project backlog and bug tracking workflow using GitHub Projects or Jira, enforcing reproducible steps, severity classification, and acceptance criteria.</li>
      <li><strong>Integrate Redis In-Memory Caching:</strong> Deepen backend engineering capabilities by implementing Redis caching for frequently requested vehicle catalog searches and category filters to minimize MongoDB query loads.</li>
      <li><strong>Implement Analytics &amp; Conversion Funnels:</strong> Integrate Google Analytics 4 (GA4) custom event tracking across the vehicle listing, date-selection, and WhatsApp booking triggers to quantitatively evaluate customer conversion drop-offs.</li>
      <li><strong>Maintain Daily Logging Rigour:</strong> Submit detailed daily learning and task records on the exact day of execution, tracking blockers, technical solutions, and operational outcomes consistently.</li>
    </ul>

    <h2 class="section-header" style="margin-top: 12px;">Describe and evaluate your own skills in relation to the graduate attributes and the professional skills needed in the sector</h2>
    <ul class="task-list">
      <li><strong>Technical Skills:</strong> Proficient in modern full-stack web development (React, Vite, Node.js, Express, MongoDB/Mongoose), RESTful API design, cloud media management (Cloudinary), responsive UI styling, and technical SEO implementation. I am committed to advancing my knowledge in test automation and microservices.</li>
      <li><strong>Attention to Detail and Critical Thinking:</strong> Evidenced through solving complex usability challenges—such as designing real-time date-aware vehicle availability badges, district auto-detection using Sri Lankan town dictionaries, and building privacy protection middleware to shield host personal data from public view.</li>
      <li><strong>Creativity &amp; Visual Communication:</strong> Demonstrated across both technical design and marketing—crafting branded UI themes (compact orange company dashboard), vehicle promotional cutouts, marketing creatives, and landing page asset compositions.</li>
      <li><strong>Communication &amp; Stakeholder Engagement:</strong> Communicated effectively with team members, fleet partners, and individual car owners during vehicle onboarding; pitched our startup progress at LeapGen showcases and translated operational rental challenges into intuitive software features.</li>
      <li><strong>Teamwork &amp; Professionalism:</strong> Collaborated actively within our project team repository, submitted clean pull requests, resolved merge conflicts cooperatively, supported peer features, and represented the team at academic and entrepreneurship forums (LeapGen IIT).</li>
      <li><strong>Lifelong Learning &amp; Adaptability:</strong> Demonstrated initiative by actively participating in external workshops (NEDA, Web Performance &amp; SEO), self-teaching Cloudinary cloud architecture, and researching Sri Lankan rental vehicle legal and market frameworks.</li>
    </ul>
    <p>
      <strong>Overall Evaluation:</strong> Developing Yamu Car Rentals under the LeapGen IIT Accelerator has provided comprehensive exposure across commercial software engineering, startup product onboarding, and digital marketing. I have developed the technical competence, problem-solving mindset, and professional discipline required to excel in the software industry, and I will continue to focus on test-driven development, scalable architecture, and systematic documentation.
    </p>
  </div>

  <!-- ==================== PAGE 5 ==================== -->
  <div class="page-container">
    <div class="tag-note" style="margin-top: 2px; margin-bottom: 8px; font-size: 8.5pt;">
      Once you have addressed the points (outlined in questions 1-5), ask your supervisor to assess your performance for the month using the following table.
    </div>

    <table class="eval-table">
      <thead>
        <tr>
          <th class="criteria-head" style="font-size: 9pt; padding: 7px;">Performance Criteria</th>
          <th style="font-size: 9pt;">Below expectation</th>
          <th style="font-size: 9pt;">Satisfactory</th>
          <th style="font-size: 9pt;">Above expectation</th>
          <th style="font-size: 9pt;">Outstanding</th>
          <th style="font-size: 9pt;">N/A</th>
        </tr>
      </thead>
      <tbody>
        <tr><td class="criteria-col" style="padding: 9px 8px;">Attitude to work</td><td></td><td></td><td></td><td></td><td></td></tr>
        <tr><td class="criteria-col" style="padding: 9px 8px;">Quality of work</td><td></td><td></td><td></td><td></td><td></td></tr>
        <tr><td class="criteria-col" style="padding: 9px 8px;">Productivity</td><td></td><td></td><td></td><td></td><td></td></tr>
        <tr><td class="criteria-col" style="padding: 9px 8px;">Literacy and Communication skills</td><td></td><td></td><td></td><td></td><td></td></tr>
        <tr><td class="criteria-col" style="padding: 9px 8px;">Critical Thinking skills</td><td></td><td></td><td></td><td></td><td></td></tr>
        <tr><td class="criteria-col" style="padding: 9px 8px;">Reliability</td><td></td><td></td><td></td><td></td><td></td></tr>
        <tr><td class="criteria-col" style="padding: 9px 8px;">Global Outlook</td><td></td><td></td><td></td><td></td><td></td></tr>
        <tr><td class="criteria-col" style="padding: 9px 8px;">Suitability of future goals (refer to question 5)</td><td></td><td></td><td></td><td></td><td></td></tr>
        <tr><td class="criteria-col" style="padding: 9px 8px;">Overall Achievement</td><td></td><td></td><td></td><td></td><td></td></tr>
      </tbody>
    </table>

    <div class="sig-block" style="margin-top: 25px; margin-bottom: 25px;">
      <div style="width: 55%;">
        <div class="sig-row" style="font-size: 9.5pt; margin-bottom: 12px;">Workplace Supervisor Signature: ...................................................</div>
        <div class="sig-row" style="font-size: 9.5pt;">Date: ...................................................</div>
      </div>
      <div style="width: 45%; text-align: right;">
        <div class="sig-row" style="font-size: 9.5pt; margin-bottom: 12px;">Student Name &amp; Signature: <strong>A. G. Vihanga Randima</strong> &nbsp; ........................</div>
        <div class="sig-row" style="font-size: 9.5pt;">Date: 29/10/2026</div>
      </div>
    </div>

    <div class="footer-instruction" style="margin-top: 25px; padding-top: 10px; font-size: 8.5pt;">
      A scanned copy of the log report should be uploaded via the 'Log Report - Upload Report' option on Blackboard Placement module site by the specific deadline. Throughout the academic year 3 log reports must be uploaded on deadlines announced on Blackboard. Make sure you check the placement Blackboard site regularly.
    </div>
  </div>

</body>
</html>
"""

# Save HTML file
html_path = "c:/Users/USER/Desktop/CarRents.lk/Placement_Year_Log_Report_Vihanga_Randima.html"
with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"HTML saved at {html_path}")

# Output PDF paths
output_paths = [
    "c:/Users/USER/Desktop/CarRents.lk/Placement_Year_Log_Report_Vihanga_Randima_LeapGen.pdf",
    "c:/Users/USER/Desktop/Vihanga_Randima_Placement_Log_Report_LeapGen.pdf",
    "c:/Users/USER/Desktop/CarRents.lk/Placement_Year_Log_Report_Vihanga_Randima.pdf",
    "c:/Users/USER/Desktop/Yamu_CarRentals_Placement_Log_Report_Vihanga_Randima.pdf",
    "c:/Users/USER/Desktop/Placement_Year_Log_Report_Vihanga_Randima.pdf",
    "C:/Users/USER/.gemini/antigravity/brain/49ab4b79-3563-4829-9bb9-5b7e54fbf94e/Placement_Year_Log_Report_Vihanga_Randima.pdf"
]

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.set_content(html_content, wait_until="networkidle")
    
    pdf_bytes = page.pdf(
        format="A4",
        print_background=True,
        margin={
            "top": "12mm",
            "bottom": "12mm",
            "left": "16mm",
            "right": "16mm"
        },
        display_header_footer=True,
        header_template="<div></div>",
        footer_template='<div style="width: 100%; font-size: 8pt; color: #94a3b8; text-align: right; padding-right: 16mm;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>'
    )
    browser.close()

saved_successfully = []
for pth in output_paths:
    try:
        with open(pth, "wb") as f:
            f.write(pdf_bytes)
        saved_successfully.append(pth)
        print(f"Successfully written: {pth}")
    except Exception as e:
        print(f"File locked by viewer (skipped): {pth}")

matches = re.findall(b'/Type\\s*/Page[^s]', pdf_bytes)
print(f"PDF successfully generated! Exact page count: {len(matches)}")

