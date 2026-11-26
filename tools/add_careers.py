import json, unicodedata, re
def slug(s):
    s=unicodedata.normalize('NFD',s).encode('ascii','ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+','-',s).strip('-')
L=True
P={
"Jude Bellingham":("ENG","MCO",[("Birmingham City",2019,2020),("Borussia Dortmund",2020,2023),("Real Madrid",2023,None)]),
"Harry Kane":("ENG","DC",[("Tottenham",2011,2023),("Leyton Orient",2011,2012,L),("Millwall",2012,2012,L),("Norwich City",2012,2013,L),("Leicester City",2013,2013,L),("Bayern Múnich",2023,None)]),
"Robert Lewandowski":("POL","DC",[("Znicz Pruszków",2006,2008),("Lech Poznań",2008,2010),("Borussia Dortmund",2010,2014),("Bayern Múnich",2014,2022),("Barcelona",2022,None)]),
"Antoine Griezmann":("FRA","DC",[("Real Sociedad",2009,2014),("Atlético de Madrid",2014,2019),("Barcelona",2019,2021),("Atlético de Madrid",2021,None)]),
"Karim Benzema":("FRA","DC",[("Lyon",2004,2009),("Real Madrid",2009,2023),("Al-Ittihad",2023,None)]),
"Kevin De Bruyne":("BEL","MCO",[("Genk",2008,2012),("Chelsea",2012,2014),("Werder Bremen",2012,2013,L),("Wolfsburg",2014,2015),("Manchester City",2015,2025),("Napoli",2025,None)]),
"Vinícius Júnior":("BRA","EXT",[("Flamengo",2017,2018),("Real Madrid",2018,None)]),
"Mauro Icardi":("ARG","DC",[("Sampdoria",2012,2013),("Inter",2013,2019),("Paris Saint-Germain",2019,2022),("Galatasaray",2022,None)]),
"Lisandro Martínez":("ARG","DFC",[("Newell's Old Boys",2017,2018),("Defensa y Justicia",2018,2019,L),("Ajax",2019,2022),("Manchester United",2022,None)]),
"Emiliano Buendía":("ARG","MCO",[("Getafe",2014,2018),("Cultural Leonesa",2016,2017,L),("Norwich City",2018,2021),("Aston Villa",2021,None)]),
"Alejandro Garnacho":("ARG","EXT",[("Manchester United",2022,2025),("Chelsea",2025,None)]),
"Franco Mastantuono":("ARG","EXT",[("River Plate",2023,2025),("Real Madrid",2025,None)]),
"Nico Paz":("ARG","MCO",[("Real Madrid",2023,2024),("Como",2024,None)]),
"Thiago Almada":("ARG","MCO",[("Vélez Sarsfield",2018,2022),("Atlanta United",2022,2024),("Botafogo",2024,2025),("Lyon",2025,2025,L),("Atlético de Madrid",2025,None)]),
"Exequiel Palacios":("ARG","MC",[("River Plate",2016,2020),("Bayer Leverkusen",2020,None)]),
"Zlatan Ibrahimović":("SWE","DC",[("Malmö",1999,2001),("Ajax",2001,2004),("Juventus",2004,2006),("Inter",2006,2009),("Barcelona",2009,2011),("Milan",2010,2012),("Paris Saint-Germain",2012,2016),("Manchester United",2016,2018),("LA Galaxy",2018,2019),("Milan",2020,2023)]),
"Ronaldinho":("BRA","MCO",[("Grêmio",1998,2001),("Paris Saint-Germain",2001,2003),("Barcelona",2003,2008),("Milan",2008,2011),("Flamengo",2011,2012),("Atlético Mineiro",2012,2014),("Querétaro",2014,2015),("Fluminense",2015,2015)]),
"Ronaldo Nazário":("BRA","DC",[("Cruzeiro",1993,1994),("PSV",1994,1996),("Barcelona",1996,1997),("Inter",1997,2002),("Real Madrid",2002,2007),("Milan",2007,2008),("Corinthians",2009,2011)]),
"Javier Zanetti":("ARG","LAT",[("Talleres de Remedios de Escalada",1992,1993),("Banfield",1993,1995),("Inter",1995,2014)]),
"Pablo Aimar":("ARG","MCO",[("River Plate",1996,2001),("Valencia",2001,2006),("Real Zaragoza",2006,2008),("Benfica",2008,2013),("Johor Darul Ta'zim",2014,2014),("River Plate",2015,2015)]),
"Martín Palermo":("ARG","DC",[("Estudiantes",1992,1997),("Boca Juniors",1997,2001),("Villarreal",2001,2003),("Real Betis",2003,2004),("Alavés",2004,2004),("Boca Juniors",2004,2011)]),
"Javier Saviola":("ARG","DC",[("River Plate",1998,2001),("Barcelona",2001,2007),("Monaco",2004,2005,L),("Sevilla",2005,2006,L),("Real Madrid",2007,2009),("Benfica",2009,2012),("Málaga",2012,2013),("Olympiacos",2013,2014),("Hellas Verona",2014,2015),("River Plate",2015,2016)]),
"Arturo Vidal":("CHI","MC",[("Colo-Colo",2005,2007),("Bayer Leverkusen",2007,2011),("Juventus",2011,2015),("Bayern Múnich",2015,2018),("Barcelona",2018,2020),("Inter",2020,2022),("Flamengo",2022,2023),("Athletico Paranaense",2023,2023),("Colo-Colo",2024,None)]),
"Alexis Sánchez":("CHI","DC",[("Cobreloa",2005,2006),("Colo-Colo",2006,2007,L),("River Plate",2007,2008,L),("Udinese",2008,2011),("Barcelona",2011,2014),("Arsenal",2014,2018),("Manchester United",2018,2020),("Inter",2019,2022),("Olympique de Marsella",2022,2023),("Inter",2023,2024),("Udinese",2024,2025),("Sevilla",2025,None)]),
}
C={
"Antonio Conte":("ITA",[("Arezzo",2006,2007),("Bari",2007,2009),("Atalanta",2009,2010),("Siena",2010,2011),("Juventus",2011,2014),("Selección de Italia",2014,2016),("Chelsea",2016,2018),("Inter",2019,2021),("Tottenham",2021,2023),("Napoli",2024,None)]),
"Unai Emery":("ESP",[("Lorca Deportiva",2004,2006),("Almería",2006,2008),("Valencia",2008,2012),("Spartak Moscú",2012,2012),("Sevilla",2013,2016),("Paris Saint-Germain",2016,2018),("Arsenal",2018,2019),("Villarreal",2020,2022),("Aston Villa",2022,None)]),
"Massimiliano Allegri":("ITA",[("Sassuolo",2007,2008),("Cagliari",2008,2010),("Milan",2010,2014),("Juventus",2014,2019),("Juventus",2021,2024),("Milan",2025,None)]),
"Thomas Tuchel":("GER",[("Mainz",2009,2014),("Borussia Dortmund",2015,2017),("Paris Saint-Germain",2018,2020),("Chelsea",2021,2022),("Bayern Múnich",2023,2024),("Selección de Inglaterra",2025,None)]),
"Zinedine Zidane":("FRA",[("Real Madrid Castilla",2014,2016),("Real Madrid",2016,2018),("Real Madrid",2019,2021)]),
"Didier Deschamps":("FRA",[("Monaco",2001,2005),("Juventus",2006,2007),("Olympique de Marsella",2009,2012),("Selección de Francia",2012,None)]),
"Manuel Pellegrini":("CHI",[("San Lorenzo",2001,2001),("River Plate",2002,2003),("Villarreal",2004,2009),("Real Madrid",2009,2010),("Málaga",2010,2013),("Manchester City",2013,2016),("Hebei",2016,2018),("West Ham",2018,2019),("Real Betis",2020,None)]),
"Ricardo Gareca":("ARG",[("Universitario",2007,2008),("Vélez Sarsfield",2009,2013),("Palmeiras",2014,2014),("Selección de Perú",2015,2022),("Vélez Sarsfield",2023,2023),("Selección de Chile",2024,2025)]),
}
p='src/data/careers.json'; data=json.load(open(p)); have={x['id'] for x in data}
for n,(na,pos,car) in P.items():
    if slug(n) in have: continue
    data.append(dict(id=slug(n),kind="jugador",name=n,nationality=na,position=pos,career=[dict(club=c[0],**{"from":c[1]},to=c[2],**({"loan":True} if len(c)>3 else {})) for c in car]))
for n,(na,car) in C.items():
    if slug(n) in have: continue
    data.append(dict(id=slug(n),kind="dt",name=n,nationality=na,career=[{"club":c[0],"from":c[1],"to":c[2]} for c in car]))
json.dump(data,open(p,'w'),ensure_ascii=False,indent=1)
print(len(data), sum(1 for x in data if x['kind']=='jugador'), sum(1 for x in data if x['kind']=='dt'))
