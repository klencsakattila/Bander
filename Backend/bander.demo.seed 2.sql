-- Demo seed for bander database (dummy data)
USE bander;
SET FOREIGN_KEY_CHECKS=0;
TRUNCATE TABLE messages;
TRUNCATE TABLE thread_users;
TRUNCATE TABLE threads;
TRUNCATE TABLE posts;
TRUNCATE TABLE band_styles;
TRUNCATE TABLE user_styles;
TRUNCATE TABLE user_instruments;
TRUNCATE TABLE instruments;
TRUNCATE TABLE band_members;
TRUNCATE TABLE bands;
TRUNCATE TABLE musical_styles;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS=1;

INSERT INTO users (username,email,password_hash,first_name,last_name,city,birth_date) VALUES
('alice','alice@example.com','demo123','Alice','Smith','Budapest','1990-05-14'),
('bob','bob@example.com','demo123','Bob','Jones','Debrecen','1988-11-02'),
('charlie','charlie@example.com','demo123','Charlie','Kovacs','Szeged','1995-07-22'),
('khorvath','khorvath@bander.dev','demo123','Kata','Horvath','Kecskemet','1986-02-27'),
('sszabo','sszabo@bander.dev','demo123','Sara','Szabo','Gyor','2003-01-17'),
('gkiss','gkiss@bander.dev','demo123','Gabor','Kiss','Debrecen','1998-07-03'),
('htoth','htoth@bander.dev','demo123','Hanna','Toth','Szekesfehervar','1998-01-27'),
('tszabo','tszabo@bander.dev','demo123','Tamas','Szabo','Miskolc','2003-01-19'),
('ttakacs','ttakacs@bander.dev','demo123','Tamas','Takacs','Budapest','1992-01-18'),
('efarkas','efarkas@bander.dev','demo123','Eszter','Farkas','Kecskemet','1989-09-04'),
('tfarkas','tfarkas@bander.dev','demo123','Tamas','Farkas','Szekesfehervar','1990-02-19'),
('tkovacs','tkovacs@bander.dev','demo123','Tamas','Kovacs','Gyor','1988-09-23'),
('cszilagyi','cszilagyi@bander.dev','demo123','Csenge','Szilagyi','Budapest','1991-08-22'),
('sjuhasz','sjuhasz@bander.dev','demo123','Sara','Juhasz','Gyor','1999-10-15'),
('lfarkas','lfarkas@bander.dev','demo123','Lili','Farkas','Miskolc','1990-12-25'),
('htoth1','htoth1@bander.dev','demo123','Hanna','Toth','Szombathely','1994-09-16'),
('kmeszaro','kmeszaro@bander.dev','demo123','Kata','Meszaro','Pecs','1987-02-17'),
('nvarga','nvarga@bander.dev','demo123','Noemi','Varga','Gyor','1989-08-14'),
('btoth','btoth@bander.dev','demo123','Bence','Toth','Szekesfehervar','2003-06-11'),
('npapp','npapp@bander.dev','demo123','Nora','Papp','Szombathely','2000-10-26'),
('ototh','ototh@bander.dev','demo123','Orsi','Toth','Debrecen','1993-08-23'),
('btoth1','btoth1@bander.dev','demo123','Balazs','Toth','Budapest','1994-11-19'),
('bmeszaro','bmeszaro@bander.dev','demo123','Balazs','Meszaro','Pecs','1997-11-12'),
('ameszaro','ameszaro@bander.dev','demo123','Attila','Meszaro','Gyor','1990-10-04'),
('pkiss','pkiss@bander.dev','demo123','Petra','Kiss','Miskolc','1994-03-24'),
('htakacs','htakacs@bander.dev','demo123','Hanna','Takacs','Kecskemet','2000-02-06'),
('otakacs','otakacs@bander.dev','demo123','Orsi','Takacs','Szekesfehervar','1993-03-27'),
('nfekete','nfekete@bander.dev','demo123','Noemi','Fekete','Pecs','1998-06-22'),
('mmolnar','mmolnar@bander.dev','demo123','Mate','Molnar','Szeged','1987-03-05'),
('hmolnar','hmolnar@bander.dev','demo123','Hanna','Molnar','Budapest','2000-10-06');

INSERT INTO bands (name,city) VALUES
('The Rockets','Budapest'),
('Blue Notes','Szeged'),
('Neon Horizon','Gyor'),
('Duna Groove','Budapest'),
('Paprika Funk','Pecs'),
('Midnight Tram','Debrecen'),
('Danube Echo','Szekesfehervar'),
('Silver Lake Trio','Miskolc');

INSERT INTO band_members (band_id,user_id,role) VALUES
(1,9,'bass'),
(1,2,'violin'),
(1,25,'keys'),
(1,6,'violin'),
(1,30,'bass'),
(1,28,'dj'),
(2,23,'violin'),
(2,11,'guitar'),
(2,3,'keys'),
(2,9,'vocals'),
(2,2,'guitar'),
(2,30,'keys'),
(2,6,'guitar'),
(3,3,'vocals'),
(3,9,'sax'),
(3,28,'dj'),
(3,4,'violin'),
(3,15,'keys'),
(4,2,'bass'),
(4,17,'keys'),
(4,23,'vocals'),
(4,8,'bass'),
(4,4,'drums'),
(5,21,'producer'),
(5,10,'dj'),
(5,17,'bass'),
(5,25,'keys'),
(5,7,'sax'),
(5,29,'vocals'),
(6,2,'drums'),
(6,1,'dj'),
(6,29,'producer'),
(6,24,'drums'),
(6,17,'producer'),
(6,18,'guitar'),
(7,22,'drums'),
(7,16,'drums'),
(7,18,'sax'),
(7,27,'drums'),
(7,13,'bass'),
(7,17,'violin'),
(7,10,'sax'),
(8,27,'keys'),
(8,5,'violin'),
(8,1,'bass'),
(8,3,'vocals');

INSERT INTO instruments (name) VALUES
('Vocals'),
('Guitar'),
('Electric Guitar'),
('Bass'),
('Drums'),
('Keys'),
('Synth'),
('Saxophone'),
('Violin'),
('Trumpet'),
('Percussion'),
('DJ');

