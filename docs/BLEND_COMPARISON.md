# Blended multi-source exposure vs current score (all 1016 occupations)

Generated 2026-10-21 by `scripts/multisource.js`. **Experimental. The current O*NET composite remains the primary score; nothing here changes the live risk level until Drew signs off.**

- Statements per occupation: min 23, median 136, max 742.
- Coverage (occupations with at least one statement from the source): onet 1016, esco 935, ilo 987, oasis 1016, nice 13.
- Compared on rank (percentile among 1016 occupations with both scores), since the blend is a mean of task percentiles and the composite a mean of occupation percentiles.
- Rank correlation (Pearson on percentile ranks = Spearman): **0.867**.
- Mean absolute rank change: 10.8 points; 147 occupations move 20+ points.
- Tercile band (Low/Moderate/High by rank) would change for 259 of 1016 occupations (131 up, 128 down).
- Robotics: no added source publishes task-level robot scores (ILO WP140 is GenAI only), so the robotics value is the O*NET/Anthropic task mean and matches the current index (mean difference -0.000 over 1016 occupations). ESCO/OaSIS/NICE statements show robot tiers transferred from the closest O*NET task for display only.
- The two AI sources measure different things: Anthropic = observed Claude usage on O*NET tasks; ILO = expert/LLM-rated technical potential of ISCO-08 tasks. Large moves mostly come from jobs where they disagree (e.g. postal and gambling work: no observed AI use, but ILO rates the ISCO tasks as automatable), or from jobs with no ILO tasks where the blend is O*NET-task-only while the current composite also uses occupation-level Eloundou and Felten measures.
- ESCO concepts in the 2022 crosswalk that the current ESCO release no longer contains (skipped): 56.

## Largest increases (blend ranks the job as more AI-exposed)
| Code | Title | Current rank | Blend rank | Δ | Direct-source AI (pct) |
|---|---|---|---|---|---|
| 43-5053.00 | Postal Service Mail Sorters, Processors, and Processing Machine Operators | 13 | 64 | +52 | onet 0, ilo 69 |
| 39-6011.00 | Baggage Porters and Bellhops | 23 | 68 | +45 | onet 11, ilo 61 |
| 33-3011.00 | Bailiffs | 20 | 63 | +43 | onet 0, ilo 69 |
| 43-5051.00 | Postal Service Clerks | 37 | 80 | +43 | onet 0, ilo 92 |
| 43-5052.00 | Postal Service Mail Carriers | 22 | 64 | +42 | onet 0, ilo 69 |
| 45-2041.00 | Graders and Sorters, Agricultural Products | 10 | 51 | +40 | onet 0, ilo 52 |
| 51-2022.00 | Electrical and Electronic Equipment Assemblers | 9 | 48 | +39 | onet 7, ilo 43 |
| 43-9051.00 | Mail Clerks and Mail Machine Operators, Except Postal Service | 26 | 64 | +38 | onet 0, ilo 69 |
| 39-9031.00 | Exercise Trainers and Group Fitness Instructors | 1 | 39 | +38 | onet 0, ilo 41 |
| 25-2055.00 | Special Education Teachers, Kindergarten | 25 | 62 | +37 | onet 19, ilo 48 |
| 39-3011.00 | Gambling Dealers | 34 | 69 | +35 | onet 0, ilo 74 |
| 39-3019.00 | Gambling Service Workers, All Other | 34 | 69 | +35 | onet 0, ilo 74 |
| 13-1074.00 | Farm Labor Contractors | 29 | 64 | +35 | onet 0, ilo 70 |
| 51-2092.00 | Team Assemblers | 16 | 51 | +35 | onet 0, ilo 53 |
| 51-2099.00 | Assemblers and Fabricators, All Other | 16 | 51 | +35 | onet 0, ilo 53 |
| 31-1121.00 | Home Health Aides | 0 | 35 | +34 | onet 0, ilo 37 |
| 51-4052.00 | Pourers and Casters, Metal | 9 | 43 | +34 | onet 0, ilo 46 |
| 51-4051.00 | Metal-Refining Furnace Operators and Tenders | 13 | 47 | +33 | onet 0, ilo 49 |
| 27-2021.00 | Athletes and Sports Competitors | 1 | 34 | +33 | onet 0, ilo 37 |
| 25-1054.00 | Physics Teachers, Postsecondary | 60 | 93 | +33 | onet 54, ilo 65 |
| 27-1026.00 | Merchandise Displayers and Window Trimmers | 28 | 61 | +33 | onet 0, ilo 66 |
| 51-2023.00 | Electromechanical Equipment Assemblers | 7 | 40 | +33 | onet 0, ilo 43 |
| 29-9093.00 | Surgical Assistants | 17 | 49 | +32 | onet 0, ilo 50 |
| 41-2011.00 | Cashiers | 44 | 74 | +30 | onet 12, ilo 69 |
| 51-2011.00 | Aircraft Structure, Surfaces, Rigging, and Systems Assemblers | 19 | 48 | +29 | onet 7, ilo 43 |

## Largest decreases
| Code | Title | Current rank | Blend rank | Δ | Direct-source AI (pct) |
|---|---|---|---|---|---|
| 55-3015.00 | Command and Control Center Specialists | 79 | 6 | -72 | onet 5 |
| 19-2099.00 | Physical Scientists, All Other | 70 | 6 | -64 | onet 5 |
| 19-2099.01 | Remote Sensing Scientists and Technologists | 67 | 6 | -60 | onet 5 |
| 55-1015.00 | Command and Control Center Officers | 59 | 1 | -59 | onet 0 |
| 55-3012.00 | Aircraft Launch and Recovery Specialists | 56 | 4 | -51 | onet 4 |
| 55-1012.00 | Aircraft Launch and Recovery Officers | 56 | 4 | -51 | onet 4 |
| 53-2022.00 | Airfield Operations Specialists | 56 | 4 | -51 | onet 4 |
| 27-2091.00 | Disc Jockeys, Except Radio | 84 | 34 | -50 | onet 0, ilo 37 |
| 21-2099.00 | Religious Workers, All Other | 75 | 30 | -46 | onet 19, ilo 13 |
| 51-9162.00 | Computer Numerically Controlled Tool Programmers | 91 | 46 | -46 | onet 18, ilo 31 |
| 43-5031.00 | Public Safety Telecommunicators | 79 | 33 | -45 | onet 5, ilo 31 |
| 55-3011.00 | Air Crew Members | 43 | 1 | -42 | onet 0 |
| 55-1011.00 | Air Crew Officers | 43 | 1 | -42 | onet 0 |
| 55-2013.00 | First-Line Supervisors of All Other Tactical Operations Specialists | 41 | 1 | -40 | onet 0 |
| 55-2012.00 | First-Line Supervisors of Weapons Specialists/Crew Members | 41 | 1 | -40 | onet 0 |
| 55-1019.00 | Military Officer Special and Tactical Operations Leaders, All Other | 41 | 1 | -40 | onet 0 |
| 55-1017.00 | Special Forces Officers | 41 | 1 | -40 | onet 0 |
| 55-1016.00 | Infantry Officers | 41 | 1 | -40 | onet 0 |
| 55-1014.00 | Artillery and Missile Officers | 41 | 1 | -40 | onet 0 |
| 55-1013.00 | Armored Assault Vehicle Officers | 41 | 1 | -40 | onet 0 |
| 29-9092.00 | Genetic Counselors | 79 | 39 | -40 | onet 11, ilo 30 |
| 55-2011.00 | First-Line Supervisors of Air Crew Members | 40 | 1 | -40 | onet 0 |
| 41-2021.00 | Counter and Rental Clerks | 73 | 34 | -39 | onet 18 |
| 51-6099.00 | Textile, Apparel, and Furnishings Workers, All Other | 53 | 15 | -39 | onet 0, ilo 21 |
| 53-6099.00 | Transportation Workers, All Other | 51 | 14 | -38 | onet 0, ilo 19 |

