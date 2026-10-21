import requests,json
B="https://ec.europa.eu/esco/api/resource/"
def occs(isco):
    r=requests.get(B+"concept",params={"uri":f"http://data.europa.eu/esco/isco/C{isco}","language":"en"}).json()
    return [x["href"] for x in r["_links"].get("narrowerOccupation",[])]
for soc,isco in [("43-4051","4222"),("15-1252","2512"),("53-3032","8332"),("29-1141","2221"),("47-2111","7411")]:
    tot=[];names=[]
    for h in occs(isco):
        o=requests.get(h).json()
        e=len(o["_links"].get("hasEssentialSkill",[]));p=len(o["_links"].get("hasOptionalSkill",[]))
        tot.append(e+p);names.append(o["title"])
    print(soc,isco,len(tot),"occs; avg skills",round(sum(tot)/max(1,len(tot)),1),"union-ish total",sum(tot),names[:4])