INSERT INTO user_instruments (user_id,instrument_id,skill_level) VALUES
(1,5,'beginner'),
(1,1,'intermediate'),
(2,10,'intermediate'),
(2,6,'intermediate'),
(2,3,'intermediate'),
(3,12,'advanced'),
(3,1,'advanced'),
(3,8,'advanced'),
(4,7,'intermediate'),
(4,12,'intermediate'),
(4,11,'intermediate'),
(5,2,'advanced'),
(6,3,'intermediate'),
(6,2,'beginner'),
(7,10,'beginner'),
(8,6,'intermediate'),
(9,4,'intermediate'),
(10,11,'beginner'),
(11,10,'intermediate'),
(11,6,'beginner'),
(12,8,'intermediate'),
(12,12,'beginner'),
(13,12,'intermediate'),
(14,8,'intermediate'),
(14,3,'beginner'),
(15,6,'advanced'),
(15,3,'advanced'),
(15,9,'beginner'),
(16,2,'intermediate'),
(16,5,'beginner'),
(16,9,'advanced'),
(17,9,'intermediate'),
(17,12,'intermediate'),
(17,6,'advanced'),
(18,4,'advanced'),
(19,4,'intermediate'),
(19,12,'advanced'),
(19,9,'advanced'),
(20,8,'beginner'),
(20,5,'intermediate'),
(21,8,'advanced'),
(21,6,'intermediate'),
(22,2,'beginner'),
(23,6,'beginner'),
(24,10,'advanced'),
(24,1,'intermediate'),
(24,8,'intermediate'),
(25,2,'intermediate'),
(25,7,'beginner'),
(25,4,'advanced'),
(26,2,'intermediate'),
(26,7,'advanced'),
(27,12,'beginner'),
(28,1,'beginner'),
(29,11,'intermediate'),
(29,3,'intermediate'),
(30,11,'beginner'),
(30,6,'intermediate');

INSERT INTO musical_styles (name) VALUES
('Rock'),
('Pop'),
('Jazz'),
('Blues'),
('Funk'),
('Metal'),
('Indie'),
('Hip-Hop'),
('Electronic'),
('Folk');

INSERT INTO user_styles (user_id,style_id) VALUES
(1,1),
(2,9),
(3,7),
(3,4),
(4,1),
(4,5),
(5,5),
(5,9),
(6,10),
(6,6),
(7,9),
(7,7),
(7,3),
(8,6),
(9,10),
(9,9),
(9,7),
(9,8),
(10,9),
(10,3),
(11,8),
(12,10),
(12,1),
(13,3),
(13,10),
(14,10),
(14,2),
(14,1),
(14,3),
(15,2),
(15,9),
(15,1),
(15,10),
(16,5),
(16,1),
(17,9),
(18,9),
(18,1),
(18,2),
(18,4),
(19,10),
(19,9),
(19,4),
(20,8),
(20,9),
(20,10),
(21,9),
(21,5),
(22,8),
(22,3),
(23,2),
(23,7),
(23,8),
(23,3),
(24,4),
(25,2),
(25,4),
(25,5),
(25,7),
(26,3),
(27,3),
(27,5),
(27,10),
(28,4),
(28,2),
(28,7),
(28,10),
(29,4),
(29,3),
(30,9),
(30,7),
(30,6),
(30,4);

INSERT INTO band_styles (band_id,style_id) VALUES
(1,6),
(2,2),
(2,6),
(3,6),
(4,8),
(4,10),
(4,1),
(5,6),
(5,9),
(6,5),
(6,9),
(6,2),
(7,4),
(8,2);