## Full table
| Code | Title | Current rank | Blend rank | Δ | Direct-source AI (pct) |
|---|---|---|---|---|---|
| 11-1011.00 | Chief Executives | 71 | 71 | -0 | onet 8, ilo 68 |
| 11-1011.03 | Chief Sustainability Officers | 81 | 57 | -25 | onet 0, ilo 60 |
| 11-1021.00 | General and Operations Managers | 70 | 75 | +5 | onet 15, ilo 68 |
| 11-1031.00 | Legislators | 50 | 54 | +4 | onet 0, ilo 56 |
| 11-2011.00 | Advertising and Promotions Managers | 82 | 81 | -1 | onet 24, ilo 71 |
| 11-2021.00 | Marketing Managers | 89 | 92 | +3 | onet 43, ilo 74 |
| 11-2022.00 | Sales Managers | 69 | 74 | +4 | onet 5, ilo 74 |
| 11-2032.00 | Public Relations Managers | 89 | 83 | -6 | onet 26, ilo 71 |
| 11-2033.00 | Fundraising Managers | 89 | 75 | -14 | onet 11, ilo 72 |
| 11-3012.00 | Administrative Services Managers | 49 | 70 | +21 | onet 0, ilo 74 |
| 11-3013.00 | Facilities Managers | 59 | 70 | +11 | onet 0, ilo 74 |
| 11-3013.01 | Security Managers | 75 | 81 | +6 | onet 20, ilo 74 |
| 11-3021.00 | Computer and Information Systems Managers | 82 | 83 | +1 | onet 19, ilo 78 |
| 11-3031.00 | Financial Managers | 92 | 83 | -9 | onet 28, ilo 69 |
| 11-3031.01 | Treasurers and Controllers | 91 | 81 | -9 | onet 26, ilo 69 |
| 11-3031.03 | Investment Fund Managers | 94 | 98 | +5 | onet 68, ilo 77 |
| 11-3051.00 | Industrial Production Managers | 60 | 62 | +2 | onet 0, ilo 67 |
| 11-3051.01 | Quality Control Systems Managers | 62 | 63 | +1 | onet 1, ilo 67 |
| 11-3051.02 | Geothermal Production Managers | 60 | 62 | +2 | onet 0, ilo 67 |
| 11-3051.03 | Biofuels Production Managers | 48 | 62 | +14 | onet 0, ilo 67 |
| 11-3051.04 | Biomass Power Plant Managers | 51 | 69 | +18 | onet 6, ilo 67 |
| 11-3051.06 | Hydroelectric Production Managers | 51 | 62 | +11 | onet 0, ilo 67 |
| 11-3061.00 | Purchasing Managers | 93 | 82 | -11 | onet 22, ilo 74 |
| 11-3071.00 | Transportation, Storage, and Distribution Managers | 71 | 79 | +8 | onet 19, ilo 70 |
| 11-3071.04 | Supply Chain Managers | 72 | 65 | -7 | onet 0, ilo 70 |
| 11-3111.00 | Compensation and Benefits Managers | 73 | 60 | -13 | onet 0, ilo 65 |
| 11-3121.00 | Human Resources Managers | 69 | 60 | -9 | onet 0, ilo 65 |
| 11-3131.00 | Training and Development Managers | 89 | 91 | +2 | onet 49, ilo 65 |
| 11-9013.00 | Farmers, Ranchers, and Other Agricultural Managers | 45 | 33 | -12 | onet 0, ilo 36 |
| 11-9021.00 | Construction Managers | 70 | 70 | -1 | onet 13, ilo 62 |
| 11-9031.00 | Education and Childcare Administrators, Preschool and Daycare | 64 | 56 | -7 | onet 9, ilo 51 |
| 11-9032.00 | Education Administrators, Kindergarten through Secondary | 64 | 64 | -1 | onet 4, ilo 65 |
| 11-9033.00 | Education Administrators, Postsecondary | 78 | 68 | -10 | onet 8, ilo 65 |
| 11-9039.00 | Education Administrators, All Other | 56 | 68 | +12 | onet 8, ilo 65 |
| 11-9041.00 | Architectural and Engineering Managers | 63 | 72 | +9 | onet 5, ilo 72 |
| 11-9041.01 | Biofuels/Biodiesel Technology and Product Development Managers | 59 | 67 | +8 | onet 0, ilo 72 |
| 11-9051.00 | Food Service Managers | 48 | 64 | +16 | onet 5, ilo 64 |
| 11-9071.00 | Gambling Managers | 69 | 59 | -10 | onet 6, ilo 57 |
| 11-9072.00 | Entertainment and Recreation Managers, Except Gambling | 42 | 55 | +13 | onet 0, ilo 57 |
| 11-9081.00 | Lodging Managers | 65 | 72 | +8 | onet 13, ilo 66 |
| 11-9111.00 | Medical and Health Services Managers | 70 | 66 | -5 | onet 6, ilo 64 |
| 11-9121.00 | Natural Sciences Managers | 85 | 78 | -6 | onet 17, ilo 72 |
| 11-9121.01 | Clinical Research Coordinators | 82 | 70 | -12 | onet 3, ilo 72 |
| 11-9121.02 | Water Resource Specialists | 81 | 67 | -13 | onet 0, ilo 72 |
| 11-9131.00 | Postmasters and Mail Superintendents | 65 | 75 | +10 | onet 8, ilo 74 |
| 11-9141.00 | Property, Real Estate, and Community Association Managers | 76 | 74 | -2 | onet 17, ilo 64 |
| 11-9151.00 | Social and Community Service Managers | 72 | 78 | +6 | onet 21, ilo 67 |
| 11-9161.00 | Emergency Management Directors | 59 | 63 | +3 | onet 0, ilo 68 |
| 11-9171.00 | Funeral Home Managers | 54 | 73 | +19 | onet 4, ilo 74 |
| 11-9179.00 | Personal Service Managers, All Other | 80 | 78 | -3 | onet 21, ilo 67 |
| 11-9179.01 | Fitness and Wellness Coordinators | 62 | 60 | -3 | onet 7, ilo 57 |
| 11-9179.02 | Spa Managers | 81 | 79 | -2 | onet 35, ilo 57 |
| 11-9199.00 | Managers, All Other | 71 | 71 | -0 | onet 7, ilo 69 |
| 11-9199.01 | Regulatory Affairs Managers | 78 | 80 | +1 | onet 25, ilo 67 |
| 11-9199.02 | Compliance Managers | 75 | 72 | -3 | onet 10, ilo 67 |
| 11-9199.08 | Loss Prevention Managers | 66 | 67 | +1 | onet 5, ilo 67 |
| 11-9199.09 | Wind Energy Operations Managers | 66 | 62 | -4 | onet 0, ilo 67 |
| 11-9199.10 | Wind Energy Development Managers | 76 | 66 | -10 | onet 4, ilo 67 |
| 11-9199.11 | Brownfield Redevelopment Specialists and Site Managers | 68 | 62 | -6 | onet 0, ilo 67 |
| 13-1011.00 | Agents and Business Managers of Artists, Performers, and Athletes | 82 | 84 | +2 | onet 22, ilo 76 |
| 13-1021.00 | Buyers and Purchasing Agents, Farm Products | 75 | 65 | -10 | onet 0, ilo 71 |
| 13-1022.00 | Wholesale and Retail Buyers, Except Farm Products | 65 | 65 | +1 | onet 0, ilo 71 |
| 13-1023.00 | Purchasing Agents, Except Wholesale, Retail, and Farm Products | 86 | 75 | -11 | onet 13, ilo 71 |
| 13-1031.00 | Claims Adjusters, Examiners, and Investigators | 81 | 75 | -6 | onet 10, ilo 73 |
| 13-1032.00 | Insurance Appraisers, Auto Damage | 62 | 69 | +6 | onet 0, ilo 73 |
| 13-1041.00 | Compliance Officers | 82 | 95 | +13 | onet 50, ilo 77 |
| 13-1041.01 | Environmental Compliance Inspectors | 67 | 62 | -5 | onet 0, ilo 67 |
| 13-1041.03 | Equal Opportunity Representatives and Officers | 80 | 75 | -5 | onet 14, ilo 67 |
| 13-1041.04 | Government Property Inspectors and Investigators | 66 | 76 | +10 | onet 18, ilo 67 |
| 13-1041.06 | Coroners | 61 | 67 | +6 | onet 5, ilo 67 |
| 13-1041.07 | Regulatory Affairs Specialists | 76 | 70 | -6 | onet 9, ilo 67 |
| 13-1041.08 | Customs Brokers | 81 | 82 | +2 | onet 29, ilo 67 |
| 13-1051.00 | Cost Estimators | 76 | 71 | -4 | onet 0, ilo 76 |
| 13-1071.00 | Human Resources Specialists | 97 | 94 | -3 | onet 42, ilo 80 |
| 13-1074.00 | Farm Labor Contractors | 29 | 64 | +35 | onet 0, ilo 70 |
| 13-1075.00 | Labor Relations Specialists | 78 | 74 | -4 | onet 0, ilo 80 |
| 13-1081.00 | Logisticians | 85 | 78 | -7 | onet 9, ilo 80 |
| 13-1081.01 | Logistics Engineers | 85 | 87 | +2 | onet 26, ilo 80 |
| 13-1081.02 | Logistics Analysts | 88 | 80 | -8 | onet 13, ilo 80 |
| 13-1082.00 | Project Management Specialists | 88 | 78 | -10 | onet 15, ilo 73 |
| 13-1111.00 | Management Analysts | 83 | 91 | +9 | onet 36, ilo 80 |
| 13-1121.00 | Meeting, Convention, and Event Planners | 67 | 80 | +14 | onet 14, ilo 80 |
| 13-1131.00 | Fundraisers | 77 | 75 | -2 | onet 8, ilo 76 |
| 13-1141.00 | Compensation, Benefits, and Job Analysis Specialists | 81 | 77 | -3 | onet 7, ilo 80 |
| 13-1151.00 | Training and Development Specialists | 89 | 89 | +1 | onet 34, ilo 78 |
| 13-1161.00 | Market Research Analysts and Marketing Specialists | 95 | 100 | +5 | onet 76, ilo 90 |
| 13-1161.01 | Search Marketing Strategists | 97 | 98 | +1 | onet 53, ilo 90 |
| 13-1199.00 | Business Operations Specialists, All Other | 82 | 80 | -2 | onet 17, ilo 76 |
| 13-1199.04 | Business Continuity Planners | 85 | 76 | -10 | onet 8, ilo 76 |
| 13-1199.05 | Sustainability Specialists | 86 | 73 | -13 | onet 4, ilo 76 |
| 13-1199.06 | Online Merchants | 87 | 89 | +2 | onet 33, ilo 76 |
| 13-1199.07 | Security Management Specialists | 82 | 83 | +1 | onet 21, ilo 76 |
| 13-2011.00 | Accountants and Auditors | 97 | 92 | -5 | onet 31, ilo 86 |
| 13-2022.00 | Appraisers of Personal and Business Property | 91 | 69 | -23 | onet 0, ilo 73 |
| 13-2023.00 | Appraisers and Assessors of Real Estate | 72 | 86 | +15 | onet 30, ilo 73 |
| 13-2031.00 | Budget Analysts | 86 | 83 | -3 | onet 10, ilo 86 |
| 13-2041.00 | Credit Analysts | 90 | 93 | +3 | onet 25, ilo 95 |
| 13-2051.00 | Financial and Investment Analysts | 89 | 99 | +10 | onet 61, ilo 94 |
| 13-2052.00 | Personal Financial Advisors | 92 | 96 | +3 | onet 37, ilo 91 |
| 13-2053.00 | Insurance Underwriters | 85 | 80 | -5 | onet 5, ilo 87 |
| 13-2054.00 | Financial Risk Specialists | 89 | 95 | +6 | onet 29, ilo 95 |
| 13-2061.00 | Financial Examiners | 83 | 84 | +1 | onet 5, ilo 95 |
| 13-2071.00 | Credit Counselors | 95 | 93 | -2 | onet 25, ilo 95 |
| 13-2072.00 | Loan Officers | 93 | 91 | -1 | onet 20, ilo 95 |
| 13-2081.00 | Tax Examiners and Collectors, and Revenue Agents | 84 | 78 | -6 | onet 5, ilo 83 |
| 13-2082.00 | Tax Preparers | 88 | 86 | -2 | onet 17, ilo 86 |
| 13-2099.00 | Financial Specialists, All Other | 93 | 88 | -5 | onet 32, ilo 76 |
| 13-2099.01 | Financial Quantitative Analysts | 96 | 95 | -0 | onet 51, ilo 76 |
| 13-2099.04 | Fraud Examiners, Investigators and Analysts | 85 | 79 | -7 | onet 14, ilo 76 |
| 15-1211.00 | Computer Systems Analysts | 97 | 94 | -3 | onet 38, ilo 85 |
| 15-1211.01 | Health Informatics Specialists | 83 | 87 | +4 | onet 19, ilo 85 |
| 15-1212.00 | Information Security Analysts | 99 | 97 | -2 | onet 52, ilo 84 |
| 15-1221.00 | Computer and Information Research Scientists | 97 | 95 | -1 | onet 42, ilo 85 |
| 15-1231.00 | Computer Network Support Specialists | 94 | 88 | -6 | onet 32, ilo 76 |
| 15-1232.00 | Computer User Support Specialists | 98 | 96 | -1 | onet 55, ilo 75 |
| 15-1241.00 | Computer Network Architects | 92 | 89 | -3 | onet 23, ilo 87 |
| 15-1241.01 | Telecommunications Engineering Specialists | 91 | 88 | -3 | onet 20, ilo 87 |
| 15-1242.00 | Database Administrators | 99 | 97 | -1 | onet 49, ilo 91 |
| 15-1243.00 | Database Architects | 100 | 99 | -1 | onet 59, ilo 91 |
| 15-1243.01 | Data Warehousing Specialists | 100 | 100 | +0 | onet 76, ilo 91 |
| 15-1244.00 | Network and Computer Systems Administrators | 98 | 95 | -3 | onet 35, ilo 92 |
| 15-1251.00 | Computer Programmers | 100 | 100 | -0 | onet 70, ilo 92 |
| 15-1252.00 | Software Developers | 98 | 95 | -2 | onet 39, ilo 88 |
| 15-1253.00 | Software Quality Assurance Analysts and Testers | 100 | 96 | -4 | onet 42, ilo 87 |
| 15-1254.00 | Web Developers | 100 | 99 | -1 | onet 59, ilo 90 |
| 15-1255.00 | Web and Digital Interface Designers | 97 | 96 | -1 | onet 36, ilo 94 |
| 15-1255.01 | Video Game Designers | 95 | 82 | -13 | onet 8, ilo 87 |
| 15-1299.00 | Computer Occupations, All Other | 96 | 84 | -12 | onet 19, ilo 81 |
| 15-1299.01 | Web Administrators | 98 | 89 | -9 | onet 31, ilo 81 |
| 15-1299.02 | Geographic Information Systems Technologists and Technicians | 94 | 89 | -6 | onet 28, ilo 81 |
| 15-1299.03 | Document Management Specialists | 95 | 92 | -3 | onet 37, ilo 81 |
| 15-1299.04 | Penetration Testers | 98 | 76 | -22 | onet 0, ilo 84 |
| 15-1299.05 | Information Security Engineers | 97 | 77 | -20 | onet 3, ilo 84 |
| 15-1299.06 | Digital Forensics Analysts | 97 | 76 | -22 | onet 0, ilo 84 |
| 15-1299.07 | Blockchain Engineers | 99 | 74 | -24 | onet 0, ilo 81 |
| 15-1299.08 | Computer Systems Engineers/Architects | 98 | 92 | -5 | onet 37, ilo 81 |
| 15-1299.09 | Information Technology Project Managers | 93 | 91 | -2 | onet 34, ilo 81 |
| 15-2011.00 | Actuaries | 84 | 85 | +0 | onet 10, ilo 90 |
| 15-2021.00 | Mathematicians | 99 | 95 | -5 | onet 35, ilo 90 |
| 15-2031.00 | Operations Research Analysts | 98 | 96 | -2 | onet 39, ilo 90 |
| 15-2041.00 | Statisticians | 96 | 94 | -2 | onet 31, ilo 90 |
| 15-2041.01 | Biostatisticians | 95 | 88 | -7 | onet 17, ilo 90 |
| 15-2051.00 | Data Scientists | 99 | 83 | -16 | onet 7, ilo 91 |
| 15-2051.01 | Business Intelligence Analysts | 99 | 100 | +1 | onet 73, ilo 91 |
| 15-2051.02 | Clinical Data Managers | 98 | 92 | -6 | onet 28, ilo 91 |
| 15-2099.00 | Mathematical Science Occupations, All Other | 99 | 97 | -3 | onet 44, ilo 91 |
| 15-2099.01 | Bioinformatics Technicians | 99 | 97 | -3 | onet 44, ilo 91 |
| 17-1011.00 | Architects, Except Landscape and Naval | 74 | 71 | -3 | onet 9, ilo 67 |
| 17-1012.00 | Landscape Architects | 60 | 63 | +3 | onet 0, ilo 68 |
| 17-1021.00 | Cartographers and Photogrammetrists | 74 | 78 | +4 | onet 12, ilo 76 |
| 17-1022.00 | Surveyors | 57 | 71 | +14 | onet 0, ilo 76 |
| 17-1022.01 | Geodetic Surveyors | 61 | 71 | +10 | onet 0, ilo 76 |
| 17-2011.00 | Aerospace Engineers | 87 | 65 | -22 | onet 12, ilo 58 |
| 17-2021.00 | Agricultural Engineers | 59 | 56 | -3 | onet 0, ilo 58 |
| 17-2031.00 | Bioengineers and Biomedical Engineers | 84 | 67 | -17 | onet 17, ilo 54 |
| 17-2041.00 | Chemical Engineers | 68 | 57 | -11 | onet 0, ilo 62 |
| 17-2051.00 | Civil Engineers | 65 | 52 | -13 | onet 0, ilo 54 |
| 17-2051.01 | Transportation Engineers | 72 | 54 | -18 | onet 1, ilo 54 |
| 17-2051.02 | Water/Wastewater Engineers | 72 | 52 | -19 | onet 0, ilo 54 |
| 17-2061.00 | Computer Hardware Engineers | 88 | 77 | -11 | onet 13, ilo 72 |
| 17-2071.00 | Electrical Engineers | 80 | 60 | -20 | onet 8, ilo 56 |
| 17-2072.00 | Electronics Engineers, Except Computer | 77 | 86 | +8 | onet 30, ilo 72 |
| 17-2072.01 | Radio Frequency Identification Device Specialists | 80 | 71 | -9 | onet 0, ilo 76 |
| 17-2081.00 | Environmental Engineers | 82 | 68 | -14 | onet 3, ilo 69 |
| 17-2111.00 | Health and Safety Engineers, Except Mining Safety Engineers and Inspectors | 62 | 53 | -9 | onet 0, ilo 54 |
| 17-2111.02 | Fire-Prevention and Protection Engineers | 69 | 53 | -16 | onet 0, ilo 54 |
| 17-2112.00 | Industrial Engineers | 74 | 61 | -13 | onet 0, ilo 67 |
| 17-2112.01 | Human Factors Engineers and Ergonomists | 72 | 65 | -7 | onet 4, ilo 67 |
| 17-2112.02 | Validation Engineers | 81 | 64 | -17 | onet 2, ilo 67 |
| 17-2112.03 | Manufacturing Engineers | 68 | 68 | +0 | onet 6, ilo 67 |
| 17-2121.00 | Marine Engineers and Naval Architects | 57 | 61 | +4 | onet 8, ilo 58 |
| 17-2131.00 | Materials Engineers | 65 | 52 | -12 | onet 0, ilo 54 |
| 17-2141.00 | Mechanical Engineers | 68 | 67 | -1 | onet 14, ilo 58 |
| 17-2141.01 | Fuel Cell Engineers | 71 | 56 | -16 | onet 0, ilo 58 |
| 17-2141.02 | Automotive Engineers | 83 | 68 | -15 | onet 14, ilo 58 |
| 17-2151.00 | Mining and Geological Engineers, Including Mining Safety Engineers | 71 | 51 | -20 | onet 0, ilo 53 |
| 17-2161.00 | Nuclear Engineers | 77 | 53 | -24 | onet 0, ilo 54 |
| 17-2171.00 | Petroleum Engineers | 73 | 55 | -17 | onet 5, ilo 53 |
| 17-2199.00 | Engineers, All Other | 67 | 59 | -9 | onet 9, ilo 54 |
| 17-2199.03 | Energy Engineers, Except Wind and Solar | 75 | 57 | -19 | onet 6, ilo 54 |
| 17-2199.05 | Mechatronics Engineers | 73 | 53 | -20 | onet 0, ilo 54 |
| 17-2199.06 | Microsystems Engineers | 71 | 59 | -12 | onet 10, ilo 54 |
| 17-2199.07 | Photonics Engineers | 67 | 60 | -7 | onet 11, ilo 54 |
| 17-2199.08 | Robotics Engineers | 77 | 73 | -4 | onet 25, ilo 54 |
| 17-2199.09 | Nanosystems Engineers | 77 | 71 | -6 | onet 22, ilo 54 |
| 17-2199.10 | Wind Energy Engineers | 66 | 53 | -13 | onet 0, ilo 54 |
| 17-2199.11 | Solar Energy Systems Engineers | 65 | 53 | -13 | onet 0, ilo 54 |
| 17-3011.00 | Architectural and Civil Drafters | 68 | 58 | -10 | onet 0, ilo 62 |
| 17-3012.00 | Electrical and Electronics Drafters | 79 | 67 | -12 | onet 10, ilo 62 |
| 17-3013.00 | Mechanical Drafters | 64 | 58 | -6 | onet 0, ilo 62 |
| 17-3019.00 | Drafters, All Other | 64 | 58 | -6 | onet 0, ilo 62 |
| 17-3021.00 | Aerospace Engineering and Operations Technologists and Technicians | 48 | 43 | -5 | onet 0, ilo 46 |
| 17-3022.00 | Civil Engineering Technologists and Technicians | 80 | 56 | -23 | onet 11, ilo 49 |
| 17-3023.00 | Electrical and Electronic Engineering Technologists and Technicians | 54 | 61 | +7 | onet 4, ilo 63 |
| 17-3024.00 | Electro-Mechanical and Mechatronics Technologists and Technicians | 41 | 43 | +2 | onet 0, ilo 46 |
| 17-3024.01 | Robotics Technicians | 46 | 43 | -3 | onet 0, ilo 46 |
| 17-3025.00 | Environmental Engineering Technologists and Technicians | 58 | 52 | -7 | onet 8, ilo 45 |
| 17-3026.00 | Industrial Engineering Technologists and Technicians | 57 | 42 | -15 | onet 0, ilo 45 |
| 17-3026.01 | Nanotechnology Engineering Technologists and Technicians | 54 | 42 | -12 | onet 0, ilo 45 |
| 17-3027.00 | Mechanical Engineering Technologists and Technicians | 60 | 54 | -6 | onet 10, ilo 46 |
| 17-3027.01 | Automotive Engineering Technicians | 48 | 57 | +9 | onet 16, ilo 46 |
| 17-3028.00 | Calibration Technologists and Technicians | 51 | 46 | -5 | onet 0, ilo 49 |
| 17-3029.00 | Engineering Technologists and Technicians, Except Drafters, All Other | 51 | 42 | -9 | onet 0, ilo 45 |
| 17-3029.01 | Non-Destructive Testing Specialists | 46 | 46 | +1 | onet 0, ilo 49 |
| 17-3029.08 | Photonics Technicians | 41 | 42 | +1 | onet 0, ilo 45 |
| 17-3031.00 | Surveying and Mapping Technicians | 58 | 46 | -12 | onet 0, ilo 49 |
| 19-1011.00 | Animal Scientists | 69 | 65 | -5 | onet 0, ilo 70 |
| 19-1012.00 | Food Scientists and Technologists | 54 | 65 | +11 | onet 0, ilo 70 |
| 19-1013.00 | Soil and Plant Scientists | 65 | 60 | -5 | onet 16, ilo 49 |
| 19-1021.00 | Biochemists and Biophysicists | 67 | 73 | +6 | onet 9, ilo 70 |
| 19-1022.00 | Microbiologists | 62 | 72 | +10 | onet 8, ilo 70 |
| 19-1023.00 | Zoologists and Wildlife Biologists | 61 | 70 | +9 | onet 4, ilo 70 |
| 19-1029.00 | Biological Scientists, All Other | 84 | 81 | -3 | onet 24, ilo 70 |
| 19-1029.01 | Bioinformatics Scientists | 89 | 90 | +1 | onet 43, ilo 70 |
| 19-1029.02 | Molecular and Cellular Biologists | 80 | 69 | -10 | onet 4, ilo 70 |
| 19-1029.03 | Geneticists | 82 | 90 | +7 | onet 43, ilo 70 |
| 19-1029.04 | Biologists | 79 | 70 | -9 | onet 6, ilo 70 |
| 19-1031.00 | Conservation Scientists | 52 | 66 | +15 | onet 0, ilo 71 |
| 19-1031.02 | Range Managers | 47 | 66 | +19 | onet 0, ilo 71 |
| 19-1031.03 | Park Naturalists | 59 | 66 | +8 | onet 0, ilo 71 |
| 19-1032.00 | Foresters | 45 | 47 | +2 | onet 0, ilo 49 |
| 19-1041.00 | Epidemiologists | 70 | 69 | -1 | onet 4, ilo 70 |
| 19-1042.00 | Medical Scientists, Except Epidemiologists | 77 | 68 | -9 | onet 3, ilo 70 |
| 19-1099.00 | Life Scientists, All Other | 69 | 65 | -5 | onet 0, ilo 70 |
| 19-2011.00 | Astronomers | 86 | 85 | -1 | onet 36, ilo 66 |
| 19-2012.00 | Physicists | 97 | 79 | -18 | onet 25, ilo 66 |
| 19-2021.00 | Atmospheric and Space Scientists | 84 | 81 | -3 | onet 8, ilo 87 |
| 19-2031.00 | Chemists | 65 | 81 | +16 | onet 25, ilo 69 |
| 19-2032.00 | Materials Scientists | 78 | 74 | -4 | onet 19, ilo 61 |
| 19-2041.00 | Environmental Scientists and Specialists, Including Health | 72 | 82 | +10 | onet 25, ilo 71 |
| 19-2041.01 | Climate Change Policy Analysts | 76 | 66 | -9 | onet 0, ilo 71 |
| 19-2041.02 | Environmental Restoration Planners | 74 | 66 | -8 | onet 0, ilo 71 |
| 19-2041.03 | Industrial Ecologists | 75 | 68 | -7 | onet 1, ilo 71 |
| 19-2042.00 | Geoscientists, Except Hydrologists and Geographers | 63 | 63 | +0 | onet 4, ilo 65 |
| 19-2043.00 | Hydrologists | 70 | 60 | -10 | onet 0, ilo 65 |
| 19-2099.00 | Physical Scientists, All Other | 70 | 6 | -64 | onet 5 |
| 19-2099.01 | Remote Sensing Scientists and Technologists | 67 | 6 | -60 | onet 5 |
| 19-3011.00 | Economists | 91 | 97 | +6 | onet 47, ilo 90 |
| 19-3011.01 | Environmental Economists | 95 | 89 | -6 | onet 21, ilo 90 |
| 19-3022.00 | Survey Researchers | 98 | 96 | -2 | onet 41, ilo 90 |
| 19-3032.00 | Industrial-Organizational Psychologists | 86 | 79 | -7 | onet 22, ilo 68 |
| 19-3033.00 | Clinical and Counseling Psychologists | 56 | 67 | +11 | onet 4, ilo 68 |
| 19-3034.00 | School Psychologists | 56 | 68 | +12 | onet 5, ilo 68 |
| 19-3039.00 | Psychologists, All Other | 76 | 72 | -3 | onet 10, ilo 68 |
| 19-3039.02 | Neuropsychologists | 70 | 73 | +2 | onet 11, ilo 68 |
| 19-3039.03 | Clinical Neuropsychologists | 69 | 73 | +4 | onet 12, ilo 68 |
| 19-3041.00 | Sociologists | 96 | 96 | -0 | onet 47, ilo 81 |
| 19-3051.00 | Urban and Regional Planners | 76 | 72 | -5 | onet 2, ilo 74 |
| 19-3091.00 | Anthropologists and Archeologists | 66 | 86 | +19 | onet 22, ilo 81 |
| 19-3092.00 | Geographers | 87 | 82 | -5 | onet 15, ilo 81 |
| 19-3093.00 | Historians | 66 | 76 | +10 | onet 3, ilo 82 |
| 19-3094.00 | Political Scientists | 92 | 94 | +2 | onet 39, ilo 82 |
| 19-3099.00 | Social Scientists and Related Workers, All Other | 77 | 81 | +5 | onet 3, ilo 92 |
| 19-3099.01 | Transportation Planners | 79 | 78 | -0 | onet 3, ilo 87 |
| 19-4012.00 | Agricultural Technicians | 43 | 44 | +1 | onet 1, ilo 46 |
| 19-4012.01 | Precision Agriculture Technicians | 63 | 43 | -20 | onet 0, ilo 46 |
| 19-4013.00 | Food Science Technicians | 64 | 59 | -5 | onet 19, ilo 46 |
| 19-4021.00 | Biological Technicians | 58 | 64 | +6 | onet 6, ilo 63 |
| 19-4031.00 | Chemical Technicians | 63 | 75 | +11 | onet 37, ilo 45 |
| 19-4042.00 | Environmental Science and Protection Technicians, Including Health | 71 | 74 | +4 | onet 18, ilo 63 |
| 19-4043.00 | Geological Technicians, Except Hydrologic Technicians | 67 | 65 | -3 | onet 22, ilo 48 |
| 19-4044.00 | Hydrologic Technicians | 78 | 45 | -33 | onet 0, ilo 47 |
| 19-4051.00 | Nuclear Technicians | 36 | 42 | +6 | onet 0, ilo 45 |
| 19-4051.02 | Nuclear Monitoring Technicians | 40 | 42 | +2 | onet 0, ilo 45 |
| 19-4061.00 | Social Science Research Assistants | 95 | 97 | +2 | onet 47, ilo 91 |
| 19-4071.00 | Forest and Conservation Technicians | 47 | 36 | -10 | onet 5, ilo 34 |
| 19-4092.00 | Forensic Science Technicians | 51 | 42 | -9 | onet 0, ilo 45 |
| 19-4099.00 | Life, Physical, and Social Science Technicians, All Other | 65 | 53 | -13 | onet 9, ilo 45 |
| 19-4099.01 | Quality Control Analysts | 70 | 51 | -20 | onet 6, ilo 45 |
| 19-4099.03 | Remote Sensing Technicians | 73 | 55 | -18 | onet 13, ilo 45 |
| 19-5011.00 | Occupational Health and Safety Specialists | 45 | 48 | +3 | onet 0, ilo 50 |
| 19-5012.00 | Occupational Health and Safety Technicians | 50 | 38 | -11 | onet 0, ilo 41 |
| 21-1011.00 | Substance Abuse and Behavioral Disorder Counselors | 49 | 51 | +2 | onet 2, ilo 49 |
| 21-1012.00 | Educational, Guidance, and Career Counselors and Advisors | 62 | 79 | +17 | onet 27, ilo 64 |
| 21-1013.00 | Marriage and Family Therapists | 53 | 47 | -6 | onet 0, ilo 49 |
| 21-1014.00 | Mental Health Counselors | 62 | 52 | -10 | onet 4, ilo 49 |
| 21-1015.00 | Rehabilitation Counselors | 51 | 47 | -4 | onet 0, ilo 49 |
| 21-1019.00 | Counselors, All Other | 62 | 71 | +9 | onet 27, ilo 49 |
| 21-1021.00 | Child, Family, and School Social Workers | 47 | 47 | -1 | onet 0, ilo 49 |
| 21-1022.00 | Healthcare Social Workers | 62 | 57 | -5 | onet 13, ilo 49 |
| 21-1023.00 | Mental Health and Substance Abuse Social Workers | 54 | 59 | +5 | onet 14, ilo 49 |
| 21-1029.00 | Social Workers, All Other | 47 | 47 | -1 | onet 0, ilo 49 |
| 21-1091.00 | Health Education Specialists | 77 | 59 | -18 | onet 14, ilo 50 |
| 21-1092.00 | Probation Officers and Correctional Treatment Specialists | 54 | 47 | -7 | onet 0, ilo 49 |
| 21-1093.00 | Social and Human Service Assistants | 53 | 55 | +2 | onet 0, ilo 57 |
| 21-1094.00 | Community Health Workers | 44 | 34 | -10 | onet 0, ilo 36 |
| 21-1099.00 | Community and Social Service Specialists, All Other | 44 | 47 | +3 | onet 0, ilo 49 |
| 21-2011.00 | Clergy | 68 | 40 | -28 | onet 17, ilo 25 |
| 21-2021.00 | Directors, Religious Activities and Education | 75 | 41 | -35 | onet 19, ilo 25 |
| 21-2099.00 | Religious Workers, All Other | 75 | 30 | -46 | onet 19, ilo 13 |
| 23-1011.00 | Lawyers | 78 | 76 | -3 | onet 19, ilo 65 |
| 23-1012.00 | Judicial Law Clerks | 89 | 81 | -8 | onet 26, ilo 69 |
| 23-1021.00 | Administrative Law Judges, Adjudicators, and Hearing Officers | 91 | 80 | -11 | onet 37, ilo 56 |
| 23-1022.00 | Arbitrators, Mediators, and Conciliators | 91 | 86 | -5 | onet 36, ilo 68 |
| 23-1023.00 | Judges, Magistrate Judges, and Magistrates | 85 | 77 | -9 | onet 30, ilo 56 |
| 23-2011.00 | Paralegals and Legal Assistants | 89 | 76 | -13 | onet 16, ilo 69 |
| 23-2093.00 | Title Examiners, Abstractors, and Searchers | 79 | 64 | -15 | onet 0, ilo 69 |
| 23-2099.00 | Legal Support Workers, All Other | 79 | 64 | -15 | onet 0, ilo 69 |
| 25-1011.00 | Business Teachers, Postsecondary | 88 | 87 | -1 | onet 40, ilo 65 |
| 25-1021.00 | Computer Science Teachers, Postsecondary | 86 | 86 | -1 | onet 38, ilo 65 |
| 25-1022.00 | Mathematical Science Teachers, Postsecondary | 94 | 92 | -2 | onet 52, ilo 65 |
| 25-1031.00 | Architecture Teachers, Postsecondary | 67 | 82 | +15 | onet 31, ilo 65 |
| 25-1032.00 | Engineering Teachers, Postsecondary | 92 | 91 | -1 | onet 49, ilo 65 |
| 25-1041.00 | Agricultural Sciences Teachers, Postsecondary | 63 | 88 | +24 | onet 43, ilo 65 |
| 25-1042.00 | Biological Science Teachers, Postsecondary | 83 | 86 | +3 | onet 39, ilo 65 |
| 25-1043.00 | Forestry and Conservation Science Teachers, Postsecondary | 69 | 86 | +17 | onet 39, ilo 65 |
| 25-1051.00 | Atmospheric, Earth, Marine, and Space Sciences Teachers, Postsecondary | 73 | 93 | +20 | onet 56, ilo 65 |
| 25-1052.00 | Chemistry Teachers, Postsecondary | 81 | 90 | +10 | onet 49, ilo 65 |
| 25-1053.00 | Environmental Science Teachers, Postsecondary | 78 | 88 | +9 | onet 43, ilo 65 |
| 25-1054.00 | Physics Teachers, Postsecondary | 60 | 93 | +33 | onet 54, ilo 65 |
| 25-1061.00 | Anthropology and Archeology Teachers, Postsecondary | 77 | 93 | +17 | onet 56, ilo 65 |
| 25-1062.00 | Area, Ethnic, and Cultural Studies Teachers, Postsecondary | 73 | 87 | +15 | onet 42, ilo 65 |
| 25-1063.00 | Economics Teachers, Postsecondary | 69 | 87 | +19 | onet 41, ilo 65 |
| 25-1064.00 | Geography Teachers, Postsecondary | 69 | 86 | +17 | onet 38, ilo 65 |
| 25-1065.00 | Political Science Teachers, Postsecondary | 71 | 88 | +17 | onet 43, ilo 65 |
| 25-1066.00 | Psychology Teachers, Postsecondary | 87 | 91 | +4 | onet 51, ilo 65 |
| 25-1067.00 | Sociology Teachers, Postsecondary | 66 | 87 | +21 | onet 42, ilo 65 |
| 25-1069.00 | Social Sciences Teachers, Postsecondary, All Other | 71 | 88 | +17 | onet 43, ilo 65 |
| 25-1071.00 | Health Specialties Teachers, Postsecondary | 79 | 85 | +6 | onet 37, ilo 65 |
| 25-1072.00 | Nursing Instructors and Teachers, Postsecondary | 64 | 79 | +15 | onet 26, ilo 65 |
| 25-1081.00 | Education Teachers, Postsecondary | 84 | 85 | +1 | onet 37, ilo 65 |
| 25-1082.00 | Library Science Teachers, Postsecondary | 78 | 88 | +10 | onet 44, ilo 65 |
| 25-1111.00 | Criminal Justice and Law Enforcement Teachers, Postsecondary | 76 | 84 | +8 | onet 36, ilo 65 |
| 25-1112.00 | Law Teachers, Postsecondary | 68 | 92 | +24 | onet 52, ilo 65 |
| 25-1113.00 | Social Work Teachers, Postsecondary | 65 | 86 | +21 | onet 38, ilo 65 |
| 25-1121.00 | Art, Drama, and Music Teachers, Postsecondary | 70 | 81 | +11 | onet 30, ilo 65 |
| 25-1122.00 | Communications Teachers, Postsecondary | 81 | 87 | +6 | onet 40, ilo 65 |
| 25-1123.00 | English Language and Literature Teachers, Postsecondary | 94 | 90 | -4 | onet 49, ilo 65 |
| 25-1124.00 | Foreign Language and Literature Teachers, Postsecondary | 90 | 91 | +0 | onet 50, ilo 65 |
| 25-1125.00 | History Teachers, Postsecondary | 87 | 85 | -1 | onet 37, ilo 65 |
| 25-1126.00 | Philosophy and Religion Teachers, Postsecondary | 88 | 90 | +2 | onet 48, ilo 65 |
| 25-1192.00 | Family and Consumer Sciences Teachers, Postsecondary | 74 | 84 | +11 | onet 35, ilo 65 |
| 25-1193.00 | Recreation and Fitness Studies Teachers, Postsecondary | 84 | 92 | +8 | onet 53, ilo 65 |
| 25-1194.00 | Career/Technical Education Teachers, Postsecondary | 67 | 75 | +8 | onet 21, ilo 61 |
| 25-1199.00 | Postsecondary Teachers, All Other | 74 | 84 | +11 | onet 35, ilo 65 |
| 25-2011.00 | Preschool Teachers, Except Special Education | 38 | 40 | +2 | onet 9, ilo 34 |
| 25-2012.00 | Kindergarten Teachers, Except Special Education | 42 | 42 | 0 | onet 11, ilo 34 |
| 25-2021.00 | Elementary School Teachers, Except Special Education | 61 | 58 | -3 | onet 18, ilo 45 |
| 25-2022.00 | Middle School Teachers, Except Special and Career/Technical Education | 76 | 83 | +7 | onet 51, ilo 45 |
| 25-2023.00 | Career/Technical Education Teachers, Middle School | 49 | 73 | +23 | onet 18, ilo 61 |
| 25-2031.00 | Secondary School Teachers, Except Special and Career/Technical Education | 72 | 84 | +12 | onet 46, ilo 53 |
| 25-2032.00 | Career/Technical Education Teachers, Secondary School | 49 | 73 | +24 | onet 18, ilo 61 |
| 25-2051.00 | Special Education Teachers, Preschool | 40 | 56 | +16 | onet 11, ilo 48 |
| 25-2055.00 | Special Education Teachers, Kindergarten | 25 | 62 | +37 | onet 19, ilo 48 |
| 25-2056.00 | Special Education Teachers, Elementary School | 35 | 59 | +24 | onet 16, ilo 48 |
| 25-2057.00 | Special Education Teachers, Middle School | 58 | 72 | +13 | onet 28, ilo 48 |
| 25-2058.00 | Special Education Teachers, Secondary School | 56 | 72 | +17 | onet 30, ilo 48 |
| 25-2059.00 | Special Education Teachers, All Other | 38 | 50 | +12 | onet 2, ilo 48 |
| 25-2059.01 | Adapted Physical Education Specialists | 48 | 50 | +2 | onet 2, ilo 48 |
| 25-3011.00 | Adult Basic Education, Adult Secondary Education, and English as a Second Language Instructors | 72 | 73 | +1 | onet 19, ilo 59 |
| 25-3021.00 | Self-Enrichment Teachers | 58 | 55 | -2 | onet 17, ilo 41 |
| 25-3031.00 | Substitute Teachers, Short-Term | 44 | 58 | +14 | onet 4, ilo 58 |
| 25-3041.00 | Tutors | 93 | 85 | -8 | onet 43, ilo 57 |
| 25-3099.00 | Teachers and Instructors, All Other | 93 | 74 | -19 | onet 19, ilo 62 |
| 25-4011.00 | Archivists | 74 | 80 | +6 | onet 13, ilo 80 |
| 25-4012.00 | Curators | 82 | 96 | +14 | onet 49, ilo 80 |
| 25-4013.00 | Museum Technicians and Conservators | 38 | 56 | +18 | onet 0, ilo 60 |
| 25-4022.00 | Librarians and Media Collections Specialists | 87 | 90 | +3 | onet 22, ilo 91 |
| 25-4031.00 | Library Technicians | 66 | 74 | +8 | onet 5, ilo 76 |
| 25-9021.00 | Farm and Home Management Educators | 55 | 47 | -8 | onet 0, ilo 49 |
| 25-9031.00 | Instructional Coordinators | 87 | 87 | -0 | onet 35, ilo 69 |
| 25-9042.00 | Teaching Assistants, Preschool, Elementary, Middle, and Secondary School, Except Special Education | 45 | 61 | +16 | onet 27, ilo 39 |
| 25-9043.00 | Teaching Assistants, Special Education | 27 | 52 | +24 | onet 14, ilo 39 |
| 25-9044.00 | Teaching Assistants, Postsecondary | 81 | 72 | -9 | onet 12, ilo 65 |
| 25-9049.00 | Teaching Assistants, All Other | 27 | 52 | +24 | onet 14, ilo 39 |
| 25-9099.00 | Educational Instruction and Library Workers, All Other | 87 | 80 | -7 | onet 35, ilo 57 |
| 27-1011.00 | Art Directors | 81 | 76 | -5 | onet 18, ilo 67 |
| 27-1012.00 | Craft Artists | 32 | 26 | -7 | onet 5, ilo 23 |
| 27-1013.00 | Fine Artists, Including Painters, Sculptors, and Illustrators | 60 | 72 | +12 | onet 44, ilo 34 |
| 27-1014.00 | Special Effects Artists and Animators | 83 | 94 | +11 | onet 37, ilo 84 |
| 27-1019.00 | Artists and Related Workers, All Other | 32 | 7 | -25 | onet 5 |
| 27-1021.00 | Commercial and Industrial Designers | 64 | 62 | -2 | onet 5, ilo 63 |
| 27-1022.00 | Fashion Designers | 59 | 61 | +2 | onet 4, ilo 63 |
| 27-1023.00 | Floral Designers | 33 | 12 | -21 | onet 0, ilo 18 |
| 27-1024.00 | Graphic Designers | 81 | 91 | +10 | onet 31, ilo 84 |
| 27-1025.00 | Interior Designers | 68 | 61 | -7 | onet 0, ilo 66 |
| 27-1026.00 | Merchandise Displayers and Window Trimmers | 28 | 61 | +33 | onet 0, ilo 66 |
| 27-1027.00 | Set and Exhibit Designers | 47 | 61 | +14 | onet 0, ilo 66 |
| 27-1029.00 | Designers, All Other | 33 | 58 | +25 | onet 0, ilo 63 |
| 27-2011.00 | Actors | 49 | 57 | +8 | onet 8, ilo 53 |
| 27-2012.00 | Producers and Directors | 69 | 77 | +8 | onet 20, ilo 67 |
| 27-2012.03 | Media Programming Directors | 72 | 64 | -8 | onet 2, ilo 67 |
| 27-2012.04 | Talent Directors | 75 | 67 | -8 | onet 6, ilo 67 |
| 27-2012.05 | Media Technical Directors/Managers | 66 | 62 | -4 | onet 0, ilo 67 |
| 27-2021.00 | Athletes and Sports Competitors | 1 | 34 | +33 | onet 0, ilo 37 |
| 27-2022.00 | Coaches and Scouts | 45 | 60 | +15 | onet 0, ilo 66 |
| 27-2023.00 | Umpires, Referees, and Other Sports Officials | 43 | 60 | +17 | onet 0, ilo 66 |
| 27-2031.00 | Dancers | 1 | 25 | +24 | onet 0, ilo 28 |
| 27-2032.00 | Choreographers | 28 | 31 | +3 | onet 5, ilo 28 |
| 27-2041.00 | Music Directors and Composers | 77 | 52 | -26 | onet 5, ilo 48 |
| 27-2042.00 | Musicians and Singers | 49 | 46 | -3 | onet 0, ilo 48 |
| 27-2091.00 | Disc Jockeys, Except Radio | 84 | 34 | -50 | onet 0, ilo 37 |
| 27-2099.00 | Entertainers and Performers, Sports and Related Workers, All Other | 84 | 47 | -36 | onet 0, ilo 49 |
| 27-3011.00 | Broadcast Announcers and Radio Disc Jockeys | 79 | 77 | -3 | onet 6, ilo 81 |
| 27-3023.00 | News Analysts, Reporters, and Journalists | 92 | 84 | -8 | onet 12, ilo 88 |
| 27-3031.00 | Public Relations Specialists | 95 | 95 | -0 | onet 50, ilo 76 |
| 27-3041.00 | Editors | 90 | 91 | +0 | onet 25, ilo 89 |
| 27-3042.00 | Technical Writers | 96 | 98 | +2 | onet 53, ilo 89 |
| 27-3043.00 | Writers and Authors | 90 | 93 | +3 | onet 30, ilo 90 |
| 27-3043.05 | Poets, Lyricists and Creative Writers | 91 | 91 | -0 | onet 25, ilo 89 |
| 27-3091.00 | Interpreters and Translators | 95 | 99 | +4 | onet 56, ilo 92 |
| 27-3092.00 | Court Reporters and Simultaneous Captioners | 99 | 93 | -6 | onet 33, ilo 86 |
| 27-3099.00 | Media and Communication Workers, All Other | 95 | 97 | +2 | onet 56, ilo 81 |
| 27-4011.00 | Audio and Video Technicians | 52 | 59 | +7 | onet 1, ilo 63 |
| 27-4012.00 | Broadcast Technicians | 61 | 59 | -2 | onet 1, ilo 63 |
| 27-4014.00 | Sound Engineering Technicians | 55 | 58 | +3 | onet 0, ilo 63 |
| 27-4015.00 | Lighting Technicians | 10 | 1 | -9 | onet 0 |
| 27-4021.00 | Photographers | 58 | 78 | +20 | onet 21, ilo 68 |
| 27-4031.00 | Camera Operators, Television, Video, and Film | 56 | 75 | +19 | onet 20, ilo 63 |
| 27-4032.00 | Film and Video Editors | 83 | 81 | -2 | onet 28, ilo 67 |
| 27-4099.00 | Media and Communication Equipment Workers, All Other | 83 | 79 | -4 | onet 28, ilo 63 |
| 29-1011.00 | Chiropractors | 50 | 33 | -18 | onet 5, ilo 30 |
| 29-1021.00 | Dentists, General | 40 | 18 | -22 | onet 6, ilo 19 |
| 29-1022.00 | Oral and Maxillofacial Surgeons | 24 | 13 | -11 | onet 0, ilo 19 |
| 29-1023.00 | Orthodontists | 45 | 19 | -27 | onet 7, ilo 19 |
| 29-1024.00 | Prosthodontists | 25 | 24 | -2 | onet 0, ilo 28 |
| 29-1029.00 | Dentists, All Other Specialists | 40 | 18 | -22 | onet 6, ilo 19 |
| 29-1031.00 | Dietitians and Nutritionists | 88 | 78 | -10 | onet 13, ilo 75 |
| 29-1041.00 | Optometrists | 48 | 38 | -10 | onet 0, ilo 40 |
| 29-1051.00 | Pharmacists | 63 | 66 | +3 | onet 12, ilo 59 |
| 29-1071.00 | Physician Assistants | 48 | 41 | -7 | onet 7, ilo 37 |
| 29-1071.01 | Anesthesiologist Assistants | 37 | 34 | -3 | onet 0, ilo 37 |
| 29-1081.00 | Podiatrists | 49 | 28 | -21 | onet 0, ilo 30 |
| 29-1122.00 | Occupational Therapists | 45 | 28 | -18 | onet 0, ilo 30 |
| 29-1122.01 | Low Vision Therapists, Orientation and Mobility Specialists, and Vision Rehabilitation Therapists | 43 | 33 | -10 | onet 5, ilo 30 |
| 29-1123.00 | Physical Therapists | 33 | 48 | +15 | onet 1, ilo 48 |
| 29-1124.00 | Radiation Therapists | 39 | 34 | -5 | onet 0, ilo 37 |
| 29-1125.00 | Recreational Therapists | 46 | 28 | -19 | onet 0, ilo 30 |
| 29-1126.00 | Respiratory Therapists | 34 | 49 | +15 | onet 0, ilo 50 |
| 29-1127.00 | Speech-Language Pathologists | 63 | 38 | -25 | onet 0, ilo 41 |
| 29-1128.00 | Exercise Physiologists | 39 | 46 | +6 | onet 0, ilo 48 |
| 29-1129.00 | Therapists, All Other | 61 | 30 | -31 | onet 2, ilo 30 |
| 29-1129.01 | Art Therapists | 48 | 31 | -17 | onet 3, ilo 30 |
| 29-1129.02 | Music Therapists | 59 | 31 | -28 | onet 3, ilo 30 |
| 29-1131.00 | Veterinarians | 50 | 17 | -33 | onet 7, ilo 17 |
| 29-1141.00 | Registered Nurses | 54 | 51 | -3 | onet 11, ilo 42 |
| 29-1141.01 | Acute Care Nurses | 53 | 41 | -12 | onet 1, ilo 42 |
| 29-1141.02 | Advanced Practice Psychiatric Nurses | 61 | 46 | -15 | onet 7, ilo 42 |
| 29-1141.03 | Critical Care Nurses | 55 | 51 | -4 | onet 10, ilo 42 |
| 29-1141.04 | Clinical Nurse Specialists | 60 | 44 | -16 | onet 5, ilo 42 |
| 29-1151.00 | Nurse Anesthetists | 39 | 39 | +1 | onet 0, ilo 42 |
| 29-1161.00 | Nurse Midwives | 55 | 54 | -2 | onet 6, ilo 50 |
| 29-1171.00 | Nurse Practitioners | 64 | 52 | -12 | onet 12, ilo 42 |
| 29-1181.00 | Audiologists | 57 | 38 | -20 | onet 0, ilo 41 |
| 29-1211.00 | Anesthesiologists | 37 | 44 | +6 | onet 0, ilo 47 |
| 29-1212.00 | Cardiologists | 40 | 65 | +25 | onet 23, ilo 47 |
| 29-1213.00 | Dermatologists | 49 | 56 | +8 | onet 13, ilo 47 |
| 29-1214.00 | Emergency Medicine Physicians | 59 | 54 | -5 | onet 9, ilo 47 |
| 29-1215.00 | Family Medicine Physicians | 54 | 74 | +19 | onet 30, ilo 50 |
| 29-1216.00 | General Internal Medicine Physicians | 66 | 70 | +4 | onet 25, ilo 50 |
| 29-1217.00 | Neurologists | 56 | 55 | -1 | onet 10, ilo 47 |
| 29-1218.00 | Obstetricians and Gynecologists | 60 | 69 | +9 | onet 27, ilo 47 |
| 29-1221.00 | Pediatricians, General | 59 | 65 | +6 | onet 20, ilo 50 |
| 29-1222.00 | Physicians, Pathologists | 74 | 69 | -5 | onet 27, ilo 47 |
| 29-1223.00 | Psychiatrists | 58 | 59 | +1 | onet 17, ilo 47 |
| 29-1224.00 | Radiologists | 80 | 84 | +4 | onet 53, ilo 47 |
| 29-1229.00 | Physicians, All Other | 57 | 55 | -2 | onet 7, ilo 50 |
| 29-1229.01 | Allergists and Immunologists | 58 | 76 | +18 | onet 38, ilo 47 |
| 29-1229.02 | Hospitalists | 74 | 48 | -26 | onet 0, ilo 50 |
| 29-1229.03 | Urologists | 51 | 58 | +7 | onet 16, ilo 47 |
| 29-1229.04 | Physical Medicine and Rehabilitation Physicians | 43 | 44 | +1 | onet 0, ilo 47 |
| 29-1229.05 | Preventive Medicine Physicians | 61 | 48 | -12 | onet 0, ilo 50 |
| 29-1229.06 | Sports Medicine Physicians | 53 | 44 | -9 | onet 0, ilo 47 |
| 29-1241.00 | Ophthalmologists, Except Pediatric | 53 | 53 | +1 | onet 8, ilo 47 |
| 29-1242.00 | Orthopedic Surgeons, Except Pediatric | 45 | 44 | -1 | onet 0, ilo 47 |
| 29-1243.00 | Pediatric Surgeons | 47 | 44 | -3 | onet 0, ilo 47 |
| 29-1249.00 | Surgeons, All Other | 53 | 53 | +1 | onet 8, ilo 47 |
| 29-1291.00 | Acupuncturists | 31 | 59 | +28 | onet 6, ilo 58 |
| 29-1292.00 | Dental Hygienists | 32 | 27 | -5 | onet 7, ilo 22 |
| 29-1299.00 | Healthcare Diagnosing or Treating Practitioners, All Other | 55 | 41 | -14 | onet 6, ilo 38 |
| 29-1299.01 | Naturopathic Physicians | 59 | 41 | -18 | onet 0, ilo 43 |
| 29-1299.02 | Orthoptists | 68 | 48 | -20 | onet 12, ilo 38 |
| 29-2011.00 | Medical and Clinical Laboratory Technologists | 38 | 66 | +29 | onet 20, ilo 51 |
| 29-2011.01 | Cytogenetic Technologists | 55 | 51 | -4 | onet 1, ilo 51 |
| 29-2011.02 | Cytotechnologists | 54 | 78 | +24 | onet 38, ilo 51 |
| 29-2011.04 | Histotechnologists | 42 | 52 | +10 | onet 3, ilo 51 |
| 29-2012.00 | Medical and Clinical Laboratory Technicians | 30 | 54 | +24 | onet 5, ilo 51 |
| 29-2012.01 | Histology Technicians | 22 | 50 | +28 | onet 0, ilo 51 |
| 29-2031.00 | Cardiovascular Technologists and Technicians | 45 | 57 | +12 | onet 11, ilo 50 |
| 29-2032.00 | Diagnostic Medical Sonographers | 39 | 34 | -5 | onet 0, ilo 37 |
| 29-2033.00 | Nuclear Medicine Technologists | 50 | 41 | -8 | onet 8, ilo 37 |
| 29-2034.00 | Radiologic Technologists and Technicians | 39 | 36 | -4 | onet 1, ilo 37 |
| 29-2035.00 | Magnetic Resonance Imaging Technologists | 47 | 41 | -6 | onet 8, ilo 37 |
| 29-2036.00 | Medical Dosimetrists | 60 | 49 | -11 | onet 0, ilo 50 |
| 29-2042.00 | Emergency Medical Technicians | 33 | 28 | -4 | onet 0, ilo 31 |
| 29-2043.00 | Paramedics | 29 | 28 | -1 | onet 0, ilo 31 |
| 29-2051.00 | Dietetic Technicians | 73 | 75 | +2 | onet 33, ilo 50 |
| 29-2052.00 | Pharmacy Technicians | 57 | 58 | +1 | onet 10, ilo 52 |
| 29-2053.00 | Psychiatric Technicians | 30 | 49 | +19 | onet 0, ilo 50 |
| 29-2055.00 | Surgical Technologists | 23 | 49 | +26 | onet 0, ilo 50 |
| 29-2056.00 | Veterinary Technologists and Technicians | 31 | 11 | -20 | onet 0, ilo 17 |
| 29-2057.00 | Ophthalmic Medical Technicians | 46 | 60 | +14 | onet 13, ilo 52 |
| 29-2061.00 | Licensed Practical and Licensed Vocational Nurses | 33 | 26 | -6 | onet 0, ilo 29 |
| 29-2072.00 | Medical Records Specialists | 98 | 98 | +0 | onet 60, ilo 86 |
| 29-2081.00 | Opticians, Dispensing | 44 | 38 | -5 | onet 0, ilo 41 |
| 29-2091.00 | Orthotists and Prosthetists | 42 | 24 | -18 | onet 0, ilo 28 |
| 29-2092.00 | Hearing Aid Specialists | 43 | 30 | -13 | onet 4, ilo 28 |
| 29-2099.00 | Health Technologists and Technicians, All Other | 50 | 56 | +6 | onet 10, ilo 50 |
| 29-2099.01 | Neurodiagnostic Technologists | 47 | 49 | +2 | onet 0, ilo 50 |
| 29-2099.05 | Ophthalmic Medical Technologists | 48 | 56 | +8 | onet 8, ilo 50 |
| 29-2099.08 | Patient Representatives | 60 | 66 | +6 | onet 21, ilo 50 |
| 29-9021.00 | Health Information Technologists and Medical Registrars | 96 | 94 | -2 | onet 37, ilo 86 |
| 29-9091.00 | Athletic Trainers | 44 | 50 | +6 | onet 10, ilo 41 |
| 29-9092.00 | Genetic Counselors | 79 | 39 | -40 | onet 11, ilo 30 |
| 29-9093.00 | Surgical Assistants | 17 | 49 | +32 | onet 0, ilo 50 |
| 29-9099.00 | Healthcare Practitioners and Technical Workers, All Other | 52 | 36 | -16 | onet 0, ilo 38 |
| 29-9099.01 | Midwives | 50 | 29 | -21 | onet 0, ilo 31 |
| 31-1121.00 | Home Health Aides | 0 | 35 | +34 | onet 0, ilo 37 |
| 31-1122.00 | Personal Care Aides | 20 | 36 | +16 | onet 1, ilo 37 |
| 31-1131.00 | Nursing Assistants | 24 | 11 | -13 | onet 0, ilo 16 |
| 31-1132.00 | Orderlies | 15 | 13 | -1 | onet 0, ilo 19 |
| 31-1133.00 | Psychiatric Aides | 26 | 11 | -15 | onet 0, ilo 16 |
| 31-2011.00 | Occupational Therapy Assistants | 37 | 49 | +12 | onet 0, ilo 50 |
| 31-2012.00 | Occupational Therapy Aides | 36 | 17 | -19 | onet 5, ilo 19 |
| 31-2021.00 | Physical Therapist Assistants | 28 | 19 | -9 | onet 0, ilo 25 |
| 31-2022.00 | Physical Therapist Aides | 23 | 15 | -8 | onet 3, ilo 19 |
| 31-9011.00 | Massage Therapists | 8 | 19 | +11 | onet 0, ilo 25 |
| 31-9091.00 | Dental Assistants | 34 | 15 | -19 | onet 0, ilo 22 |
| 31-9092.00 | Medical Assistants | 53 | 54 | +1 | onet 4, ilo 52 |
| 31-9093.00 | Medical Equipment Preparers | 22 | 13 | -9 | onet 0, ilo 19 |
| 31-9094.00 | Medical Transcriptionists | 96 | 99 | +3 | onet 66, ilo 87 |
| 31-9095.00 | Pharmacy Aides | 47 | 18 | -29 | onet 6, ilo 19 |
| 31-9096.00 | Veterinary Assistants and Laboratory Animal Caretakers | 28 | 14 | -14 | onet 3, ilo 18 |
| 31-9097.00 | Phlebotomists | 32 | 13 | -19 | onet 0, ilo 19 |
| 31-9099.00 | Healthcare Support Workers, All Other | 51 | 34 | -17 | onet 1, ilo 36 |
| 31-9099.01 | Speech-Language Pathology Assistants | 64 | 33 | -30 | onet 0, ilo 36 |
| 31-9099.02 | Endoscopy Technicians | 34 | 35 | +0 | onet 1, ilo 36 |
| 33-1011.00 | First-Line Supervisors of Correctional Officers | 38 | 31 | -7 | onet 18, ilo 15 |
| 33-1012.00 | First-Line Supervisors of Police and Detectives | 41 | 36 | -5 | onet 0, ilo 38 |
| 33-1021.00 | First-Line Supervisors of Firefighting and Prevention Workers | 40 | 51 | +10 | onet 10, ilo 41 |
| 33-1091.00 | First-Line Supervisors of Security Workers | 52 | 29 | -22 | onet 0, ilo 31 |
| 33-1099.00 | First-Line Supervisors of Protective Service Workers, All Other | 52 | 29 | -22 | onet 0, ilo 31 |
| 33-2011.00 | Firefighters | 13 | 22 | +8 | onet 0, ilo 26 |
| 33-2021.00 | Fire Inspectors and Investigators | 43 | 45 | +3 | onet 0, ilo 48 |
| 33-2022.00 | Forest Fire Inspectors and Prevention Specialists | 35 | 42 | +7 | onet 0, ilo 45 |
| 33-3011.00 | Bailiffs | 20 | 63 | +43 | onet 0, ilo 69 |
| 33-3012.00 | Correctional Officers and Jailers | 27 | 11 | -16 | onet 0, ilo 15 |
| 33-3021.00 | Detectives and Criminal Investigators | 50 | 45 | -5 | onet 9, ilo 38 |
| 33-3021.02 | Police Identification and Records Officers | 52 | 36 | -16 | onet 0, ilo 38 |
| 33-3021.06 | Intelligence Analysts | 64 | 45 | -19 | onet 9, ilo 38 |
| 33-3031.00 | Fish and Game Wardens | 36 | 28 | -8 | onet 0, ilo 31 |
| 33-3041.00 | Parking Enforcement Workers | 35 | 28 | -7 | onet 0, ilo 31 |
| 33-3051.00 | Police and Sheriff's Patrol Officers | 42 | 30 | -12 | onet 17, ilo 16 |
| 33-3051.04 | Customs and Border Protection Officers | 55 | 78 | +23 | onet 33, ilo 55 |
| 33-3052.00 | Transit and Railroad Police | 29 | 22 | -6 | onet 11, ilo 16 |
| 33-9011.00 | Animal Control Workers | 38 | 28 | -10 | onet 0, ilo 31 |
| 33-9021.00 | Private Detectives and Investigators | 55 | 63 | +8 | onet 0, ilo 69 |
| 33-9031.00 | Gambling Surveillance Officers and Gambling Investigators | 57 | 53 | -4 | onet 0, ilo 55 |
| 33-9032.00 | Security Guards | 31 | 30 | -1 | onet 0, ilo 32 |
| 33-9091.00 | Crossing Guards and Flaggers | 25 | 28 | +4 | onet 0, ilo 31 |
| 33-9092.00 | Lifeguards, Ski Patrol, and Other Recreational Protective Service Workers | 24 | 28 | +4 | onet 0, ilo 31 |
| 33-9093.00 | Transportation Security Screeners | 34 | 53 | +19 | onet 0, ilo 55 |
| 33-9094.00 | School Bus Monitors | 12 | 28 | +16 | onet 0, ilo 31 |
| 33-9099.00 | Protective Service Workers, All Other | 57 | 39 | -18 | onet 11, ilo 31 |
| 33-9099.02 | Retail Loss Prevention Specialists | 54 | 39 | -15 | onet 11, ilo 31 |
| 35-1011.00 | Chefs and Head Cooks | 37 | 43 | +6 | onet 2, ilo 44 |
| 35-1012.00 | First-Line Supervisors of Food Preparation and Serving Workers | 61 | 42 | -18 | onet 8, ilo 37 |
| 35-2011.00 | Cooks, Fast Food | 16 | 24 | +8 | onet 0, ilo 28 |
| 35-2012.00 | Cooks, Institution and Cafeteria | 24 | 26 | +2 | onet 0, ilo 28 |
| 35-2013.00 | Cooks, Private Household | 28 | 26 | -2 | onet 0, ilo 28 |
| 35-2014.00 | Cooks, Restaurant | 22 | 27 | +5 | onet 1, ilo 28 |
| 35-2015.00 | Cooks, Short Order | 18 | 27 | +9 | onet 0, ilo 29 |
| 35-2019.00 | Cooks, All Other | 16 | 26 | +10 | onet 0, ilo 28 |
| 35-2021.00 | Food Preparation Workers | 7 | 9 | +2 | onet 0, ilo 13 |
| 35-3011.00 | Bartenders | 29 | 41 | +12 | onet 0, ilo 43 |
| 35-3023.00 | Fast Food and Counter Workers | 20 | 36 | +16 | onet 0, ilo 38 |
| 35-3023.01 | Baristas | 27 | 36 | +9 | onet 0, ilo 38 |
| 35-3031.00 | Waiters and Waitresses | 22 | 43 | +21 | onet 0, ilo 46 |
| 35-3041.00 | Food Servers, Nonrestaurant | 23 | 43 | +20 | onet 0, ilo 46 |
| 35-9011.00 | Dining Room and Cafeteria Attendants and Bartender Helpers | 1 | 24 | +23 | onet 0, ilo 28 |
| 35-9021.00 | Dishwashers | 2 | 9 | +7 | onet 0, ilo 13 |
| 35-9031.00 | Hosts and Hostesses, Restaurant, Lounge, and Coffee Shop | 46 | 39 | -7 | onet 8, ilo 33 |
| 35-9099.00 | Food Preparation and Serving Related Workers, All Other | 2 | 9 | +7 | onet 0, ilo 13 |
| 37-1011.00 | First-Line Supervisors of Housekeeping and Janitorial Workers | 38 | 35 | -3 | onet 4, ilo 34 |
| 37-1012.00 | First-Line Supervisors of Landscaping, Lawn Service, and Groundskeeping Workers | 50 | 34 | -16 | onet 11, ilo 25 |
| 37-2011.00 | Janitors and Cleaners, Except Maids and Housekeeping Cleaners | 3 | 24 | +21 | onet 0, ilo 28 |
| 37-2012.00 | Maids and Housekeeping Cleaners | 3 | 10 | +7 | onet 0, ilo 14 |
| 37-2019.00 | Building Cleaning Workers, All Other | 3 | 3 | +0 | onet 0, ilo 5 |
| 37-2021.00 | Pest Control Workers | 35 | 20 | -15 | onet 9, ilo 16 |
| 37-3011.00 | Landscaping and Groundskeeping Workers | 2 | 6 | +4 | onet 0, ilo 9 |
| 37-3012.00 | Pesticide Handlers, Sprayers, and Applicators, Vegetation | 15 | 11 | -4 | onet 0, ilo 16 |
| 37-3013.00 | Tree Trimmers and Pruners | 5 | 19 | +14 | onet 0, ilo 25 |
| 37-3019.00 | Grounds Maintenance Workers, All Other | 2 | 5 | +3 | onet 0, ilo 8 |
| 39-1013.00 | First-Line Supervisors of Gambling Services Workers | 53 | 69 | +16 | onet 0, ilo 74 |
| 39-1014.00 | First-Line Supervisors of Entertainment and Recreation Workers, Except Gambling Services | 55 | 44 | -10 | onet 6, ilo 41 |
| 39-1022.00 | First-Line Supervisors of Personal Service Workers | 57 | 38 | -18 | onet 7, ilo 34 |
| 39-2011.00 | Animal Trainers | 18 | 12 | -6 | onet 0, ilo 18 |
| 39-2021.00 | Animal Caretakers | 28 | 12 | -16 | onet 0, ilo 18 |
| 39-3011.00 | Gambling Dealers | 34 | 69 | +35 | onet 0, ilo 74 |
| 39-3012.00 | Gambling and Sports Book Writers and Runners | 46 | 69 | +23 | onet 0, ilo 74 |
| 39-3019.00 | Gambling Service Workers, All Other | 34 | 69 | +35 | onet 0, ilo 74 |
| 39-3021.00 | Motion Picture Projectionists | 32 | 49 | +17 | onet 0, ilo 51 |
| 39-3031.00 | Ushers, Lobby Attendants, and Ticket Takers | 31 | 49 | +18 | onet 0, ilo 51 |
| 39-3091.00 | Amusement and Recreation Attendants | 38 | 55 | +17 | onet 7, ilo 51 |
| 39-3092.00 | Costume Attendants | 35 | 1 | -34 | onet 0 |
| 39-3093.00 | Locker Room, Coatroom, and Dressing Room Attendants | 25 | 49 | +25 | onet 0, ilo 51 |
| 39-3099.00 | Entertainment Attendants and Related Workers, All Other | 35 | 1 | -34 | onet 0 |
| 39-4011.00 | Embalmers | 17 | 17 | 0 | onet 0, ilo 24 |
| 39-4012.00 | Crematory Operators | 0 | 27 | +27 | onet 0, ilo 30 |
| 39-4021.00 | Funeral Attendants | 29 | 24 | -5 | onet 4, ilo 24 |
| 39-4031.00 | Morticians, Undertakers, and Funeral Arrangers | 33 | 17 | -16 | onet 0, ilo 24 |
| 39-5011.00 | Barbers | 25 | 14 | -11 | onet 0, ilo 20 |
| 39-5012.00 | Hairdressers, Hairstylists, and Cosmetologists | 23 | 14 | -9 | onet 3, ilo 17 |
| 39-5091.00 | Makeup Artists, Theatrical and Performance | 39 | 16 | -23 | onet 0, ilo 23 |
| 39-5092.00 | Manicurists and Pedicurists | 31 | 27 | -3 | onet 7, ilo 23 |
| 39-5093.00 | Shampooers | 21 | 16 | -5 | onet 0, ilo 23 |
| 39-5094.00 | Skincare Specialists | 33 | 16 | -17 | onet 0, ilo 23 |
| 39-6011.00 | Baggage Porters and Bellhops | 23 | 68 | +45 | onet 11, ilo 61 |
| 39-6012.00 | Concierges | 73 | 91 | +18 | onet 28, ilo 87 |
| 39-7011.00 | Tour Guides and Escorts | 42 | 55 | +13 | onet 2, ilo 56 |
| 39-7012.00 | Travel Guides | 55 | 68 | +13 | onet 17, ilo 56 |
| 39-9011.00 | Childcare Workers | 31 | 30 | -1 | onet 3, ilo 28 |
| 39-9011.01 | Nannies | 30 | 26 | -4 | onet 0, ilo 28 |
| 39-9031.00 | Exercise Trainers and Group Fitness Instructors | 1 | 39 | +38 | onet 0, ilo 41 |
| 39-9032.00 | Recreation Workers | 35 | 32 | -4 | onet 0, ilo 33 |
| 39-9041.00 | Residential Advisors | 52 | 36 | -16 | onet 5, ilo 33 |
| 39-9099.00 | Personal Care and Service Workers, All Other | 30 | 27 | -2 | onet 0, ilo 30 |
| 41-1011.00 | First-Line Supervisors of Retail Sales Workers | 69 | 84 | +15 | onet 35, ilo 63 |
| 41-1012.00 | First-Line Supervisors of Non-Retail Sales Workers | 89 | 89 | +0 | onet 28, ilo 83 |
| 41-2011.00 | Cashiers | 44 | 74 | +30 | onet 12, ilo 69 |
| 41-2012.00 | Gambling Change Persons and Booth Cashiers | 39 | 63 | +24 | onet 0, ilo 69 |
| 41-2021.00 | Counter and Rental Clerks | 73 | 34 | -39 | onet 18 |
| 41-2022.00 | Parts Salespersons | 44 | 61 | +17 | onet 0, ilo 67 |
| 41-2031.00 | Retail Salespersons | 62 | 85 | +23 | onet 35, ilo 67 |
| 41-3011.00 | Advertising Sales Agents | 84 | 82 | -3 | onet 19, ilo 76 |
| 41-3021.00 | Insurance Sales Agents | 94 | 93 | -1 | onet 34, ilo 87 |
| 41-3031.00 | Securities, Commodities, and Financial Services Sales Agents | 94 | 98 | +4 | onet 45, ilo 97 |
| 41-3041.00 | Travel Agents | 91 | 97 | +6 | onet 47, ilo 84 |
| 41-3091.00 | Sales Representatives of Services, Except Advertising, Insurance, Financial Services, and Travel | 96 | 99 | +4 | onet 71, ilo 84 |
| 41-4011.00 | Sales Representatives, Wholesale and Manufacturing, Technical and Scientific Products | 84 | 98 | +13 | onet 55, ilo 86 |
| 41-4011.07 | Solar Sales Representatives and Assessors | 76 | 80 | +4 | onet 8, ilo 84 |
| 41-4012.00 | Sales Representatives, Wholesale and Manufacturing, Except Technical and Scientific Products | 89 | 99 | +10 | onet 76, ilo 84 |
| 41-9011.00 | Demonstrators and Product Promoters | 43 | 72 | +29 | onet 4, ilo 73 |
| 41-9012.00 | Models | 22 | 40 | +19 | onet 0, ilo 43 |
| 41-9021.00 | Real Estate Brokers | 85 | 84 | -1 | onet 34, ilo 64 |
| 41-9022.00 | Real Estate Sales Agents | 74 | 83 | +8 | onet 33, ilo 64 |
| 41-9031.00 | Sales Engineers | 86 | 95 | +9 | onet 41, ilo 86 |
| 41-9041.00 | Telemarketers | 92 | 99 | +7 | onet 53, ilo 94 |
| 41-9091.00 | Door-to-Door Sales Workers, News and Street Vendors, and Related Workers | 63 | 66 | +3 | onet 18, ilo 53 |
| 41-9099.00 | Sales and Related Workers, All Other | 63 | 83 | +20 | onet 18, ilo 80 |
| 43-1011.00 | First-Line Supervisors of Office and Administrative Support Workers | 79 | 83 | +4 | onet 22, ilo 75 |
| 43-2011.00 | Switchboard Operators, Including Answering Service | 90 | 97 | +6 | onet 50, ilo 86 |
| 43-2021.00 | Telephone Operators | 77 | 82 | +5 | onet 10, ilo 86 |
| 43-2099.00 | Communications Equipment Operators, All Other | 90 | 92 | +2 | onet 50, ilo 67 |
| 43-3011.00 | Bill and Account Collectors | 94 | 88 | -6 | onet 32, ilo 76 |
| 43-3021.00 | Billing and Posting Clerks | 94 | 99 | +5 | onet 51, ilo 96 |
| 43-3031.00 | Bookkeeping, Accounting, and Auditing Clerks | 92 | 90 | -2 | onet 24, ilo 89 |
| 43-3041.00 | Gambling Cage Workers | 59 | 73 | +13 | onet 5, ilo 74 |
| 43-3051.00 | Payroll and Timekeeping Clerks | 86 | 85 | -0 | onet 7, ilo 94 |
| 43-3061.00 | Procurement Clerks | 96 | 94 | -3 | onet 28, ilo 93 |
| 43-3071.00 | Tellers | 65 | 81 | +15 | onet 1, ilo 92 |
| 43-3099.00 | Financial Clerks, All Other | 96 | 93 | -4 | onet 28, ilo 90 |
| 43-4011.00 | Brokerage Clerks | 89 | 94 | +4 | onet 24, ilo 97 |
| 43-4021.00 | Correspondence Clerks | 93 | 98 | +5 | onet 47, ilo 96 |
| 43-4031.00 | Court, Municipal, and License Clerks | 87 | 79 | -8 | onet 15, ilo 77 |
| 43-4041.00 | Credit Authorizers, Checkers, and Clerks | 93 | 89 | -4 | onet 15, ilo 97 |
| 43-4051.00 | Customer Service Representatives | 90 | 100 | +10 | onet 74, ilo 93 |
| 43-4061.00 | Eligibility Interviewers, Government Programs | 85 | 77 | -8 | onet 6, ilo 80 |
| 43-4071.00 | File Clerks | 81 | 76 | -4 | onet 21, ilo 64 |
| 43-4081.00 | Hotel, Motel, and Resort Desk Clerks | 75 | 87 | +13 | onet 19, ilo 87 |
| 43-4111.00 | Interviewers, Except Eligibility and Loan | 96 | 95 | -2 | onet 38, ilo 87 |
| 43-4121.00 | Library Assistants, Clerical | 70 | 77 | +7 | onet 10, ilo 76 |
| 43-4131.00 | Loan Interviewers and Clerks | 93 | 92 | -1 | onet 19, ilo 97 |
| 43-4141.00 | New Accounts Clerks | 74 | 85 | +11 | onet 4, ilo 97 |
| 43-4151.00 | Order Clerks | 81 | 91 | +10 | onet 19, ilo 96 |
| 43-4161.00 | Human Resources Assistants, Except Payroll and Timekeeping | 97 | 98 | +1 | onet 49, ilo 94 |
| 43-4171.00 | Receptionists and Information Clerks | 87 | 96 | +9 | onet 40, ilo 91 |
| 43-4181.00 | Reservation and Transportation Ticket Agents and Travel Clerks | 68 | 89 | +21 | onet 20, ilo 91 |
| 43-4199.00 | Information and Record Clerks, All Other | 87 | 94 | +7 | onet 40, ilo 82 |
| 43-5011.00 | Cargo and Freight Agents | 73 | 79 | +6 | onet 0, ilo 92 |
| 43-5011.01 | Freight Forwarders | 83 | 84 | +1 | onet 9, ilo 92 |
| 43-5021.00 | Couriers and Messengers | 33 | 46 | +13 | onet 3, ilo 46 |
| 43-5031.00 | Public Safety Telecommunicators | 79 | 33 | -45 | onet 5, ilo 31 |
| 43-5032.00 | Dispatchers, Except Police, Fire, and Ambulance | 92 | 87 | -5 | onet 22, ilo 84 |
| 43-5041.00 | Meter Readers, Utilities | 36 | 57 | +21 | onet 0, ilo 61 |
| 43-5051.00 | Postal Service Clerks | 37 | 80 | +43 | onet 0, ilo 92 |
| 43-5052.00 | Postal Service Mail Carriers | 22 | 64 | +42 | onet 0, ilo 69 |
| 43-5053.00 | Postal Service Mail Sorters, Processors, and Processing Machine Operators | 13 | 64 | +52 | onet 0, ilo 69 |
| 43-5061.00 | Production, Planning, and Expediting Clerks | 78 | 77 | -1 | onet 9, ilo 78 |
| 43-5071.00 | Shipping, Receiving, and Inventory Clerks | 49 | 63 | +14 | onet 0, ilo 68 |
| 43-5111.00 | Weighers, Measurers, Checkers, and Samplers, Recordkeeping | 40 | 63 | +23 | onet 0, ilo 68 |
| 43-6011.00 | Executive Secretaries and Executive Administrative Assistants | 88 | 90 | +2 | onet 27, ilo 86 |
| 43-6012.00 | Legal Secretaries and Administrative Assistants | 75 | 82 | +7 | onet 9, ilo 88 |
| 43-6013.00 | Medical Secretaries and Administrative Assistants | 94 | 95 | +1 | onet 37, ilo 87 |
| 43-6014.00 | Secretaries and Administrative Assistants, Except Legal, Medical, and Executive | 93 | 97 | +5 | onet 47, ilo 91 |
| 43-9021.00 | Data Entry Keyers | 88 | 99 | +11 | onet 53, ilo 99 |
| 43-9022.00 | Word Processors and Typists | 85 | 94 | +9 | onet 24, ilo 98 |
| 43-9031.00 | Desktop Publishers | 86 | 92 | +6 | onet 57, ilo 61 |
| 43-9041.00 | Insurance Claims and Policy Processing Clerks | 91 | 90 | -1 | onet 16, ilo 97 |
| 43-9051.00 | Mail Clerks and Mail Machine Operators, Except Postal Service | 26 | 64 | +38 | onet 0, ilo 69 |
| 43-9061.00 | Office Clerks, General | 90 | 98 | +8 | onet 48, ilo 93 |
| 43-9071.00 | Office Machine Operators, Except Computer | 44 | 61 | +17 | onet 3, ilo 64 |
| 43-9081.00 | Proofreaders and Copy Markers | 93 | 89 | -4 | onet 30, ilo 80 |
| 43-9111.00 | Statistical Assistants | 99 | 98 | -1 | onet 52, ilo 91 |
| 43-9199.00 | Office and Administrative Support Workers, All Other | 90 | 98 | +9 | onet 48, ilo 96 |
| 45-1011.00 | First-Line Supervisors of Farming, Fishing, and Forestry Workers | 36 | 13 | -23 | onet 0, ilo 19 |
| 45-2011.00 | Agricultural Inspectors | 45 | 46 | +1 | onet 0, ilo 49 |
| 45-2021.00 | Animal Breeders | 20 | 22 | +2 | onet 0, ilo 26 |
| 45-2041.00 | Graders and Sorters, Agricultural Products | 10 | 51 | +40 | onet 0, ilo 52 |
| 45-2091.00 | Agricultural Equipment Operators | 7 | 7 | +0 | onet 0, ilo 12 |
| 45-2092.00 | Farmworkers and Laborers, Crop, Nursery, and Greenhouse | 13 | 7 | -6 | onet 1, ilo 9 |
| 45-2093.00 | Farmworkers, Farm, Ranch, and Aquacultural Animals | 11 | 6 | -5 | onet 0, ilo 9 |
| 45-2099.00 | Agricultural Workers, All Other | 7 | 6 | -1 | onet 0, ilo 10 |
| 45-3031.00 | Fishing and Hunting Workers | 0 | 10 | +10 | onet 0, ilo 15 |
| 45-4011.00 | Forest and Conservation Workers | 11 | 6 | -5 | onet 0, ilo 8 |
| 45-4021.00 | Fallers | 2 | 7 | +5 | onet 0, ilo 12 |
| 45-4022.00 | Logging Equipment Operators | 22 | 7 | -14 | onet 0, ilo 12 |
| 45-4023.00 | Log Graders and Scalers | 32 | 7 | -24 | onet 0, ilo 12 |
| 45-4029.00 | Logging Workers, All Other | 22 | 6 | -16 | onet 0, ilo 8 |
| 47-1011.00 | First-Line Supervisors of Construction Trades and Extraction Workers | 47 | 55 | +7 | onet 7, ilo 50 |
| 47-1011.03 | Solar Energy Installation Managers | 50 | 49 | -1 | onet 0, ilo 50 |
| 47-2011.00 | Boilermakers | 8 | 30 | +22 | onet 0, ilo 32 |
| 47-2021.00 | Brickmasons and Blockmasons | 3 | 2 | -1 | onet 0, ilo 3 |
| 47-2022.00 | Stonemasons | 2 | 5 | +3 | onet 0, ilo 8 |
| 47-2031.00 | Carpenters | 14 | 9 | -5 | onet 0, ilo 14 |
| 47-2041.00 | Carpet Installers | 6 | 4 | -2 | onet 0, ilo 5 |
| 47-2042.00 | Floor Layers, Except Carpet, Wood, and Hard Tiles | 5 | 4 | -1 | onet 0, ilo 5 |
| 47-2043.00 | Floor Sanders and Finishers | 6 | 4 | -2 | onet 0, ilo 5 |
| 47-2044.00 | Tile and Stone Setters | 11 | 4 | -7 | onet 0, ilo 5 |
| 47-2051.00 | Cement Masons and Concrete Finishers | 1 | 4 | +3 | onet 0, ilo 7 |
| 47-2053.00 | Terrazzo Workers and Finishers | 1 | 4 | +3 | onet 0, ilo 7 |
| 47-2061.00 | Construction Laborers | 8 | 4 | -3 | onet 2, ilo 4 |
| 47-2071.00 | Paving, Surfacing, and Tamping Equipment Operators | 6 | 9 | +3 | onet 0, ilo 14 |
| 47-2072.00 | Pile Driver Operators | 5 | 9 | +4 | onet 0, ilo 14 |
| 47-2073.00 | Operating Engineers and Other Construction Equipment Operators | 15 | 9 | -6 | onet 0, ilo 14 |
| 47-2081.00 | Drywall and Ceiling Tile Installers | 4 | 5 | +1 | onet 0, ilo 8 |
| 47-2082.00 | Tapers | 3 | 5 | +2 | onet 0, ilo 8 |
| 47-2111.00 | Electricians | 23 | 27 | +4 | onet 0, ilo 30 |
| 47-2121.00 | Glaziers | 9 | 10 | +1 | onet 0, ilo 15 |
| 47-2131.00 | Insulation Workers, Floor, Ceiling, and Wall | 5 | 8 | +3 | onet 0, ilo 12 |
| 47-2132.00 | Insulation Workers, Mechanical | 13 | 10 | -3 | onet 2, ilo 12 |
| 47-2141.00 | Painters, Construction and Maintenance | 5 | 8 | +3 | onet 0, ilo 12 |
| 47-2142.00 | Paperhangers | 2 | 8 | +5 | onet 0, ilo 12 |
| 47-2151.00 | Pipelayers | 7 | 12 | +6 | onet 0, ilo 18 |
| 47-2152.00 | Plumbers, Pipefitters, and Steamfitters | 15 | 15 | -0 | onet 4, ilo 18 |
| 47-2152.04 | Solar Thermal Installers and Technicians | 11 | 12 | +2 | onet 0, ilo 18 |
| 47-2161.00 | Plasterers and Stucco Masons | 6 | 5 | -1 | onet 0, ilo 8 |
| 47-2171.00 | Reinforcing Iron and Rebar Workers | 5 | 5 | +0 | onet 0, ilo 7 |
| 47-2181.00 | Roofers | 4 | 10 | +6 | onet 3, ilo 12 |
| 47-2211.00 | Sheet Metal Workers | 10 | 30 | +20 | onet 0, ilo 32 |
| 47-2221.00 | Structural Iron and Steel Workers | 8 | 8 | +1 | onet 6, ilo 7 |
| 47-2231.00 | Solar Photovoltaic Installers | 18 | 17 | -2 | onet 0, ilo 23 |
| 47-3011.00 | Helpers--Brickmasons, Blockmasons, Stonemasons, and Tile and Marble Setters | 1 | 3 | +2 | onet 0, ilo 4 |
| 47-3012.00 | Helpers--Carpenters | 4 | 3 | -1 | onet 0, ilo 4 |
| 47-3013.00 | Helpers--Electricians | 4 | 3 | -1 | onet 0, ilo 4 |
| 47-3014.00 | Helpers--Painters, Paperhangers, Plasterers, and Stucco Masons | 1 | 3 | +2 | onet 0, ilo 4 |
| 47-3015.00 | Helpers--Pipelayers, Plumbers, Pipefitters, and Steamfitters | 2 | 3 | +1 | onet 0, ilo 4 |
| 47-3016.00 | Helpers--Roofers | 1 | 3 | +2 | onet 0, ilo 4 |
| 47-3019.00 | Helpers, Construction Trades, All Other | 4 | 3 | -0 | onet 0, ilo 5 |
| 47-4011.00 | Construction and Building Inspectors | 48 | 56 | +8 | onet 10, ilo 49 |
| 47-4011.01 | Energy Auditors | 58 | 46 | -11 | onet 0, ilo 49 |
| 47-4021.00 | Elevator and Escalator Installers and Repairers | 24 | 20 | -3 | onet 0, ilo 26 |
| 47-4031.00 | Fence Erectors | 4 | 2 | -2 | onet 0, ilo 4 |
| 47-4041.00 | Hazardous Materials Removal Workers | 21 | 2 | -19 | onet 0, ilo 4 |
| 47-4051.00 | Highway Maintenance Workers | 5 | 3 | -2 | onet 0, ilo 4 |
| 47-4061.00 | Rail-Track Laying and Maintenance Equipment Operators | 4 | 3 | -1 | onet 0, ilo 4 |
| 47-4071.00 | Septic Tank Servicers and Sewer Pipe Cleaners | 10 | 4 | -7 | onet 0, ilo 5 |
| 47-4091.00 | Segmental Pavers | 0 | 5 | +4 | onet 0, ilo 7 |
| 47-4099.00 | Construction and Related Workers, All Other | 7 | 2 | -5 | onet 0, ilo 4 |
| 47-4099.03 | Weatherization Installers and Technicians | 12 | 2 | -10 | onet 0, ilo 4 |
| 47-5011.00 | Derrick Operators, Oil and Gas | 4 | 19 | +15 | onet 0, ilo 25 |
| 47-5012.00 | Rotary Drill Operators, Oil and Gas | 17 | 19 | +2 | onet 0, ilo 25 |
| 47-5013.00 | Service Unit Operators, Oil and Gas | 14 | 19 | +5 | onet 0, ilo 25 |
| 47-5022.00 | Excavating and Loading Machine and Dragline Operators, Surface Mining | 15 | 9 | -5 | onet 0, ilo 14 |
| 47-5023.00 | Earth Drillers, Except Oil and Gas | 27 | 19 | -8 | onet 0, ilo 25 |
| 47-5032.00 | Explosives Workers, Ordnance Handling Experts, and Blasters | 27 | 7 | -20 | onet 0, ilo 11 |
| 47-5041.00 | Continuous Mining Machine Operators | 7 | 16 | +10 | onet 0, ilo 23 |
| 47-5043.00 | Roof Bolters, Mining | 15 | 16 | +1 | onet 0, ilo 23 |
| 47-5044.00 | Loading and Moving Machine Operators, Underground Mining | 16 | 16 | -0 | onet 0, ilo 23 |
| 47-5049.00 | Underground Mining Machine Operators, All Other | 16 | 16 | -0 | onet 0, ilo 23 |
| 47-5051.00 | Rock Splitters, Quarry | 6 | 16 | +10 | onet 0, ilo 23 |
| 47-5071.00 | Roustabouts, Oil and Gas | 3 | 19 | +16 | onet 0, ilo 25 |
| 47-5081.00 | Helpers--Extraction Workers | 3 | 5 | +2 | onet 0, ilo 7 |
| 47-5099.00 | Extraction Workers, All Other | 3 | 11 | +8 | onet 0, ilo 16 |
| 49-1011.00 | First-Line Supervisors of Mechanics, Installers, and Repairers | 58 | 38 | -20 | onet 12, ilo 28 |
| 49-2011.00 | Computer, Automated Teller, and Office Machine Repairers | 53 | 50 | -4 | onet 12, ilo 39 |
| 49-2021.00 | Radio, Cellular, and Tower Equipment Installers and Repairers | 24 | 35 | +12 | onet 0, ilo 38 |
| 49-2022.00 | Telecommunications Equipment Installers and Repairers, Except Line Installers | 33 | 37 | +5 | onet 2, ilo 38 |
| 49-2091.00 | Avionics Technicians | 37 | 37 | +0 | onet 0, ilo 40 |
| 49-2092.00 | Electric Motor, Power Tool, and Related Repairers | 21 | 20 | -0 | onet 0, ilo 26 |
| 49-2093.00 | Electrical and Electronics Installers and Repairers, Transportation Equipment | 27 | 36 | +10 | onet 0, ilo 39 |
| 49-2094.00 | Electrical and Electronics Repairers, Commercial and Industrial Equipment | 38 | 32 | -6 | onet 0, ilo 34 |
| 49-2095.00 | Electrical and Electronics Repairers, Powerhouse, Substation, and Relay | 38 | 32 | -6 | onet 0, ilo 34 |
| 49-2096.00 | Electronic Equipment Installers and Repairers, Motor Vehicles | 25 | 32 | +7 | onet 0, ilo 34 |
| 49-2097.00 | Audiovisual Equipment Installers and Repairers | 31 | 35 | +4 | onet 0, ilo 38 |
| 49-2098.00 | Security and Fire Alarm Systems Installers | 29 | 26 | -4 | onet 3, ilo 26 |
| 49-3011.00 | Aircraft Mechanics and Service Technicians | 25 | 30 | +5 | onet 0, ilo 32 |
| 49-3021.00 | Automotive Body and Related Repairers | 9 | 25 | +16 | onet 0, ilo 28 |
| 49-3022.00 | Automotive Glass Installers and Repairers | 6 | 25 | +19 | onet 0, ilo 28 |
| 49-3023.00 | Automotive Service Technicians and Mechanics | 17 | 25 | +8 | onet 0, ilo 28 |
| 49-3031.00 | Bus and Truck Mechanics and Diesel Engine Specialists | 9 | 25 | +16 | onet 0, ilo 28 |
| 49-3041.00 | Farm Equipment Mechanics and Service Technicians | 14 | 20 | +6 | onet 0, ilo 26 |
| 49-3042.00 | Mobile Heavy Equipment Mechanics, Except Engines | 13 | 20 | +7 | onet 0, ilo 26 |
| 49-3043.00 | Rail Car Repairers | 10 | 20 | +10 | onet 0, ilo 26 |
| 49-3051.00 | Motorboat Mechanics and Service Technicians | 17 | 25 | +8 | onet 0, ilo 28 |
| 49-3052.00 | Motorcycle Mechanics | 14 | 25 | +11 | onet 0, ilo 28 |
| 49-3053.00 | Outdoor Power Equipment and Other Small Engine Mechanics | 23 | 20 | -2 | onet 0, ilo 26 |
| 49-3091.00 | Bicycle Repairers | 18 | 10 | -8 | onet 0, ilo 14 |
| 49-3092.00 | Recreational Vehicle Service Technicians | 14 | 25 | +10 | onet 0, ilo 28 |
| 49-3093.00 | Tire Repairers and Changers | 3 | 25 | +22 | onet 0, ilo 28 |
| 49-9011.00 | Mechanical Door Repairers | 13 | 20 | +8 | onet 0, ilo 26 |
| 49-9012.00 | Control and Valve Installers and Repairers, Except Mechanical Door | 22 | 20 | -2 | onet 0, ilo 26 |
| 49-9021.00 | Heating, Air Conditioning, and Refrigeration Mechanics and Installers | 21 | 33 | +12 | onet 2, ilo 33 |
| 49-9031.00 | Home Appliance Repairers | 20 | 20 | +0 | onet 0, ilo 26 |
| 49-9041.00 | Industrial Machinery Mechanics | 26 | 22 | -3 | onet 1, ilo 26 |
| 49-9043.00 | Maintenance Workers, Machinery | 20 | 20 | +0 | onet 0, ilo 26 |
| 49-9044.00 | Millwrights | 5 | 20 | +14 | onet 0, ilo 26 |
| 49-9045.00 | Refractory Materials Repairers, Except Brickmasons | 5 | 2 | -3 | onet 0, ilo 3 |
| 49-9051.00 | Electrical Power-Line Installers and Repairers | 8 | 14 | +6 | onet 0, ilo 20 |
| 49-9052.00 | Telecommunications Line Installers and Repairers | 9 | 35 | +26 | onet 0, ilo 38 |
| 49-9061.00 | Camera and Photographic Equipment Repairers | 45 | 36 | -9 | onet 4, ilo 34 |
| 49-9062.00 | Medical Equipment Repairers | 39 | 33 | -6 | onet 0, ilo 34 |
| 49-9063.00 | Musical Instrument Repairers and Tuners | 19 | 11 | -7 | onet 0, ilo 17 |
| 49-9064.00 | Watch and Clock Repairers | 34 | 33 | -2 | onet 0, ilo 34 |
| 49-9069.00 | Precision Instrument and Equipment Repairers, All Other | 19 | 33 | +14 | onet 0, ilo 34 |
| 49-9071.00 | Maintenance and Repair Workers, General | 18 | 6 | -13 | onet 0, ilo 9 |
| 49-9081.00 | Wind Turbine Service Technicians | 12 | 20 | +8 | onet 0, ilo 26 |
| 49-9091.00 | Coin, Vending, and Amusement Machine Servicers and Repairers | 34 | 57 | +23 | onet 0, ilo 61 |
| 49-9092.00 | Commercial Divers | 11 | 14 | +3 | onet 0, ilo 20 |
| 49-9094.00 | Locksmiths and Safe Repairers | 18 | 29 | +11 | onet 0, ilo 31 |
| 49-9095.00 | Manufactured Building and Mobile Home Installers | 8 | 2 | -6 | onet 0, ilo 4 |
| 49-9096.00 | Riggers | 5 | 8 | +3 | onet 0, ilo 13 |
| 49-9097.00 | Signal and Track Switch Repairers | 18 | 20 | +3 | onet 0, ilo 26 |
| 49-9098.00 | Helpers--Installation, Maintenance, and Repair Workers | 5 | 6 | +0 | onet 0, ilo 9 |
| 49-9099.00 | Installation, Maintenance, and Repair Workers, All Other | 36 | 7 | -29 | onet 0, ilo 10 |
| 49-9099.01 | Geothermal Technicians | 30 | 7 | -24 | onet 0, ilo 10 |
| 51-1011.00 | First-Line Supervisors of Production and Operating Workers | 47 | 58 | +10 | onet 2, ilo 60 |
| 51-2011.00 | Aircraft Structure, Surfaces, Rigging, and Systems Assemblers | 19 | 48 | +29 | onet 7, ilo 43 |
| 51-2021.00 | Coil Winders, Tapers, and Finishers | 26 | 43 | +17 | onet 3, ilo 43 |
| 51-2022.00 | Electrical and Electronic Equipment Assemblers | 9 | 48 | +39 | onet 7, ilo 43 |
| 51-2023.00 | Electromechanical Equipment Assemblers | 7 | 40 | +33 | onet 0, ilo 43 |
| 51-2031.00 | Engine and Other Machine Assemblers | 17 | 40 | +23 | onet 0, ilo 43 |
| 51-2041.00 | Structural Metal Fabricators and Fitters | 8 | 5 | -4 | onet 0, ilo 7 |
| 51-2051.00 | Fiberglass Laminators and Fabricators | 16 | 22 | +6 | onet 0, ilo 26 |
| 51-2061.00 | Timing Device Assemblers and Adjusters | 26 | 44 | +18 | onet 4, ilo 43 |
| 51-2092.00 | Team Assemblers | 16 | 51 | +35 | onet 0, ilo 53 |
| 51-2099.00 | Assemblers and Fabricators, All Other | 16 | 51 | +35 | onet 0, ilo 53 |
| 51-3011.00 | Bakers | 35 | 17 | -19 | onet 0, ilo 23 |
| 51-3021.00 | Butchers and Meat Cutters | 19 | 8 | -11 | onet 0, ilo 13 |
| 51-3022.00 | Meat, Poultry, and Fish Cutters and Trimmers | 7 | 8 | +1 | onet 0, ilo 13 |
| 51-3023.00 | Slaughterers and Meat Packers | 1 | 8 | +7 | onet 0, ilo 13 |
| 51-3091.00 | Food and Tobacco Roasting, Baking, and Drying Machine Operators and Tenders | 19 | 15 | -4 | onet 0, ilo 21 |
| 51-3092.00 | Food Batchmakers | 28 | 15 | -13 | onet 0, ilo 21 |
| 51-3093.00 | Food Cooking Machine Operators and Tenders | 26 | 15 | -11 | onet 0, ilo 21 |
| 51-3099.00 | Food Processing Workers, All Other | 28 | 14 | -14 | onet 0, ilo 20 |
| 51-4021.00 | Extruding and Drawing Machine Setters, Operators, and Tenders, Metal and Plastic | 6 | 32 | +27 | onet 0, ilo 34 |
| 51-4022.00 | Forging Machine Setters, Operators, and Tenders, Metal and Plastic | 16 | 18 | +2 | onet 0, ilo 25 |
| 51-4023.00 | Rolling Machine Setters, Operators, and Tenders, Metal and Plastic | 20 | 32 | +13 | onet 0, ilo 34 |
| 51-4031.00 | Cutting, Punching, and Press Machine Setters, Operators, and Tenders, Metal and Plastic | 9 | 23 | +15 | onet 0, ilo 27 |
| 51-4032.00 | Drilling and Boring Machine Tool Setters, Operators, and Tenders, Metal and Plastic | 16 | 23 | +7 | onet 0, ilo 27 |
| 51-4033.00 | Grinding, Lapping, Polishing, and Buffing Machine Tool Setters, Operators, and Tenders, Metal and Plastic | 13 | 22 | +9 | onet 0, ilo 27 |
| 51-4034.00 | Lathe and Turning Machine Tool Setters, Operators, and Tenders, Metal and Plastic | 19 | 23 | +4 | onet 0, ilo 27 |
| 51-4035.00 | Milling and Planing Machine Setters, Operators, and Tenders, Metal and Plastic | 26 | 23 | -3 | onet 0, ilo 27 |
| 51-4041.00 | Machinists | 26 | 23 | -3 | onet 0, ilo 27 |
| 51-4051.00 | Metal-Refining Furnace Operators and Tenders | 13 | 47 | +33 | onet 0, ilo 49 |
| 51-4052.00 | Pourers and Casters, Metal | 9 | 43 | +34 | onet 0, ilo 46 |
| 51-4061.00 | Model Makers, Metal and Plastic | 25 | 29 | +4 | onet 0, ilo 31 |
| 51-4062.00 | Patternmakers, Metal and Plastic | 26 | 29 | +3 | onet 0, ilo 31 |
| 51-4071.00 | Foundry Mold and Coremakers | 2 | 10 | +8 | onet 0, ilo 14 |
| 51-4072.00 | Molding, Coremaking, and Casting Machine Setters, Operators, and Tenders, Metal and Plastic | 12 | 22 | +10 | onet 0, ilo 26 |
| 51-4081.00 | Multiple Machine Tool Setters, Operators, and Tenders, Metal and Plastic | 22 | 23 | +2 | onet 0, ilo 27 |
| 51-4111.00 | Tool and Die Makers | 30 | 29 | -1 | onet 0, ilo 31 |
| 51-4121.00 | Welders, Cutters, Solderers, and Brazers | 12 | 9 | -3 | onet 0, ilo 13 |
| 51-4122.00 | Welding, Soldering, and Brazing Machine Setters, Operators, and Tenders | 13 | 9 | -5 | onet 0, ilo 13 |
| 51-4191.00 | Heat Treating Equipment Setters, Operators, and Tenders, Metal and Plastic | 19 | 34 | +15 | onet 0, ilo 37 |
| 51-4192.00 | Layout Workers, Metal and Plastic | 23 | 29 | +6 | onet 0, ilo 31 |
| 51-4193.00 | Plating Machine Setters, Operators, and Tenders, Metal and Plastic | 19 | 33 | +14 | onet 0, ilo 34 |
| 51-4194.00 | Tool Grinders, Filers, and Sharpeners | 13 | 18 | +5 | onet 0, ilo 25 |
| 51-4199.00 | Metal Workers and Plastic Workers, All Other | 23 | 23 | -0 | onet 0, ilo 27 |
| 51-5111.00 | Prepress Technicians and Workers | 63 | 70 | +7 | onet 15, ilo 61 |
| 51-5112.00 | Printing Press Operators | 32 | 40 | +7 | onet 0, ilo 42 |
| 51-5113.00 | Print Binding and Finishing Workers | 17 | 34 | +16 | onet 0, ilo 36 |
| 51-6011.00 | Laundry and Dry-Cleaning Workers | 11 | 15 | +4 | onet 0, ilo 22 |
| 51-6021.00 | Pressers, Textile, Garment, and Related Materials | 1 | 12 | +12 | onet 0, ilo 18 |
| 51-6031.00 | Sewing Machine Operators | 16 | 13 | -3 | onet 0, ilo 18 |
| 51-6041.00 | Shoe and Leather Workers and Repairers | 13 | 13 | +0 | onet 0, ilo 19 |
| 51-6042.00 | Shoe Machine Operators and Tenders | 15 | 18 | +3 | onet 0, ilo 25 |
| 51-6051.00 | Sewers, Hand | 19 | 7 | -12 | onet 0, ilo 10 |
| 51-6052.00 | Tailors, Dressmakers, and Custom Sewers | 29 | 13 | -16 | onet 1, ilo 17 |
| 51-6061.00 | Textile Bleaching and Dyeing Machine Operators and Tenders | 24 | 32 | +8 | onet 3, ilo 31 |
| 51-6062.00 | Textile Cutting Machine Setters, Operators, and Tenders | 20 | 21 | +1 | onet 3, ilo 24 |
| 51-6063.00 | Textile Knitting and Weaving Machine Setters, Operators, and Tenders | 19 | 20 | +2 | onet 1, ilo 24 |
| 51-6064.00 | Textile Winding, Twisting, and Drawing Out Machine Setters, Operators, and Tenders | 9 | 16 | +7 | onet 0, ilo 23 |
| 51-6091.00 | Extruding and Forming Machine Setters, Operators, and Tenders, Synthetic and Glass Fibers | 17 | 21 | +4 | onet 0, ilo 26 |
| 51-6092.00 | Fabric and Apparel Patternmakers | 53 | 17 | -36 | onet 0, ilo 24 |
| 51-6093.00 | Upholsterers | 17 | 18 | +1 | onet 0, ilo 25 |
| 51-6099.00 | Textile, Apparel, and Furnishings Workers, All Other | 53 | 15 | -39 | onet 0, ilo 21 |
| 51-7011.00 | Cabinetmakers and Bench Carpenters | 12 | 16 | +3 | onet 0, ilo 23 |
| 51-7021.00 | Furniture Finishers | 7 | 16 | +8 | onet 0, ilo 23 |
| 51-7031.00 | Model Makers, Wood | 25 | 16 | -9 | onet 0, ilo 23 |
| 51-7032.00 | Patternmakers, Wood | 26 | 17 | -9 | onet 1, ilo 23 |
| 51-7041.00 | Sawing Machine Setters, Operators, and Tenders, Wood | 10 | 11 | +1 | onet 0, ilo 17 |
| 51-7042.00 | Woodworking Machine Setters, Operators, and Tenders, Except Sawing | 11 | 31 | +20 | onet 0, ilo 33 |
| 51-7099.00 | Woodworkers, All Other | 12 | 10 | -2 | onet 0, ilo 15 |
| 51-8011.00 | Nuclear Power Reactor Operators | 52 | 45 | -7 | onet 0, ilo 47 |
| 51-8012.00 | Power Distributors and Dispatchers | 52 | 45 | -7 | onet 0, ilo 47 |
| 51-8013.00 | Power Plant Operators | 37 | 52 | +16 | onet 7, ilo 47 |
| 51-8013.03 | Biomass Plant Technicians | 31 | 45 | +14 | onet 0, ilo 47 |
| 51-8013.04 | Hydroelectric Plant Technicians | 30 | 45 | +15 | onet 0, ilo 47 |
| 51-8021.00 | Stationary Engineers and Boiler Operators | 29 | 29 | +0 | onet 0, ilo 31 |
| 51-8031.00 | Water and Wastewater Treatment Plant and System Operators | 27 | 44 | +17 | onet 0, ilo 47 |
| 51-8091.00 | Chemical Plant and System Operators | 30 | 50 | +20 | onet 0, ilo 51 |
| 51-8092.00 | Gas Plant Operators | 35 | 56 | +21 | onet 8, ilo 51 |
| 51-8093.00 | Petroleum Pump System Operators, Refinery Operators, and Gaugers | 37 | 54 | +17 | onet 6, ilo 51 |
| 51-8099.00 | Plant and System Operators, All Other | 33 | 44 | +11 | onet 0, ilo 47 |
| 51-8099.01 | Biofuels Processing Technicians | 22 | 39 | +17 | onet 0, ilo 41 |
| 51-9011.00 | Chemical Equipment Operators and Tenders | 29 | 40 | +11 | onet 0, ilo 42 |
| 51-9012.00 | Separating, Filtering, Clarifying, Precipitating, and Still Machine Setters, Operators, and Tenders | 20 | 40 | +19 | onet 0, ilo 42 |
| 51-9021.00 | Crushing, Grinding, and Polishing Machine Setters, Operators, and Tenders | 21 | 37 | +15 | onet 5, ilo 35 |
| 51-9022.00 | Grinding and Polishing Workers, Hand | 8 | 18 | +10 | onet 0, ilo 25 |
| 51-9023.00 | Mixing and Blending Machine Setters, Operators, and Tenders | 21 | 39 | +18 | onet 5, ilo 37 |
| 51-9031.00 | Cutters and Trimmers, Hand | 10 | 17 | +6 | onet 0, ilo 24 |
| 51-9032.00 | Cutting and Slicing Machine Setters, Operators, and Tenders | 17 | 38 | +21 | onet 4, ilo 37 |
| 51-9041.00 | Extruding, Forming, Pressing, and Compacting Machine Setters, Operators, and Tenders | 13 | 17 | +5 | onet 0, ilo 24 |
| 51-9051.00 | Furnace, Kiln, Oven, Drier, and Kettle Operators and Tenders | 21 | 27 | +6 | onet 0, ilo 29 |
| 51-9061.00 | Inspectors, Testers, Sorters, Samplers, and Weighers | 52 | 54 | +2 | onet 3, ilo 54 |
| 51-9071.00 | Jewelers and Precious Stone and Metal Workers | 34 | 20 | -14 | onet 0, ilo 26 |
| 51-9071.06 | Gem and Diamond Workers | 36 | 20 | -16 | onet 0, ilo 26 |
| 51-9081.00 | Dental Laboratory Technicians | 26 | 24 | -3 | onet 0, ilo 28 |
| 51-9082.00 | Medical Appliance Technicians | 28 | 24 | -4 | onet 0, ilo 28 |
| 51-9083.00 | Ophthalmic Laboratory Technicians | 23 | 12 | -11 | onet 0, ilo 18 |
| 51-9111.00 | Packaging and Filling Machine Operators and Tenders | 10 | 34 | +25 | onet 0, ilo 37 |
| 51-9123.00 | Painting, Coating, and Decorating Workers | 10 | 26 | +16 | onet 0, ilo 28 |
| 51-9124.00 | Coating, Painting, and Spraying Machine Setters, Operators, and Tenders | 18 | 27 | +9 | onet 3, ilo 28 |
| 51-9141.00 | Semiconductor Processing Technicians | 30 | 1 | -29 | onet 0 |
| 51-9151.00 | Photographic Process Workers and Processing Machine Operators | 44 | 48 | +4 | onet 1, ilo 48 |
| 51-9161.00 | Computer Numerically Controlled Tool Operators | 40 | 26 | -13 | onet 1, ilo 27 |
| 51-9162.00 | Computer Numerically Controlled Tool Programmers | 91 | 46 | -46 | onet 18, ilo 31 |
| 51-9191.00 | Adhesive Bonding Machine Operators and Tenders | 8 | 27 | +19 | onet 0, ilo 30 |
| 51-9192.00 | Cleaning, Washing, and Metal Pickling Equipment Operators and Tenders | 14 | 38 | +23 | onet 0, ilo 40 |
| 51-9193.00 | Cooling and Freezing Equipment Operators and Tenders | 16 | 15 | -1 | onet 0, ilo 21 |
| 51-9194.00 | Etchers and Engravers | 25 | 26 | +1 | onet 0, ilo 28 |
| 51-9195.00 | Molders, Shapers, and Casters, Except Metal and Plastic | 6 | 21 | +15 | onet 0, ilo 26 |
| 51-9195.03 | Stone Cutters and Carvers, Manufacturing | 12 | 25 | +13 | onet 0, ilo 28 |
| 51-9195.04 | Glass Blowers, Molders, Benders, and Finishers | 14 | 26 | +12 | onet 0, ilo 28 |
| 51-9195.05 | Potters, Manufacturing | 12 | 19 | +7 | onet 0, ilo 25 |
| 51-9196.00 | Paper Goods Machine Setters, Operators, and Tenders | 12 | 39 | +27 | onet 0, ilo 41 |
| 51-9197.00 | Tire Builders | 2 | 27 | +24 | onet 0, ilo 30 |
| 51-9198.00 | Helpers--Production Workers | 14 | 10 | -4 | onet 4, ilo 10 |
| 51-9199.00 | Production Workers, All Other | 0 | 10 | +10 | onet 4, ilo 10 |
| 53-1041.00 | Aircraft Cargo Handling Supervisors | 40 | 11 | -29 | onet 0, ilo 17 |
| 53-1042.00 | First-Line Supervisors of Helpers, Laborers, and Material Movers, Hand | 20 | 14 | -5 | onet 3, ilo 17 |
| 53-1042.01 | Recycling Coordinators | 46 | 11 | -35 | onet 0, ilo 17 |
| 53-1043.00 | First-Line Supervisors of Material-Moving Machine and Vehicle Operators | 46 | 35 | -11 | onet 0, ilo 37 |
| 53-1044.00 | First-Line Supervisors of Passenger Attendants | 32 | 40 | +8 | onet 6, ilo 37 |
| 53-1049.00 | First-Line Supervisors of Transportation Workers, All Other | 32 | 40 | +8 | onet 6, ilo 37 |
| 53-2011.00 | Airline Pilots, Copilots, and Flight Engineers | 43 | 46 | +3 | onet 0, ilo 48 |
| 53-2012.00 | Commercial Pilots | 37 | 46 | +9 | onet 0, ilo 48 |
| 53-2021.00 | Air Traffic Controllers | 57 | 54 | -4 | onet 0, ilo 55 |
| 53-2022.00 | Airfield Operations Specialists | 56 | 4 | -51 | onet 4 |
| 53-2031.00 | Flight Attendants | 34 | 37 | +3 | onet 5, ilo 35 |
| 53-3011.00 | Ambulance Drivers and Attendants, Except Emergency Medical Technicians | 19 | 37 | +18 | onet 0, ilo 40 |
| 53-3031.00 | Driver/Sales Workers | 37 | 40 | +3 | onet 3, ilo 40 |
| 53-3032.00 | Heavy and Tractor-Trailer Truck Drivers | 24 | 33 | +9 | onet 0, ilo 34 |
| 53-3033.00 | Light Truck Drivers | 29 | 37 | +8 | onet 0, ilo 40 |
| 53-3051.00 | Bus Drivers, School | 44 | 21 | -22 | onet 0, ilo 26 |
| 53-3052.00 | Bus Drivers, Transit and Intercity | 36 | 21 | -15 | onet 0, ilo 26 |
| 53-3053.00 | Shuttle Drivers and Chauffeurs | 37 | 32 | -6 | onet 0, ilo 33 |
| 53-3054.00 | Taxi Drivers | 39 | 37 | -2 | onet 0, ilo 40 |
| 53-3099.00 | Motor Vehicle Operators, All Other | 29 | 37 | +8 | onet 0, ilo 39 |
| 53-4011.00 | Locomotive Engineers | 36 | 31 | -5 | onet 0, ilo 33 |
| 53-4013.00 | Rail Yard Engineers, Dinkey Operators, and Hostlers | 25 | 31 | +6 | onet 0, ilo 33 |
| 53-4022.00 | Railroad Brake, Signal, and Switch Operators and Locomotive Firers | 31 | 22 | -9 | onet 0, ilo 26 |
| 53-4031.00 | Railroad Conductors and Yardmasters | 36 | 22 | -14 | onet 0, ilo 26 |
| 53-4041.00 | Subway and Streetcar Operators | 40 | 26 | -13 | onet 0, ilo 29 |
| 53-4099.00 | Rail Transportation Workers, All Other | 25 | 22 | -4 | onet 0, ilo 26 |
| 53-5011.00 | Sailors and Marine Oilers | 9 | 12 | +3 | onet 0, ilo 18 |
| 53-5021.00 | Captains, Mates, and Pilots of Water Vessels | 35 | 48 | +13 | onet 0, ilo 50 |
| 53-5022.00 | Motorboat Operators | 11 | 12 | +1 | onet 0, ilo 18 |
| 53-5031.00 | Ship Engineers | 29 | 37 | +7 | onet 0, ilo 40 |
| 53-6011.00 | Bridge and Lock Tenders | 33 | 23 | -10 | onet 0, ilo 27 |
| 53-6021.00 | Parking Attendants | 20 | 49 | +29 | onet 0, ilo 51 |
| 53-6031.00 | Automotive and Watercraft Service Attendants | 14 | 35 | +21 | onet 0, ilo 38 |
| 53-6032.00 | Aircraft Service Attendants | 6 | 14 | +7 | onet 0, ilo 19 |
| 53-6041.00 | Traffic Technicians | 56 | 42 | -15 | onet 0, ilo 45 |
| 53-6051.00 | Transportation Inspectors | 49 | 38 | -11 | onet 0, ilo 41 |
| 53-6051.01 | Aviation Inspectors | 42 | 38 | -4 | onet 0, ilo 41 |
| 53-6051.07 | Transportation Vehicle, Equipment and Systems Inspectors, Except Aviation | 51 | 38 | -13 | onet 0, ilo 41 |
| 53-6061.00 | Passenger Attendants | 45 | 42 | -3 | onet 9, ilo 37 |
| 53-6099.00 | Transportation Workers, All Other | 51 | 14 | -38 | onet 0, ilo 19 |
| 53-7011.00 | Conveyor Operators and Tenders | 21 | 1 | -21 | onet 0 |
| 53-7021.00 | Crane and Tower Operators | 21 | 23 | +2 | onet 0, ilo 27 |
| 53-7031.00 | Dredge Operators | 9 | 9 | +0 | onet 0, ilo 14 |
| 53-7041.00 | Hoist and Winch Operators | 10 | 23 | +13 | onet 0, ilo 27 |
| 53-7051.00 | Industrial Truck and Tractor Operators | 5 | 30 | +26 | onet 0, ilo 32 |
| 53-7061.00 | Cleaners of Vehicles and Equipment | 7 | 4 | -3 | onet 0, ilo 6 |
| 53-7062.00 | Laborers and Freight, Stock, and Material Movers, Hand | 4 | 11 | +7 | onet 0, ilo 17 |
| 53-7062.04 | Recycling and Reclamation Workers | 4 | 7 | +3 | onet 0, ilo 11 |
| 53-7063.00 | Machine Feeders and Offbearers | 15 | 7 | -8 | onet 0, ilo 10 |
| 53-7064.00 | Packers and Packagers, Hand | 10 | 31 | +21 | onet 0, ilo 33 |
| 53-7065.00 | Stockers and Order Fillers | 32 | 43 | +12 | onet 0, ilo 46 |
| 53-7071.00 | Gas Compressor and Gas Pumping Station Operators | 31 | 50 | +18 | onet 0, ilo 51 |
| 53-7072.00 | Pump Operators, Except Wellhead Pumpers | 28 | 50 | +22 | onet 0, ilo 51 |
| 53-7073.00 | Wellhead Pumpers | 8 | 19 | +11 | onet 0, ilo 25 |
| 53-7081.00 | Refuse and Recyclable Material Collectors | 18 | 13 | -4 | onet 0, ilo 19 |
| 53-7121.00 | Tank Car, Truck, and Ship Loaders | 8 | 11 | +3 | onet 0, ilo 17 |
| 53-7199.00 | Material Moving Workers, All Other | 15 | 13 | -1 | onet 0, ilo 19 |
| 55-1011.00 | Air Crew Officers | 43 | 1 | -42 | onet 0 |
| 55-1012.00 | Aircraft Launch and Recovery Officers | 56 | 4 | -51 | onet 4 |
| 55-1013.00 | Armored Assault Vehicle Officers | 41 | 1 | -40 | onet 0 |
| 55-1014.00 | Artillery and Missile Officers | 41 | 1 | -40 | onet 0 |
| 55-1015.00 | Command and Control Center Officers | 59 | 1 | -59 | onet 0 |
| 55-1016.00 | Infantry Officers | 41 | 1 | -40 | onet 0 |
| 55-1017.00 | Special Forces Officers | 41 | 1 | -40 | onet 0 |
| 55-1019.00 | Military Officer Special and Tactical Operations Leaders, All Other | 41 | 1 | -40 | onet 0 |
| 55-2011.00 | First-Line Supervisors of Air Crew Members | 40 | 1 | -40 | onet 0 |
| 55-2012.00 | First-Line Supervisors of Weapons Specialists/Crew Members | 41 | 1 | -40 | onet 0 |
| 55-2013.00 | First-Line Supervisors of All Other Tactical Operations Specialists | 41 | 1 | -40 | onet 0 |
| 55-3011.00 | Air Crew Members | 43 | 1 | -42 | onet 0 |
| 55-3012.00 | Aircraft Launch and Recovery Specialists | 56 | 4 | -51 | onet 4 |
| 55-3013.00 | Armored Assault Vehicle Crew Members | 15 | 1 | -14 | onet 0 |
| 55-3014.00 | Artillery and Missile Crew Members | 27 | 1 | -26 | onet 0 |
| 55-3015.00 | Command and Control Center Specialists | 79 | 6 | -72 | onet 5 |
| 55-3016.00 | Infantry | 42 | 31 | -11 | onet 17 |
| 55-3018.00 | Special Forces | 42 | 31 | -11 | onet 17 |
| 55-3019.00 | Military Enlisted Tactical Operations and Air/Weapons Specialists and Crew Members, All Other | 42 | 31 | -11 | onet 17 |
