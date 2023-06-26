BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "pages" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"title"	TEXT,
	"author"	INTEGER,
	"creationDate"	DATE,
	"pubblicationDate"	DATE,
	"content"	TEXT

);
CREATE TABLE IF NOT EXISTS "users" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"email" TEXT,
	"name"	TEXT,
	"salt"	TEXT,
	"hash"	TEXT,
	"amministratore" BOOLEAN
);
CREATE TABLE IF NOT EXISTS "sitename" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"type" TEXT,
	"name"	TEXT
);
CREATE TABLE IF NOT EXISTS "images" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"value"	TEXT
);

INSERT INTO "users" VALUES (1, 't1@test.it', 't1', 'hdcl4yfn94h7rtyo', 'cd162846ff198e25a6b62bf05beef4a4b673804ec0dd2749dd3f135afc06a82285e1fb10f8896ef823164e3da47438a6761048b38f3c5f0e43bec3f2b757bd6c', TRUE);
INSERT INTO "users" VALUES (2, 't2@test.it', 't2', 'hfu5kgh69dbvhr5t', '814b51fbf00552fb67b2cac59d93ce4ebd0c128557212a134e936cb9e1a8c5c5cc115a6e16d7f3b74ae35ab8ff174ef31a1f3ef543c1fddcea8ee63c9bfeee2c', FALSE);
INSERT INTO "users" VALUES (3, 't3@test.it', 't3', 'hfpsdn40uwjdf89w', 'c4a30ca115ef88c3310f20603211080eacd286907bdc3090b12b62d1467b2082c43bdddd25453a626235f2adee8b8fa549746fc042c46ae9509ce4fabab36cb8', FALSE);
INSERT INTO "users" VALUES (4, 't4@test.it', 't4', 'sdvgiyat78iauglh', '2ef62d60128c97207d67f16c6b1cc0cb6a7b7d9d6c561a80c2fe09d638ac25c2168f33facf0020366dd355fbc0a46b691239ed3ba59f26beb06998528d5227b2', FALSE);

INSERT INTO "pages" VALUES (1, 'Homepage', 1, '2023-06-05', null, '[{"type":"Header","name":"Header1","value":"Homepage header"},{"type":"Image","name":"Image2","value":"img4.jpeg"}]');
INSERT INTO "pages" VALUES (2, 'Contact', 1, '2023-06-04', '2023-06-04', '[{"type":"Header","name":"Header1","value":"Contact"},{"type":"Image","name":"Image2","value":"img4.jpeg"}]');
INSERT INTO "pages" VALUES (3, 'Pagina3', 2, '2023-06-04', null, '[{"type":"Header","name":"Header1","value":"Header di pagina 3"},{"type":"Image","name":"Image2","value":"img2.jpeg"},{"type":"Paragraph","name":"Paragraph3","value":"Paragrafo di pagina 3"}]');
INSERT INTO "pages" VALUES (4, 'Pagina4', 2, '2023-06-03', '2023-07-01', '[{"type":"Header","name":"Header1","value":"Header di pagina 4"},{"type":"Image","name":"Image2","value":"img3.jpeg"}]');
INSERT INTO "pages" VALUES (5, 'Pagina5', 3, '2023-06-02', '2023-06-02', '[{"type":"Header","name":"Header1","value":"Header di pagina 5"},{"type":"Paragraph","name":"Paragraph2","value":"Paragrafo di pagina 5"}]');
INSERT INTO "pages" VALUES (6, 'Pagina6', 3, '2023-06-01', '2023-07-01', '[{"type":"Header","name":"Header1","value":"Pagina 6 header"},{"type":"Image","name":"Image2","value":"img2.jpeg"},{"type":"Paragraph","name":"Paragraph3","value":"Paragrafo di pagina 6"}]');

INSERT INTO "sitename" VALUES (1, 'text', 'MySiteName');

INSERT INTO "images" VALUES (1, 'img1.jpeg');
INSERT INTO "images" VALUES (2, 'img2.jpeg');
INSERT INTO "images" VALUES (3, 'img3.jpeg');
INSERT INTO "images" VALUES (4, 'img4.jpeg');

COMMIT;