INSERT INTO posts (user_id, band_id, post_type, post_message, created_at) VALUES
(NULL,7,'general','We need a keys player for synth-pop set.','2025-11-04 01:56:00'),
(NULL,8,'search','We need a keys player for synth-pop set.','2025-11-23 09:24:00'),
(NULL,6,'general','Selling spare guitar amp, DM me.','2025-12-09 02:38:00'),
(10,NULL,'search','Gig this Friday, doors 19:00.','2026-01-18 23:16:00'),
(NULL,5,'general','Searching for a bassist who loves groove.','2025-12-18 16:51:00'),
(NULL,5,'general','Gig this Friday, doors 19:00.','2025-11-28 15:38:00'),
(NULL,5,'announcement','Searching for a bassist who loves groove.','2026-01-08 15:07:00'),
(5,NULL,'general','Rehearsal room booked for Saturday.','2025-11-30 22:54:00'),
(5,NULL,'search','Rehearsal room booked for Saturday.','2025-10-29 05:38:00'),
(23,NULL,'general','Studio day booked — writing new material.','2025-10-21 17:32:00'),
(25,NULL,'general','Looking for a committed drummer for weekly rehearsals.','2025-10-23 14:49:00'),
(22,NULL,'general','Searching for a bassist who loves groove.','2026-01-09 09:38:00'),
(NULL,6,'general','Studio day booked — writing new material.','2025-11-22 16:37:00'),
(21,NULL,'general','Searching for a bassist who loves groove.','2025-11-18 01:40:00'),
(NULL,2,'general','Selling spare guitar amp, DM me.','2025-11-12 06:58:00'),
(NULL,8,'search','New single out now — check it on Spotify!','2025-12-17 01:54:00'),
(8,NULL,'general','Looking for bandmates: indie/alt, Budapest.','2025-11-16 21:36:00'),
(NULL,5,'general','Rehearsal room booked for Saturday.','2025-10-30 13:28:00'),
(NULL,3,'announcement','We need a keys player for synth-pop set.','2025-10-31 15:32:00'),
(NULL,1,'announcement','New single out now — check it on Spotify!','2025-10-23 02:57:00'),
(NULL,5,'announcement','Looking for bandmates: indie/alt, Budapest.','2026-01-03 16:28:00'),
(NULL,2,'general','Looking for a committed drummer for weekly rehearsals.','2025-12-12 19:36:00'),
(15,NULL,'general','Studio day booked — writing new material.','2025-12-24 03:36:00'),
(NULL,3,'general','We need a keys player for synth-pop set.','2025-12-04 05:02:00'),
(17,NULL,'search','New single out now — check it on Spotify!','2025-10-20 22:26:00'),
(NULL,8,'announcement','Gig this Friday, doors 19:00.','2026-01-18 17:57:00'),
(NULL,5,'general','Studio day booked — writing new material.','2025-12-05 21:20:00'),
(NULL,6,'search','Jam session next week, everyone welcome.','2025-11-30 05:41:00'),
(NULL,1,'general','We need a keys player for synth-pop set.','2025-12-17 22:36:00'),
(NULL,2,'announcement','Studio day booked — writing new material.','2025-12-15 08:23:00'),
(NULL,5,'general','Gig this Friday, doors 19:00.','2025-12-19 01:13:00'),
(NULL,4,'general','Studio day booked — writing new material.','2026-01-15 13:15:00'),
(18,NULL,'general','New single out now — check it on Spotify!','2026-01-12 10:14:00'),
(NULL,3,'general','We need a keys player for synth-pop set.','2025-11-18 07:42:00'),
(5,NULL,'search','Studio day booked — writing new material.','2025-12-07 00:21:00'),
(NULL,5,'announcement','Searching for a bassist who loves groove.','2025-12-11 18:05:00'),
(4,NULL,'search','Gig this Friday, doors 19:00.','2026-01-10 03:08:00'),
(16,NULL,'general','Looking for bandmates: indie/alt, Budapest.','2025-12-07 19:13:00'),
(NULL,4,'search','Gig this Friday, doors 19:00.','2025-12-06 16:35:00'),
(NULL,6,'search','Rehearsal room booked for Saturday.','2025-12-25 08:53:00'),
(13,NULL,'announcement','Selling spare guitar amp, DM me.','2025-12-23 21:23:00'),
(NULL,1,'announcement','Rehearsal room booked for Saturday.','2025-12-04 04:57:00'),
(NULL,4,'search','Searching for a bassist who loves groove.','2025-11-30 20:59:00'),
(NULL,5,'general','Looking for a committed drummer for weekly rehearsals.','2026-01-03 08:13:00'),
(29,NULL,'general','Rehearsal room booked for Saturday.','2025-11-18 09:36:00'),
(NULL,8,'general','Searching for a bassist who loves groove.','2026-01-06 02:31:00'),
(NULL,2,'general','Looking for bandmates: indie/alt, Budapest.','2026-01-08 15:51:00'),
(NULL,3,'search','Looking for a committed drummer for weekly rehearsals.','2025-10-28 11:21:00'),
(21,NULL,'search','Studio day booked — writing new material.','2025-10-22 06:34:00'),
(NULL,4,'announcement','Searching for a bassist who loves groove.','2025-11-04 09:40:00'),
(NULL,8,'search','Jam session next week, everyone welcome.','2025-10-29 02:10:00'),
(NULL,4,'search','Studio day booked — writing new material.','2025-10-20 13:21:00'),
(NULL,4,'announcement','Studio day booked — writing new material.','2026-01-09 01:26:00'),
(30,NULL,'announcement','Looking for bandmates: indie/alt, Budapest.','2026-01-14 11:19:00'),
(12,NULL,'general','Searching for a bassist who loves groove.','2026-01-18 23:53:00'),
(3,NULL,'search','Searching for a bassist who loves groove.','2025-12-11 03:26:00'),
(NULL,5,'general','We need a keys player for synth-pop set.','2026-01-05 14:09:00'),
(29,NULL,'search','Studio day booked — writing new material.','2025-10-26 08:02:00'),
(NULL,7,'search','Looking for a committed drummer for weekly rehearsals.','2025-11-04 05:14:00'),
(NULL,1,'search','Looking for bandmates: indie/alt, Budapest.','2025-12-09 10:33:00');

INSERT INTO threads (created_at) VALUES
('2025-12-30 19:40:00'),
('2025-12-25 20:40:00'),
('2025-12-22 12:40:00'),
('2026-01-14 04:40:00'),
('2025-12-08 22:40:00'),
('2025-12-08 13:40:00'),
('2026-01-17 09:40:00'),
('2025-12-10 08:40:00'),
('2025-12-05 10:40:00'),
('2025-11-19 23:40:00'),
('2025-11-28 06:40:00'),
('2025-12-16 18:40:00'),
('2025-12-18 05:40:00'),
('2026-01-16 03:40:00'),
('2025-12-03 20:40:00');

INSERT INTO thread_users (thread_id,user_id) VALUES
(1,9),
(1,28),
(2,7),
(2,14),
(3,15),
(3,28),
(4,11),
(4,16),
(5,10),
(5,30),
(6,18),
(6,23),
(7,5),
(7,29),
(8,1),
(8,16),
(9,12),
(9,30),
(10,1),
(10,19),
(11,18),
(11,24),
(12,11),
(12,12),
(13,6),
(13,14),
(13,26),
(14,1),
(14,10),
(14,18),
(15,10),
(15,21),
(15,29);

