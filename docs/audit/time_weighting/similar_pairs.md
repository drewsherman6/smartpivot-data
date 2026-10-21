# Near-identical jobs: score gaps (Oct 21, 2026)

885 pairs: same SOC minor group or overlapping titles, O*NET skill cosine >= 0.97, time-weighted DWA cosine >= 0.6 (similar_pairs.js).

| | cf3a6dd | d6f07d9 (AI by DWA) | now (+ driving DWAs, robots by DWA within minor group) |
|---|---|---|---|
| > 15 pts | 182 | 47 | 16 |
| > 10 pts | 324 | 116 | 84 |

## Worst pairs at d6f07d9 and now

| Job A | Job B | d6f07d9 | now |
|---|---|---|---|
| Crane and Tower Operators | Industrial Truck and Tractor Operators | 26 / 73 | 44 / 58 |
| Ambulance Drivers and Attendants, Except Emergency Medical Technicians | Taxi Drivers | 30 / 71 | 33 / 68 |
| Gambling and Sports Book Writers and Runners | Gambling Service Workers, All Other | 70 / 31 | 66 / 35 |
| Shampooers | Skincare Specialists | 58 / 19 | 28 / 21 |
| Ambulance Drivers and Attendants, Except Emergency Medical Technicians | Bus Drivers, Transit and Intercity | 30 / 67 | 33 / 72 |
| Bus Drivers, School | Taxi Drivers | 34 / 71 | 61 / 68 |
| Gambling Dealers | Gambling and Sports Book Writers and Runners | 34 / 70 | 37 / 66 |
| Crushing, Grinding, and Polishing Machine Setters, Operators, and Tenders | Furnace, Kiln, Oven, Drier, and Kettle Operators and Tenders | 59 / 24 | 53 / 35 |
| Bus Drivers, School | Bus Drivers, Transit and Intercity | 34 / 67 | 61 / 72 |
| Extruding, Forming, Pressing, and Compacting Machine Setters, Operators, and Tenders | Furnace, Kiln, Oven, Drier, and Kettle Operators and Tenders | 54 / 24 | 50 / 35 |
| Landscaping and Groundskeeping Workers | Tree Trimmers and Pruners | 39 / 8 | 27 / 17 |
| Tree Trimmers and Pruners | Grounds Maintenance Workers, All Other | 8 / 38 | 17 / 27 |
| Ambulance Drivers and Attendants, Except Emergency Medical Technicians | Shuttle Drivers and Chauffeurs | 30 / 59 | 33 / 59 |
| Histotechnologists | Histology Technicians | 43 / 17 | 39 / 22 |
| Dredge Operators | Material Moving Workers, All Other | 68 / 43 | 62 / 47 |
| Bus Drivers, School | Shuttle Drivers and Chauffeurs | 34 / 59 | 61 / 59 |
| Cooks, Institution and Cafeteria | Cooks, All Other | 16 / 41 | 22 / 32 |
| Crane and Tower Operators | Hoist and Winch Operators | 26 / 50 | 44 / 49 |
| Gas Compressor and Gas Pumping Station Operators | Pump Operators, Except Wellhead Pumpers | 29 / 53 | 40 / 42 |
| Hoist and Winch Operators | Industrial Truck and Tractor Operators | 50 / 73 | 49 / 58 |

## Remaining pairs over 15 points

| Job A | Job B | A / B |
|---|---|---|
| Ambulance Drivers and Attendants, Except Emergency Medical Technicians | Bus Drivers, Transit and Intercity | 33 / 72 |
| Ambulance Drivers and Attendants, Except Emergency Medical Technicians | Taxi Drivers | 33 / 68 |
| Gambling and Sports Book Writers and Runners | Gambling Service Workers, All Other | 66 / 35 |
| Gambling Dealers | Gambling and Sports Book Writers and Runners | 37 / 66 |
| Ambulance Drivers and Attendants, Except Emergency Medical Technicians | Bus Drivers, School | 33 / 61 |
| Ambulance Drivers and Attendants, Except Emergency Medical Technicians | Shuttle Drivers and Chauffeurs | 33 / 59 |
| Allergists and Immunologists | Physical Medicine and Rehabilitation Physicians | 41 / 21 |
| Podiatrists | General Internal Medicine Physicians | 21 / 40 |
| Cytogenetic Technologists | Histology Technicians | 41 / 22 |
| Crushing, Grinding, and Polishing Machine Setters, Operators, and Tenders | Furnace, Kiln, Oven, Drier, and Kettle Operators and Tenders | 53 / 35 |
| Histotechnologists | Histology Technicians | 39 / 22 |
| Veterinarians | Pediatricians, General | 20 / 37 |
| Dermatologists | Orthopedic Surgeons, Except Pediatric | 32 / 15 |
| Pediatricians, General | Physical Medicine and Rehabilitation Physicians | 37 / 21 |
| Dredge Operators | Material Moving Workers, All Other | 62 / 47 |
| Farm Labor Contractors | Logisticians | 29 / 44 |

Remaining causes (checked by hand): ambulance driving is rated by its own driving instances (emergency lights-and-sirens runs have no deployed driverless system: 55%); sports-book writers vs dealers and the physician pairs differ in their task mix (different O*NET activities and time shares), not in the evidence for shared activities.

## Elementary vs middle/secondary teachers

Every shared activity now has identical AI evidence (e.g. instruct students 50%, prepare/administer/grade tests 89%, plan activities 65%). The remaining ~7 points come from the task mix in O*NET / Anthropic time shares: elementary teachers spend less time on grading, evaluating and planning, have no tutoring task (middle: 4.5% of time at 48%), and more time on low-AI tasks (enforce behaviour rules 5.4%, prepare materials 5.4%, read books to the class 3.3%, remedial programs). The blended job-level measures add about 1 point (headline weight 0.9 on the task score). This is a genuine work difference, so it is documented rather than forced.
