import json, unicodedata, re
def slug(s):
    s=unicodedata.normalize('NFD',s).encode('ascii','ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+','-',s).strip('-')
SEL="Selecciones"
# name, team, league, nat, birth, playedAs, debutYear, check
C=[
("Mauricio Pellegrino","Lanús","Liga Profesional","ARG","1971-10-05","DFC",2010,1),
("Juan Pablo Vojvoda","Santos","Brasileirão","ARG","1975-01-13","DFC",2014,1),
("Hernán Crespo","São Paulo","Brasileirão","ARG","1975-07-05","DC",2015,1),
("Fernando Diniz","Vasco da Gama","Brasileirão","BRA","1974-03-27","MC",2009,1),
("Leonardo Jardim","Cruzeiro","Brasileirão","POR","1974-08-01","NJ",2003,1),
("Guido Pizarro","Tigres","Liga MX","ARG","1990-02-26","MC",2024,1),
("Domènec Torrent","Monterrey","Liga MX","ESP","1962-07-14","NJ",2010,1),
("Javier Mascherano","Inter Miami","MLS","ARG","1984-06-08","MC",2023,0),
("Jorge Jesus","Al Nassr","Saudi Pro League","POR","1954-07-24","MC",1990,1),
("Matthias Jaissle","Al-Ahli","Saudi Pro League","GER","1988-04-05","DFC",2019,1),
("Enzo Maresca","Chelsea","Premier League","ITA","1980-02-10","MC",2017,1),
("Rúben Amorim","Manchester United","Premier League","POR","1985-01-27","MC",2018,0),
("Thomas Frank","Tottenham","Premier League","DEN","1973-10-09","NJ",2008,1),
("Unai Emery","Aston Villa","Premier League","ESP","1971-11-03","MC",2004,0),
("Eddie Howe","Newcastle","Premier League","ENG","1977-11-29","DFC",2008,0),
("Oliver Glasner","Crystal Palace","Premier League","AUT","1974-08-28","DFC",2012,0),
("Marco Silva","Fulham","Premier League","POR","1977-07-12","LAT",2011,0),
("Andoni Iraola","Bournemouth","Premier League","ESP","1982-06-22","LAT",2018,0),
("Fabian Hürzeler","Brighton","Premier League","GER","1993-02-26","MC",2020,1),
("David Moyes","Everton","Premier League","SCO","1963-04-25","DFC",1998,0),
("Ernesto Valverde","Athletic Club","LaLiga","ESP","1964-02-09","DC",1997,0),
("Manuel Pellegrini","Real Betis","LaLiga","CHI","1953-09-16","DFC",1988,0),
("Matías Almeyda","Sevilla","LaLiga","ARG","1973-12-21","MC",2011,1),
("José Bordalás","Getafe","LaLiga","ESP","1964-03-05","DC",1993,1),
("Cristian Chivu","Inter","Serie A","ROU","1980-10-26","DFC",2021,1),
("Massimiliano Allegri","Milan","Serie A","ITA","1967-08-11","MC",2004,0),
("Antonio Conte","Napoli","Serie A","ITA","1969-07-31","MC",2006,0),
("Gian Piero Gasperini","Roma","Serie A","ITA","1958-01-26","MC",1994,1),
("Maurizio Sarri","Lazio","Serie A","ITA","1959-01-10","NJ",1990,0),
("Cesc Fàbregas","Como","Serie A","ESP","1987-05-04","MC",2023,0),
("Vincenzo Italiano","Bologna","Serie A","ITA","1977-12-10","MC",2014,1),
("Niko Kovač","Borussia Dortmund","Bundesliga","CRO","1971-10-15","MC",2009,0),
("Roberto De Zerbi","Olympique de Marsella","Ligue 1","ITA","1979-06-06","MCO",2010,0),
("Paulo Fonseca","Lyon","Ligue 1","POR","1973-03-05","DFC",2005,1),
("Francesco Farioli","Porto","Primeira Liga","ITA","1989-04-10","NJ",2020,1),
("José Mourinho","Benfica","Primeira Liga","POR","1963-01-26","MC",2000,1),
("Luis de la Fuente","Selección de España",SEL,"ESP","1961-06-21","LAT",2013,0),
("Roberto Martínez","Selección de Portugal",SEL,"ESP","1973-07-13","MC",2007,0),
("Ronald Koeman","Selección de Países Bajos",SEL,"NED","1963-03-21","DFC",1997,0),
("Gennaro Gattuso","Selección de Italia",SEL,"ITA","1978-01-09","MC",2011,0),
("Javier Aguirre","Selección de México",SEL,"MEX","1958-12-01","MC",1995,0),
("Hajime Moriyasu","Selección de Japón",SEL,"JPN","1968-08-23","MC",2012,0),
("Walid Regragui","Selección de Marruecos",SEL,"MAR","1975-09-23","LAT",2013,0),
("Jesse Marsch","Selección de Canadá",SEL,"USA","1973-11-08","MC",2015,0),
("Hong Myung-bo","Selección de Corea del Sur",SEL,"KOR","1969-02-12","DFC",2009,0),
("Fernando Batista","Selección de Venezuela",SEL,"ARG","1970-05-30","DFC",2010,1),
]
p='src/data/coaches.json'; data=json.load(open(p)); have={x['id'] for x in data}
for n,t,l,na,b,pa,d,chk in C:
    i=slug(n)
    if i in have: continue
    e=dict(id=i,name=n,team=t,league=l,nationality=na,birthDate=b,playedAs=pa,debutYear=d)
    if chk: e['check']=True
    data.append(e); have.add(i)
for x in data:
    if x['id']=='gustavo-alfaro': x['check']=True
    if x['id'] in ('eduardo-dominguez','enzo-maresca'): x['check']=True
json.dump(data,open(p,'w'),ensure_ascii=False,indent=1)
print(len(data))