INSERT INTO messages (thread_id,sender_id,message,sent_at) VALUES
(1,9,'Kezdjünk 2 számmal bemelegítésnek.','2025-12-07 15:58:00'),
(1,9,'Mikor tudnánk próbálni?','2025-12-07 16:49:00'),
(1,9,'Hozok metronómot és felvevőt.','2025-12-07 18:23:00'),
(1,28,'Hozok metronómot és felvevőt.','2025-12-07 21:02:00'),
(1,9,'Mikor tudnánk próbálni?','2025-12-08 00:00:00'),
(1,28,'Mikor tudnánk próbálni?','2025-12-08 01:18:00'),
(1,9,'Milyen stílusban gondolkodsz?','2025-12-08 01:26:00'),
(1,9,'Rock / pop, de jöhet egy kis funk is.','2025-12-08 03:29:00'),
(1,28,'Köszi, hogy írtál!','2025-12-08 04:35:00'),
(1,28,'Oké, várom!','2025-12-08 05:10:00'),
(1,28,'Igen, a belvárosban.','2025-12-08 05:14:00'),
(1,28,'Van próbatermed?','2025-12-08 07:51:00'),
(1,9,'Hozok metronómot és felvevőt.','2025-12-08 09:14:00'),
(1,28,'Deal. Találkozunk!','2025-12-08 11:48:00'),
(1,9,'Dobnál pár demót?','2025-12-08 13:30:00'),
(1,9,'Küldök linket mindjárt.','2025-12-08 15:16:00'),
(1,9,'Persze, este 8 jó.','2025-12-08 17:21:00'),
(1,28,'Igen, a belvárosban.','2025-12-08 19:12:00'),
(2,7,'Dobnál pár demót?','2025-12-09 14:06:00'),
(2,14,'Oké, várom!','2025-12-09 16:02:00'),
(2,7,'Küldök linket mindjárt.','2025-12-09 16:38:00'),
(2,14,'Kezdjünk 2 számmal bemelegítésnek.','2025-12-09 19:18:00'),
(2,7,'Rock / pop, de jöhet egy kis funk is.','2025-12-09 20:35:00'),
(2,14,'Mikor tudnánk próbálni?','2025-12-09 23:02:00'),
(2,14,'Deal. Találkozunk!','2025-12-10 00:09:00'),
(2,14,'Dobnál pár demót?','2025-12-10 02:03:00'),
(2,7,'Igen, a belvárosban.','2025-12-10 03:07:00'),
(2,7,'Van próbatermed?','2025-12-10 04:21:00'),
(2,7,'Hozok metronómot és felvevőt.','2025-12-10 04:39:00'),
(2,14,'Mikor tudnánk próbálni?','2025-12-10 05:43:00'),
(2,7,'Rock / pop, de jöhet egy kis funk is.','2025-12-10 08:32:00'),
(3,15,'Oké, várom!','2025-12-07 11:41:00'),
(3,28,'Deal. Találkozunk!','2025-12-07 11:53:00'),
(3,28,'Küldök linket mindjárt.','2025-12-07 12:25:00'),
(3,15,'Dobnál pár demót?','2025-12-07 15:00:00'),
(3,15,'Milyen stílusban gondolkodsz?','2025-12-07 16:37:00'),
(3,15,'Kezdjünk 2 számmal bemelegítésnek.','2025-12-07 19:13:00'),
(3,28,'Szia! Ráérsz ma egy gyors egyeztetésre?','2025-12-07 19:42:00'),
(3,28,'Dobnál pár demót?','2025-12-07 19:53:00'),
(3,28,'Hozok metronómot és felvevőt.','2025-12-07 20:31:00'),
(3,15,'Dobnál pár demót?','2025-12-07 21:38:00'),
(3,15,'Dobnál pár demót?','2025-12-07 21:42:00'),
(3,28,'Nincs mit :)','2025-12-08 00:37:00'),
(3,28,'Igen, a belvárosban.','2025-12-08 03:17:00'),
(3,28,'Milyen stílusban gondolkodsz?','2025-12-08 04:11:00'),
(3,15,'Oké, várom!','2025-12-08 06:33:00'),
(3,28,'Milyen stílusban gondolkodsz?','2025-12-08 08:19:00'),
(3,15,'Köszi, hogy írtál!','2025-12-08 11:10:00'),
(3,15,'Milyen stílusban gondolkodsz?','2025-12-08 13:59:00'),
(3,15,'Köszi, hogy írtál!','2025-12-08 16:59:00'),
(4,16,'Nincs mit :)','2025-12-31 13:55:00'),
(4,16,'Deal. Találkozunk!','2025-12-31 15:43:00'),
(4,16,'Szia! Ráérsz ma egy gyors egyeztetésre?','2025-12-31 17:18:00'),
(4,11,'Köszi, hogy írtál!','2025-12-31 19:03:00'),
(4,11,'Szia! Ráérsz ma egy gyors egyeztetésre?','2025-12-31 20:56:00'),
(4,11,'Nincs mit :)','2025-12-31 21:27:00'),
(4,11,'Köszi, hogy írtál!','2025-12-31 23:56:00'),
(4,16,'Kezdjünk 2 számmal bemelegítésnek.','2026-01-01 00:39:00'),
(4,11,'Szia! Ráérsz ma egy gyors egyeztetésre?','2026-01-01 00:54:00'),
(4,11,'Köszi, hogy írtál!','2026-01-01 01:18:00'),
(4,16,'Igen, a belvárosban.','2026-01-01 01:57:00'),
(4,16,'Szombat délután oké.','2026-01-01 02:40:00'),
(4,11,'Milyen stílusban gondolkodsz?','2026-01-01 03:09:00'),
(4,16,'Oké, várom!','2026-01-01 04:01:00'),
(4,16,'Van próbatermed?','2026-01-01 04:14:00'),
(4,16,'Hozok metronómot és felvevőt.','2026-01-01 04:29:00'),
(5,10,'Igen, a belvárosban.','2026-01-14 18:25:00'),
(5,10,'Köszi, hogy írtál!','2026-01-14 21:04:00'),
(5,10,'Oké, várom!','2026-01-14 21:52:00'),
(5,10,'Persze, este 8 jó.','2026-01-14 23:36:00'),
(5,10,'Köszi, hogy írtál!','2026-01-15 01:09:00'),
(5,10,'Van próbatermed?','2026-01-15 02:14:00'),
(5,10,'Persze, este 8 jó.','2026-01-15 04:39:00'),
(5,10,'Hozok metronómot és felvevőt.','2026-01-15 05:11:00'),
(5,30,'Kezdjünk 2 számmal bemelegítésnek.','2026-01-15 07:33:00'),
(5,30,'Nincs mit :)','2026-01-15 08:53:00'),
(5,10,'Nincs mit :)','2026-01-15 10:34:00'),
(5,30,'Kezdjünk 2 számmal bemelegítésnek.','2026-01-15 12:44:00'),
(5,30,'Igen, a belvárosban.','2026-01-15 12:51:00'),
(5,10,'Oké, várom!','2026-01-15 14:52:00'),
(5,10,'Kezdjünk 2 számmal bemelegítésnek.','2026-01-15 17:32:00'),
(5,30,'Igen, a belvárosban.','2026-01-15 19:35:00'),
(5,30,'Rock / pop, de jöhet egy kis funk is.','2026-01-15 19:54:00'),
(5,10,'Deal. Találkozunk!','2026-01-15 21:46:00'),
(5,30,'Milyen stílusban gondolkodsz?','2026-01-15 23:41:00'),
(5,10,'Persze, este 8 jó.','2026-01-16 02:25:00'),
(5,10,'Milyen stílusban gondolkodsz?','2026-01-16 03:47:00'),
(6,23,'Van próbatermed?','2025-12-10 09:48:00'),
(6,18,'Rock / pop, de jöhet egy kis funk is.','2025-12-10 10:39:00'),
(6,18,'Oké, várom!','2025-12-10 11:54:00'),
(6,18,'Küldök linket mindjárt.','2025-12-10 12:12:00'),
(6,23,'Mikor tudnánk próbálni?','2025-12-10 12:54:00'),
(6,23,'Mikor tudnánk próbálni?','2025-12-10 14:52:00'),
(6,18,'Mikor tudnánk próbálni?','2025-12-10 17:02:00'),
(6,23,'Dobnál pár demót?','2025-12-10 19:35:00'),
(6,23,'Küldök linket mindjárt.','2025-12-10 20:58:00'),
(6,23,'Persze, este 8 jó.','2025-12-10 21:50:00'),
(6,18,'Köszi, hogy írtál!','2025-12-10 22:33:00'),
(6,23,'Hozok metronómot és felvevőt.','2025-12-11 00:11:00'),
(6,18,'Mikor tudnánk próbálni?','2025-12-11 00:42:00'),
(6,18,'Deal. Találkozunk!','2025-12-11 02:39:00'),
(6,18,'Mikor tudnánk próbálni?','2025-12-11 04:58:00'),
(6,23,'Deal. Találkozunk!','2025-12-11 06:07:00'),
(6,23,'Deal. Találkozunk!','2025-12-11 08:36:00'),
(6,18,'Deal. Találkozunk!','2025-12-11 10:02:00'),
(6,18,'Kezdjünk 2 számmal bemelegítésnek.','2025-12-11 11:02:00'),
(6,18,'Persze, este 8 jó.','2025-12-11 12:19:00'),
(7,29,'Szia! Ráérsz ma egy gyors egyeztetésre?','2025-12-21 13:50:00'),
(7,5,'Van próbatermed?','2025-12-21 15:06:00'),
(7,29,'Nincs mit :)','2025-12-21 17:19:00'),
(7,29,'Persze, este 8 jó.','2025-12-21 17:54:00'),
(7,29,'Küldök linket mindjárt.','2025-12-21 20:32:00'),
(7,5,'Szia! Ráérsz ma egy gyors egyeztetésre?','2025-12-21 20:47:00'),
(7,5,'Deal. Találkozunk!','2025-12-21 22:06:00'),
(7,5,'Deal. Találkozunk!','2025-12-22 00:24:00'),
(7,5,'Nincs mit :)','2025-12-22 02:55:00'),
(7,29,'Van próbatermed?','2025-12-22 03:49:00'),
(7,29,'Oké, várom!','2025-12-22 04:31:00'),
(7,5,'Szia! Ráérsz ma egy gyors egyeztetésre?','2025-12-22 05:35:00'),
(7,5,'Kezdjünk 2 számmal bemelegítésnek.','2025-12-22 06:01:00'),
(7,5,'Van próbatermed?','2025-12-22 08:53:00'),
(7,29,'Köszi, hogy írtál!','2025-12-22 10:02:00'),
(7,5,'Persze, este 8 jó.','2025-12-22 12:49:00'),
(7,29,'Kezdjünk 2 számmal bemelegítésnek.','2025-12-22 15:25:00'),
(7,29,'Küldök linket mindjárt.','2025-12-22 16:09:00'),
(7,5,'Persze, este 8 jó.','2025-12-22 16:26:00'),
(7,5,'Köszi, hogy írtál!','2025-12-22 17:15:00'),
(8,1,'Szia! Ráérsz ma egy gyors egyeztetésre?','2025-12-15 12:18:00'),
(8,1,'Van próbatermed?','2025-12-15 14:05:00'),
(8,1,'Nincs mit :)','2025-12-15 16:43:00'),
(8,1,'Szombat délután oké.','2025-12-15 17:01:00'),
(8,16,'Persze, este 8 jó.','2025-12-15 19:05:00'),
(8,1,'Köszi, hogy írtál!','2025-12-15 20:58:00'),
(8,16,'Milyen stílusban gondolkodsz?','2025-12-15 23:47:00'),
(8,16,'Igen, a belvárosban.','2025-12-16 00:46:00'),
(8,1,'Mikor tudnánk próbálni?','2025-12-16 01:47:00'),
(8,1,'Rock / pop, de jöhet egy kis funk is.','2025-12-16 03:14:00'),
(8,16,'Persze, este 8 jó.','2025-12-16 04:24:00'),
(8,16,'Mikor tudnánk próbálni?','2025-12-16 05:41:00'),
(8,1,'Milyen stílusban gondolkodsz?','2025-12-16 07:52:00'),
(8,1,'Igen, a belvárosban.','2025-12-16 09:00:00'),
(8,1,'Dobnál pár demót?','2025-12-16 09:42:00'),
(9,30,'Küldök linket mindjárt.','2025-12-17 17:19:00'),
(9,30,'Oké, várom!','2025-12-17 19:36:00'),
(9,12,'Szia! Ráérsz ma egy gyors egyeztetésre?','2025-12-17 21:29:00'),
(9,12,'Szombat délután oké.','2025-12-17 22:25:00'),
(9,30,'Milyen stílusban gondolkodsz?','2025-12-18 00:51:00'),
(9,12,'Van próbatermed?','2025-12-18 01:01:00'),
(9,12,'Rock / pop, de jöhet egy kis funk is.','2025-12-18 01:30:00'),
(9,12,'Deal. Találkozunk!','2025-12-18 02:08:00'),
(9,12,'Szia! Ráérsz ma egy gyors egyeztetésre?','2025-12-18 02:20:00'),
(9,12,'Persze, este 8 jó.','2025-12-18 05:20:00'),
(9,12,'Persze, este 8 jó.','2025-12-18 05:38:00'),
(9,30,'Dobnál pár demót?','2025-12-18 07:56:00'),
(9,12,'Köszi, hogy írtál!','2025-12-18 08:25:00'),
(9,12,'Dobnál pár demót?','2025-12-18 09:19:00'),
(9,12,'Persze, este 8 jó.','2025-12-18 09:29:00'),
(9,12,'Szombat délután oké.','2025-12-18 11:33:00'),
(9,12,'Van próbatermed?','2025-12-18 12:00:00'),
(10,19,'Hozok metronómot és felvevőt.','2025-12-18 15:30:00'),
(10,19,'Szia! Ráérsz ma egy gyors egyeztetésre?','2025-12-18 17:01:00'),
(10,19,'Szombat délután oké.','2025-12-18 17:15:00'),
(10,19,'Hozok metronómot és felvevőt.','2025-12-18 19:51:00'),
(10,19,'Szombat délután oké.','2025-12-18 22:31:00'),
(10,1,'Nincs mit :)','2025-12-18 22:40:00'),
(10,19,'Rock / pop, de jöhet egy kis funk is.','2025-12-19 00:10:00'),
(10,19,'Persze, este 8 jó.','2025-12-19 02:29:00'),
(10,1,'Milyen stílusban gondolkodsz?','2025-12-19 04:58:00'),
(10,19,'Igen, a belvárosban.','2025-12-19 06:51:00'),
(10,1,'Dobnál pár demót?','2025-12-19 08:06:00'),
(10,1,'Szia! Ráérsz ma egy gyors egyeztetésre?','2025-12-19 09:37:00'),
(10,19,'Rock / pop, de jöhet egy kis funk is.','2025-12-19 11:44:00'),
(10,1,'Oké, várom!','2025-12-19 14:17:00'),
(10,19,'Mikor tudnánk próbálni?','2025-12-19 16:46:00'),
(10,1,'Szombat délután oké.','2025-12-19 17:42:00'),
(10,1,'Oké, várom!','2025-12-19 18:26:00'),
(10,1,'Milyen stílusban gondolkodsz?','2025-12-19 20:33:00'),
(10,1,'Hozok metronómot és felvevőt.','2025-12-19 22:06:00'),
(10,1,'Köszi, hogy írtál!','2025-12-19 23:49:00'),
(10,1,'Nincs mit :)','2025-12-20 02:36:00'),
(10,1,'Deal. Találkozunk!','2025-12-20 03:30:00'),
(11,18,'Köszi, hogy írtál!','2025-12-21 18:23:00'),
(11,18,'Kezdjünk 2 számmal bemelegítésnek.','2025-12-21 18:57:00'),
(11,18,'Deal. Találkozunk!','2025-12-21 21:27:00'),
(11,24,'Van próbatermed?','2025-12-21 23:24:00'),
(11,24,'Igen, a belvárosban.','2025-12-22 01:24:00'),
(11,24,'Mikor tudnánk próbálni?','2025-12-22 03:54:00'),
(11,18,'Van próbatermed?','2025-12-22 05:21:00'),
(11,24,'Küldök linket mindjárt.','2025-12-22 07:32:00'),
(11,18,'Mikor tudnánk próbálni?','2025-12-22 08:51:00'),
(11,18,'Van próbatermed?','2025-12-22 09:56:00'),
(11,24,'Deal. Találkozunk!','2025-12-22 10:39:00'),
(11,18,'Hozok metronómot és felvevőt.','2025-12-22 11:29:00'),
(11,24,'Rock / pop, de jöhet egy kis funk is.','2025-12-22 12:13:00'),
(11,18,'Dobnál pár demót?','2025-12-22 13:53:00'),
(11,18,'Van próbatermed?','2025-12-22 15:12:00'),
(11,24,'Nincs mit :)','2025-12-22 16:24:00'),
(12,11,'Mikor tudnánk próbálni?','2025-12-11 20:34:00'),
(12,12,'Kezdjünk 2 számmal bemelegítésnek.','2025-12-11 20:44:00'),
(12,11,'Köszi, hogy írtál!','2025-12-11 22:37:00'),
(12,11,'Szombat délután oké.','2025-12-12 00:37:00'),
(12,11,'Van próbatermed?','2025-12-12 01:44:00'),
(12,12,'Szia! Ráérsz ma egy gyors egyeztetésre?','2025-12-12 02:48:00'),
(12,12,'Nincs mit :)','2025-12-12 03:48:00'),
(12,11,'Igen, a belvárosban.','2025-12-12 06:34:00'),
(12,11,'Kezdjünk 2 számmal bemelegítésnek.','2025-12-12 08:26:00'),
(12,12,'Mikor tudnánk próbálni?','2025-12-12 11:08:00'),
(12,11,'Nincs mit :)','2025-12-12 12:12:00'),
(12,12,'Igen, a belvárosban.','2025-12-12 13:18:00'),
(12,12,'Oké, várom!','2025-12-12 15:16:00'),
(12,11,'Nincs mit :)','2025-12-12 17:30:00'),
(12,11,'Hozok metronómot és felvevőt.','2025-12-12 17:34:00'),
(13,6,'Mikor tudnánk próbálni?','2026-01-05 13:01:00'),
(13,6,'Igen, a belvárosban.','2026-01-05 13:54:00'),
(13,26,'Deal. Találkozunk!','2026-01-05 14:21:00'),
(13,26,'Kezdjünk 2 számmal bemelegítésnek.','2026-01-05 16:41:00'),
(13,6,'Oké, várom!','2026-01-05 18:54:00'),
(13,6,'Deal. Találkozunk!','2026-01-05 21:09:00'),
(13,14,'Nincs mit :)','2026-01-05 23:07:00'),
(13,6,'Igen, a belvárosban.','2026-01-06 00:49:00'),
(13,26,'Rock / pop, de jöhet egy kis funk is.','2026-01-06 03:28:00'),
(13,14,'Persze, este 8 jó.','2026-01-06 04:34:00'),
(13,14,'Köszi, hogy írtál!','2026-01-06 06:18:00'),
(13,6,'Szia! Ráérsz ma egy gyors egyeztetésre?','2026-01-06 06:39:00'),
(13,14,'Nincs mit :)','2026-01-06 09:21:00'),
(13,26,'Deal. Találkozunk!','2026-01-06 11:51:00'),
(13,14,'Rock / pop, de jöhet egy kis funk is.','2026-01-06 12:50:00'),
(13,14,'Köszi, hogy írtál!','2026-01-06 15:06:00'),
(13,6,'Köszi, hogy írtál!','2026-01-06 17:06:00'),
(13,6,'Igen, a belvárosban.','2026-01-06 17:41:00'),
(14,10,'Küldök linket mindjárt.','2026-01-14 13:19:00'),
(14,10,'Nincs mit :)','2026-01-14 15:20:00'),
(14,10,'Van próbatermed?','2026-01-14 17:22:00'),
(14,10,'Küldök linket mindjárt.','2026-01-14 18:32:00'),
(14,18,'Köszi, hogy írtál!','2026-01-14 21:29:00'),
(14,10,'Nincs mit :)','2026-01-15 00:24:00'),
(14,1,'Oké, várom!','2026-01-15 00:26:00'),
(14,18,'Mikor tudnánk próbálni?','2026-01-15 01:59:00'),
(14,1,'Szombat délután oké.','2026-01-15 03:23:00'),
(14,10,'Oké, várom!','2026-01-15 05:14:00'),
(14,18,'Milyen stílusban gondolkodsz?','2026-01-15 08:04:00'),
(14,10,'Van próbatermed?','2026-01-15 09:23:00'),
(14,10,'Persze, este 8 jó.','2026-01-15 09:46:00'),
(15,29,'Deal. Találkozunk!','2025-12-25 14:24:00'),
(15,29,'Szia! Ráérsz ma egy gyors egyeztetésre?','2025-12-25 17:14:00'),
(15,10,'Dobnál pár demót?','2025-12-25 17:34:00'),
(15,29,'Szombat délután oké.','2025-12-25 18:40:00'),
(15,29,'Rock / pop, de jöhet egy kis funk is.','2025-12-25 21:10:00'),
(15,10,'Küldök linket mindjárt.','2025-12-25 21:59:00'),
(15,21,'Deal. Találkozunk!','2025-12-25 22:40:00'),
(15,10,'Köszi, hogy írtál!','2025-12-26 00:58:00'),
(15,10,'Milyen stílusban gondolkodsz?','2025-12-26 03:51:00'),
(15,29,'Szombat délután oké.','2025-12-26 04:43:00'),
(15,21,'Dobnál pár demót?','2025-12-26 07:00:00'),
(15,10,'Kezdjünk 2 számmal bemelegítésnek.','2025-12-26 09:53:00'),
(15,10,'Rock / pop, de jöhet egy kis funk is.','2025-12-26 11:02:00'),
(15,21,'Küldök linket mindjárt.','2025-12-26 11:39:00'),
(15,21,'Oké, várom!','2025-12-26 14:03:00'),
(15,10,'Oké, várom!','2025-12-26 16:04:00'),
(15,10,'Oké, várom!','2025-12-26 17:09:00'),
(15,21,'Igen, a belvárosban.','2025-12-26 19:29:00'),
(15,29,'Szia! Ráérsz ma egy gyors egyeztetésre?','2025-12-26 20:12:00'),
(15,21,'Kezdjünk 2 számmal bemelegítésnek.','2025-12-26 23:12:00'),
(15,29,'Oké, várom!','2025-12-27 02:04:00');

-- ======================================================
-- Add famous Rock / Metal bands (NO messages/threads)
-- Works even if IDs change, because it maps by NAME.
-- ======================================================

-- 1) Insert bands (cities optional)
INSERT INTO bands (name, city) VALUES
('Metallica', 'Los Angeles'),
('Iron Maiden', 'London'),
('Black Sabbath', 'Birmingham'),
('Judas Priest', 'Birmingham'),
('Megadeth', 'Los Angeles'),
('Slayer', 'Huntington Park'),
('Pantera', 'Arlington'),
('Slipknot', 'Des Moines'),
('AC/DC', 'Sydney'),
('Led Zeppelin', 'London'),
('Deep Purple', 'Hertford'),
('Queen', 'London'),
('Pink Floyd', 'London'),
('Guns N'' Roses', 'Los Angeles'),
('Nirvana', 'Aberdeen'),
('Red Hot Chili Peppers', 'Los Angeles');

-- 2) Attach styles (Rock / Metal / etc.) using name-based mapping
INSERT INTO band_styles (band_id, style_id)
SELECT b.id, s.id
FROM bands b
JOIN musical_styles s ON s.name IN ('Metal', 'Rock', 'Indie')
WHERE 1=0

UNION ALL SELECT b.id, s.id FROM bands b JOIN musical_styles s
WHERE b.name='Metallica' AND s.name='Metal'
UNION ALL SELECT b.id, s.id FROM bands b JOIN musical_styles s
WHERE b.name='Metallica' AND s.name='Rock'

UNION ALL SELECT b.id, s.id FROM bands b JOIN musical_styles s
WHERE b.name='Iron Maiden' AND s.name='Metal'
UNION ALL SELECT b.id, s.id FROM bands b JOIN musical_styles s
WHERE b.name='Iron Maiden' AND s.name='Rock'

UNION ALL SELECT b.id, s.id FROM bands b JOIN musical_styles s
WHERE b.name='Black Sabbath' AND s.name='Metal'
UNION ALL SELECT b.id, s.id FROM bands b JOIN musical_styles s
WHERE b.name='Black Sabbath' AND s.name='Rock'

UNION ALL SELECT b.id, s.id FROM bands b JOIN musical_styles s
WHERE b.name='Judas Priest' AND s.name='Metal'
UNION ALL SELECT b.id, s.id FROM bands b JOIN musical_styles s
WHERE b.name='Megadeth' AND s.name='Metal'
UNION ALL SELECT b.id, s.id FROM bands b JOIN musical_styles s
WHERE b.name='Slayer' AND s.name='Metal'
UNION ALL SELECT b.id, s.id FROM bands b JOIN musical_styles s
WHERE b.name='Pantera' AND s.name='Metal'
UNION ALL SELECT b.id, s.id FROM bands b JOIN musical_styles s
WHERE b.name='Slipknot' AND s.name='Metal'

UNION ALL SELECT b.id, s.id FROM bands b JOIN musical_styles s
WHERE b.name='AC/DC' AND s.name='Rock'
UNION ALL SELECT b.id, s.id FROM bands b JOIN musical_styles s
WHERE b.name='Led Zeppelin' AND s.name='Rock'
UNION ALL SELECT b.id, s.id FROM bands b JOIN musical_styles s
WHERE b.name='Deep Purple' AND s.name='Rock'
UNION ALL SELECT b.id, s.id FROM bands b JOIN musical_styles s
WHERE b.name='Queen' AND s.name='Rock'
UNION ALL SELECT b.id, s.id FROM bands b JOIN musical_styles s
WHERE b.name='Pink Floyd' AND s.name='Rock'
UNION ALL SELECT b.id, s.id FROM bands b JOIN musical_styles s
WHERE b.name='Guns N'' Roses' AND s.name='Rock'

UNION ALL SELECT b.id, s.id FROM bands b JOIN musical_styles s
WHERE b.name='Nirvana' AND s.name='Rock'
UNION ALL SELECT b.id, s.id FROM bands b JOIN musical_styles s
WHERE b.name='Nirvana' AND s.name='Indie'

UNION ALL SELECT b.id, s.id FROM bands b JOIN musical_styles s
WHERE b.name='Red Hot Chili Peppers' AND s.name='Rock';

-- ======================================================
-- Famous Rock / Metal musicians as users
-- ======================================================

INSERT INTO users (username, email, password_hash, first_name, last_name, city)
VALUES
-- Metallica
('james_hetfield','james@metallica.com','demo123','James','Hetfield','Los Angeles'),
('lars_ulrich','lars@metallica.com','demo123','Lars','Ulrich','Los Angeles'),
('kirk_hammett','kirk@metallica.com','demo123','Kirk','Hammett','Los Angeles'),
('robert_trujillo','robert@metallica.com','demo123','Robert','Trujillo','Los Angeles');

-- Iron Maiden
INSERT INTO users (username, email, password_hash, first_name, last_name, city)
VALUES
('bruce_dickinson','bruce@ironmaiden.com','demo123','Bruce','Dickinson','London'),
('steve_harris','steve@ironmaiden.com','demo123','Steve','Harris','London'),
('dave_murray','dave@ironmaiden.com','demo123','Dave','Murray','London');

-- Black Sabbath
INSERT INTO users (username, email, password_hash, first_name, last_name, city)
VALUES
('ozzy_osbourne','ozzy@blacksabbath.com','demo123','Ozzy','Osbourne','Birmingham'),
('tony_iommi','tony@blacksabbath.com','demo123','Tony','Iommi','Birmingham'),
('geezer_butler','geezer@blacksabbath.com','demo123','Geezer','Butler','Birmingham');

-- Slayer
INSERT INTO users (username, email, password_hash, first_name, last_name, city)
VALUES
('tom_araya','tom@slayer.net','demo123','Tom','Araya','Los Angeles'),
('kerry_king','kerry@slayer.net','demo123','Kerry','King','Los Angeles');

-- Slipknot
INSERT INTO users (username, email, password_hash, first_name, last_name, city)
VALUES
('corey_taylor','corey@slipknot.com','demo123','Corey','Taylor','Des Moines'),
('mick_thomson','mick@slipknot.com','demo123','Mick','Thomson','Des Moines');

-- Nirvana
INSERT INTO users (username, email, password_hash, first_name, last_name, city)
VALUES
('kurt_cobain','kurt@nirvana.com','demo123','Kurt','Cobain','Aberdeen'),
('dave_grohl','dave@nirvana.com','demo123','Dave','Grohl','Aberdeen');

-- Queen
INSERT INTO users (username, email, password_hash, first_name, last_name, city)
VALUES
('freddie_mercury','freddie@queen.com','demo123','Freddie','Mercury','London'),
('brian_may','brian@queen.com','demo123','Brian','May','London'),
('roger_taylor','roger@queen.com','demo123','Roger','Taylor','London');

-- ======================================================
-- Band members (famous lineups)
-- ======================================================

INSERT INTO band_members (band_id, user_id, role)
SELECT b.id, u.id, 'vocals'
FROM bands b JOIN users u
WHERE b.name='Metallica' AND u.username='james_hetfield';

INSERT INTO band_members (band_id, user_id, role)
SELECT b.id, u.id, 'drums'
FROM bands b JOIN users u
WHERE b.name='Metallica' AND u.username='lars_ulrich';

INSERT INTO band_members (band_id, user_id, role)
SELECT b.id, u.id, 'guitar'
FROM bands b JOIN users u
WHERE b.name='Metallica' AND u.username='kirk_hammett';

INSERT INTO band_members (band_id, user_id, role)
SELECT b.id, u.id, 'bass'
FROM bands b JOIN users u
WHERE b.name='Metallica' AND u.username='robert_trujillo';


-- Iron Maiden
INSERT INTO band_members
SELECT b.id, u.id, 'vocals'
FROM bands b JOIN users u
WHERE b.name='Iron Maiden' AND u.username='bruce_dickinson';

INSERT INTO band_members
SELECT b.id, u.id, 'bass'
FROM bands b JOIN users u
WHERE b.name='Iron Maiden' AND u.username='steve_harris';

INSERT INTO band_members
SELECT b.id, u.id, 'guitar'
FROM bands b JOIN users u
WHERE b.name='Iron Maiden' AND u.username='dave_murray';


-- Black Sabbath
INSERT INTO band_members
SELECT b.id, u.id, 'vocals'
FROM bands b JOIN users u
WHERE b.name='Black Sabbath' AND u.username='ozzy_osbourne';

INSERT INTO band_members
SELECT b.id, u.id, 'guitar'
FROM bands b JOIN users u
WHERE b.name='Black Sabbath' AND u.username='tony_iommi';

INSERT INTO band_members
SELECT b.id, u.id, 'bass'
FROM bands b JOIN users u
WHERE b.name='Black Sabbath' AND u.username='geezer_butler';


-- Slayer
INSERT INTO band_members
SELECT b.id, u.id, 'vocals'
FROM bands b JOIN users u
WHERE b.name='Slayer' AND u.username='tom_araya';

INSERT INTO band_members
SELECT b.id, u.id, 'guitar'
FROM bands b JOIN users u
WHERE b.name='Slayer' AND u.username='kerry_king';


-- Slipknot
INSERT INTO band_members
SELECT b.id, u.id, 'vocals'
FROM bands b JOIN users u
WHERE b.name='Slipknot' AND u.username='corey_taylor';

INSERT INTO band_members
SELECT b.id, u.id, 'guitar'
FROM bands b JOIN users u
WHERE b.name='Slipknot' AND u.username='mick_thomson';


-- Nirvana
INSERT INTO band_members
SELECT b.id, u.id, 'vocals'
FROM bands b JOIN users u
WHERE b.name='Nirvana' AND u.username='kurt_cobain';

INSERT INTO band_members
SELECT b.id, u.id, 'drums'
FROM bands b JOIN users u
WHERE b.name='Nirvana' AND u.username='dave_grohl';


-- Queen
INSERT INTO band_members
SELECT b.id, u.id, 'vocals'
FROM bands b JOIN users u
WHERE b.name='Queen' AND u.username='freddie_mercury';

INSERT INTO band_members
SELECT b.id, u.id, 'guitar'
FROM bands b JOIN users u
WHERE b.name='Queen' AND u.username='brian_may';

INSERT INTO band_members
SELECT b.id, u.id, 'drums'
FROM bands b JOIN users u
WHERE b.name='Queen' AND u.username='roger_taylor';
