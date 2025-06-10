# PostgreSQL

- Jakub Fabia
- Michał Gontarz

---
## Tabele

![](./schema.png)

- `Trip`  - wycieczki
	- `trip_id` - identyfikator, klucz główny
	- `trip_name` - nazwa wycieczki
	- `country` - nazwa kraju
	- `trip_date` - data
	- `max_no_places` -  maksymalna liczba miejsc na wycieczkę
- `Person` - osoby
	- `person_id` - identyfikator, klucz główny
	- `firstname` - imię
	- `lastname` - nazwisko


- `Reservation`  - rezerwacje/bilety na wycieczkę
	- `reservation_id` - identyfikator, klucz główny
	- `trip_id` - identyfikator wycieczki
	- `person_id` - identyfikator osoby
	- `status` - status rezerwacji
		- `N` – New - Nowa
		- `P` – Confirmed and Paid – Potwierdzona  i zapłacona
		- `C` – Canceled - Anulowana
- `Log` - dziennik zmian statusów rezerwacji 
	- `log_id` - identyfikator, klucz główny
	- `reservation_id` - identyfikator rezerwacji
	- `log_date` - data zmiany
	- `status` - status


```sql
CREATE TABLE person (
  person_id   serial PRIMARY KEY,
  firstname   varchar(50),
  lastname    varchar(50)
);
```
```sql
CREATE TABLE trip (
  trip_id       serial PRIMARY KEY,
  trip_name     varchar(100),
  country       varchar(50),
  trip_date     date,
  max_no_places int
);
```
```sql
CREATE TABLE reservation (
  reservation_id serial PRIMARY KEY,
  trip_id int,
  person_id int,
  status char(1)
);

ALTER TABLE reservation
    ADD CONSTRAINT reservation_trip_fk
    FOREIGN KEY (trip_id)
    REFERENCES trip (trip_id);

ALTER TABLE reservation
    ADD CONSTRAINT reservation_person_fk
    FOREIGN KEY (person_id)
    REFERENCES person (person_id);

ALTER TABLE reservation
    ADD CONSTRAINT reservation_status_chk
    CHECK (status IN ('N','P','C'));
```
```sql
CREATE TABLE log (
    log_id serial PRIMARY KEY,
    reservation_id int NOT NULL,
    log_date date NOT NULL,
    status char(1)
);

ALTER TABLE log
    ADD CONSTRAINT log_status_chk
    CHECK (status IN ('N','P','C'));

ALTER TABLE log
    ADD CONSTRAINT log_reservation_fk
    FOREIGN KEY (reservation_id)
    REFERENCES reservation (reservation_id);
```
## Komentarz
Zamiast tworzyć serial użyłem dostępnego dla PostgreSQL pseudo-typu `serial`, która jest analogiczna do stworzenia:
- `CREATE SEQUENCE name START 1 INCREMENT 1;`
- Kolumny integer NOT NULL.

Na dodatek przy usunięciu tej kolumny `SEQUENCE` automatycznie się usuwa.

---
## Dane


Należy wypełnić  tabele przykładowymi danymi 
- 4 wycieczki
- 10 osób
- 10  rezerwacji

Dane testowe powinny być różnorodne (wycieczki w przyszłości, wycieczki w przeszłości, rezerwacje o różnym statusie itp.) tak, żeby umożliwić testowanie napisanych procedur.

W razie potrzeby należy zmodyfikować dane tak żeby przetestować różne przypadki.


```sql
-- TRIPS
INSERT INTO trip(trip_name, country, trip_date, max_no_places)  
VALUES ('Wycieczka do Paryza', 'Francja', TO_DATE('2023-09-12', 'YYYY-MM-DD'), 5);  

INSERT INTO trip(trip_name, country, trip_date, max_no_places)  
VALUES ('Piekny Krakow', 'Polska', TO_DATE('2025-07-03', 'YYYY-MM-DD'), 8);  

INSERT INTO trip(trip_name, country, trip_date, max_no_places)  
VALUES ('Marsylia', 'Francja', TO_DATE('2025-07-01', 'YYYY-MM-DD'), 7);  

INSERT INTO trip(trip_name, country, trip_date, max_no_places)  
VALUES ('Hel', 'Polska', TO_DATE('2025-05-21', 'YYYY-MM-DD'), 9);
```
```sql
-- PEOPLE
INSERT INTO person(firstname, lastname) VALUES ('Jan', 'Nowak');  
INSERT INTO person(firstname, lastname) VALUES ('Jan', 'Kowalski');  
INSERT INTO person(firstname, lastname) VALUES ('Jan', 'Nowakowski');  
INSERT INTO person(firstname, lastname) VALUES ('Novak', 'Nowak');  
INSERT INTO person(firstname, lastname) VALUES ('Anna', 'Lewandowska');  
INSERT INTO person(firstname, lastname) VALUES ('Katarzyna', 'Zielinska');  
INSERT INTO person(firstname, lastname) VALUES ('Piotr', 'Wojcik');  
INSERT INTO person(firstname, lastname) VALUES ('Marek', 'Kwiatkowski');  
INSERT INTO person(firstname, lastname) VALUES ('Magdalena', 'Lis');  
INSERT INTO person(firstname, lastname) VALUES ('Tomasz', 'Grabowski');
```
```sql
-- Trip 1
INSERT INTO reservation(trip_id, person_id, status) VALUES (1, 1, 'P');  
INSERT INTO reservation(trip_id, person_id, status) VALUES (1, 2, 'N');  

-- Trip 2  
INSERT INTO reservation(trip_id, person_id, status) VALUES (2, 1, 'P');  
INSERT INTO reservation(trip_id, person_id, status) VALUES (2, 4, 'C');  

-- Trip 3  
INSERT INTO reservation(trip_id, person_id, status) VALUES (3, 4, 'P');  
INSERT INTO reservation(trip_id, person_id, status) VALUES (3, 5, 'P');  

-- Trip 4  
INSERT INTO reservation(trip_id, person_id, status) VALUES (4, 6, 'N');  
INSERT INTO reservation(trip_id, person_id, status) VALUES (4, 7, 'P');  
INSERT INTO reservation(trip_id, person_id, status) VALUES (4, 8, 'C');  
INSERT INTO reservation(trip_id, person_id, status) VALUES (4, 9, 'P');  
```

---
# Zadanie 0 - modyfikacja danych, transakcje

Należy zmodyfikować model danych tak żeby rezerwacja mogła dotyczyć kilku miejsc/biletów na wycieczkę
- do tabeli reservation należy dodać pole
	- no_tickets
- do tabeli log należy dodac pole
	- no_tickets
	
Należy zmodyfikować zestaw danych testowych

Należy przeprowadzić kilka eksperymentów związanych ze wstawianiem, modyfikacją i usuwaniem danych
oraz wykorzystaniem transakcji

Skomentuj dzialanie transakcji. Jak działa polecenie `commit`, `rollback`?.
Co się dzieje w przypadku wystąpienia błędów podczas wykonywania transakcji? Porównaj sposób programowania operacji wykorzystujących transakcje w Oracle PL/SQL ze znanym ci systemem/językiem MS Sqlserver T-SQL


```sql
ALTER TABLE reservation
    ADD COLUMN no_tickets int;

ALTER TABLE log
    ADD COLUMN no_tickets int;

INSERT INTO reservation (trip_id, person_id, status, no_tickets)
VALUES (5, 1, 'N', 1);

INSERT INTO reservation (trip_id, person_id, status, no_tickets)
VALUES (2, 1, 'N', 1);

[2025-06-03 18:59:56] [23503] ERROR: insert or update on table "reservation" violates foreign key constraint "reservation_trip_fk"
[2025-06-03 18:59:56] Detail: Key (trip_id)=(5) is not present in table "trip".

COMMIT;

SELECT * FROM reservation
WHERE reservation_id >= 10;

-- Widać, że watrość wstawiła się z reservation_id = 12

UPDATE reservation
SET no_tickets = 2
WHERE reservation_id = 2;

COMMIT;

DELETE FROM reservation
WHERE reservation_id = 12;

COMMIT;

ALTER SEQUENCE reservation_reservation_id_seq RESTART WITH 11;

COMMIT;

INSERT INTO reservation (trip_id, person_id, status, no_tickets)
VALUES (5, 1, 'N', 1);

ROLLBACK;

INSERT INTO reservation (trip_id, person_id, status, no_tickets)
VALUES (2, 1, 'N', 1);

SELECT * FROM reservation
WHERE reservation_id >= 10;

-- Rollback też nie cofa zmian w sequence
```

```sql
UPDATE public.reservation SET no_tickets = 1 WHERE reservation_id = 10;
UPDATE public.reservation SET no_tickets = 1 WHERE reservation_id = 2;
UPDATE public.reservation SET no_tickets = 2 WHERE reservation_id = 8;
UPDATE public.reservation SET no_tickets = 3 WHERE reservation_id = 4;
UPDATE public.reservation SET no_tickets = 1 WHERE reservation_id = 6;
UPDATE public.reservation SET no_tickets = 3 WHERE reservation_id = 3;
UPDATE public.reservation SET no_tickets = 3 WHERE reservation_id = 9;
UPDATE public.reservation SET no_tickets = 2 WHERE reservation_id = 1;
UPDATE public.reservation SET no_tickets = 2 WHERE reservation_id = 7;
UPDATE public.reservation SET no_tickets = 2 WHERE reservation_id = 5;

COMMIT;
```


---
# Zadanie 1 - widoki


Tworzenie widoków. Należy przygotować kilka widoków ułatwiających dostęp do danych. Należy zwrócić uwagę na strukturę kodu (należy unikać powielania kodu)

Widoki:
-   `vw_reservation`
	- widok łączy dane z tabel: `trip`,  `person`,  `reservation`
	- zwracane dane:  `reservation_id`,  `country`, `trip_date`, `trip_name`, `firstname`, `lastname`, `status`, `trip_id`, `person_id`, `no_tickets`
- `vw_trip` 
	- widok pokazuje liczbę wolnych miejsc na każdą wycieczkę
	- zwracane dane: `trip_id`, `country`, `trip_date`, `trip_name`, `max_no_places`, `no_available_places` (liczba wolnych miejsc)
-  `vw_available_trip`
	- podobnie jak w poprzednim punkcie, z tym że widok pokazuje jedynie dostępne wycieczki (takie które są w przyszłości i są na nie wolne miejsca)


Proponowany zestaw widoków można rozbudować wedle uznania/potrzeb
- np. można dodać nowe/pomocnicze widoki, funkcje
- np. można zmienić def. widoków, dodając nowe/potrzebne pola

## Rozwiązanie

```sql
CREATE VIEW vw_reservation AS
SELECT 
	reservation_id, 
	country, 
	trip_date, 
	trip_name, 
	firstname, 
	lastname, 
	status, 
	trip.trip_id, 
	person.person_id, 
	no_tickets
FROM reservation
JOIN trip ON reservation.trip_id = trip.trip_id
JOIN person ON reservation.person_id = person.person_id
```
```sql
CREATE VIEW vw_trip AS
SELECT
  trip.trip_id,
  country,
  trip_date,
  trip_name,
  max_no_places,
  max_no_places - COALESCE(v.no_taken_places, 0) AS no_available_places
FROM trip
LEFT JOIN (
  SELECT
    trip_id,
    SUM(no_tickets) AS no_taken_places
  FROM reservation
  WHERE status IN ('P','N')
  GROUP BY trip_id
) v
  ON trip.trip_id = v.trip_id;
```
```sql
CREATE VIEW vw_available_trip AS
SELECT *
FROM vw_trip
WHERE trip_date > current_date
AND no_available_places > 0;
```



---
# Zadanie 2  - funkcje


Tworzenie funkcji pobierających dane/tabele. Podobnie jak w poprzednim przykładzie należy przygotować kilka funkcji ułatwiających dostęp do danych

Procedury:
- `f_trip_participants`
	- zadaniem funkcji jest zwrócenie listy uczestników wskazanej wycieczki
	- parametry funkcji: `trip_id`
	- funkcja zwraca podobny zestaw danych jak widok  `vw_reservation`
-  `f_person_reservations`
	- zadaniem funkcji jest zwrócenie listy rezerwacji danej osoby 
	- parametry funkcji: `person_id`
	- funkcja zwraca podobny zestaw danych jak widok `vw_reservation`
-  `f_available_trips_to`
	- zadaniem funkcji jest zwrócenie listy wycieczek do wskazanego kraju, dostępnych w zadanym okresie czasu (od `date_from` do `date_to`)
	- parametry funkcji: `country`, `date_from`, `date_to`


Funkcje powinny zwracać tabelę/zbiór wynikowy. Należy rozważyć dodanie kontroli parametrów, (np. jeśli parametrem jest `trip_id` to można sprawdzić czy taka wycieczka istnieje). Podobnie jak w przypadku widoków należy zwrócić uwagę na strukturę kodu

Czy kontrola parametrów w przypadku funkcji ma sens?
- jakie są zalety/wady takiego rozwiązania?

Proponowany zestaw funkcji można rozbudować wedle uznania/potrzeb
- np. można dodać nowe/pomocnicze funkcje/procedury

## Rozwiązanie

```sql
CREATE FUNCTION f_trip_participants(p_trip_id integer)
RETURNS TABLE
(
  firstname  varchar(50),
  lastname   varchar(50),
  no_tickets integer
)
LANGUAGE plpgsql
AS $result$
BEGIN
  RETURN QUERY
    SELECT
      vw.firstname,
      vw.lastname,
      vw.no_tickets
    FROM vw_reservation vw
    WHERE vw.trip_id = p_trip_id
      AND vw.status = 'P';
END;
$result$;

-- Bardzo podoba mi się, że nie ma potrzeby tworzyć osobnego typu / obiektu. 
-- Fajna jest też możliwość zadeklarowania z jakiego języka zapytań ma korzystać DBMS, w tym przypadku jest to PL/PGSQL, podobny do Oracle PL/SQL. 
```
```sql
CREATE FUNCTION f_person_reservations(p_person_id integer)
RETURNS TABLE
(
  country VARCHAR(50),
  trip_date DATE,
  trip_name VARCHAR(100),
  status CHAR(1),
  no_tickets INT
)
LANGUAGE plpgsql
AS $result$
BEGIN
  RETURN QUERY
    SELECT
      vw.country,
      vw.trip_date,
      vw.trip_name,
      vw.status,
      vw.no_tickets
    FROM vw_reservation vw
    WHERE vw.person_id = p_person_id;
END;
$result$;
```
```sql
CREATE FUNCTION f_available_trips_to(p_country VARCHAR(50), p_date_from DATE, p_date_to DATE)
RETURNS TABLE
(
  trip_date DATE,
  trip_name VARCHAR(100),
  max_no_places INT
)
LANGUAGE plpgsql
AS $result$
BEGIN
  RETURN QUERY
    SELECT
      t.trip_date,
      t.trip_name,
      t.max_no_places
    FROM trip t
    WHERE t.country = p_country
      AND t.trip_date BETWEEN p_date_from AND p_date_to;
END;
$result$;

-- Podoba mi się (w testowaniu tej funkcji), że nie trzeba parsować stringa do daty za pomocą funkcji w zapytaniu (TO_DATE w Ocacle PL/SQL) tylko DBMS robi to sam.
```

---
# Zadanie 3  - procedury


Tworzenie procedur modyfikujących dane. Należy przygotować zestaw procedur pozwalających na modyfikację danych oraz kontrolę poprawności ich wprowadzania

Procedury
- `p_add_reservation`
	- zadaniem procedury jest dopisanie nowej rezerwacji
	- parametry: `trip_id`, `person_id`,  `no_tickets`
	- procedura powinna kontrolować czy wycieczka jeszcze się nie odbyła, i czy sa wolne miejsca
	- procedura powinna również dopisywać inf. do tabeli `log`
- `p_modify_reservation_status`
	- zadaniem procedury jest zmiana statusu rezerwacji 
	- parametry: `reservation_id`, `status`
	- procedura powinna kontrolować czy możliwa jest zmiana statusu, np. zmiana statusu już anulowanej wycieczki (przywrócenie do stanu aktywnego nie zawsze jest możliwa – może już nie być miejsc)
	- procedura powinna również dopisywać inf. do tabeli `log`
- `p_modify_reservation`
	- zadaniem procedury jest zmiana liczby biletów rezerwacji 
	- parametry: `reservation_id`, `no_iickets`
	- procedura powinna kontrolować czy możliwa jest zmiana liczby sprzedanych/zarezerwowanych biletów – może już nie być miejsc
	- procedura powinna również dopisywać inf. do tabeli `log`
- `p_modify_max_no_places`
	- zadaniem procedury jest zmiana maksymalnej liczby miejsc na daną wycieczkę 
	- parametry: `trip_id`, `max_no_places`
	- nie wszystkie zmiany liczby miejsc są dozwolone, nie można zmniejszyć liczby miejsc na wartość poniżej liczby zarezerwowanych miejsc

Należy rozważyć użycie transakcji

Należy zwrócić uwagę na kontrolę parametrów (np. jeśli parametrem jest trip_id to należy sprawdzić czy taka wycieczka istnieje, jeśli robimy rezerwację to należy sprawdzać czy są wolne miejsca itp..)


Proponowany zestaw procedur można rozbudować wedle uznania/potrzeb
- np. można dodać nowe/pomocnicze funkcje/procedury

## Rozwiązanie

```sql
CREATE FUNCTION f_person_exists(p_person_id integer)
RETURNS boolean
LANGUAGE sql
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM person
    WHERE person_id = p_person_id
  );
$$;
```
Funkcja pomocnicza do sprawdzania czy osoba istnieje w bazie.
```sql
CREATE PROCEDURE p_add_reservation(
  p_trip_id    integer,
  p_person_id  integer,
  p_no_tickets integer
)
LANGUAGE plpgsql
AS $result$
DECLARE
  available_places integer;
  v_reservation_id integer;
BEGIN
  IF NOT f_person_exists(p_person_id) THEN
    RAISE EXCEPTION 
		'Osoba o person_id = % nie istnieje w bazie.', 
		p_person_id;
  END IF;

  IF p_no_tickets <= 0 THEN
    RAISE EXCEPTION 
		'Liczba biletów musi być dodatnia.';
  END IF;

  SELECT no_available_places
    INTO available_places
    FROM vw_available_trip
    WHERE trip_id = p_trip_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 
		'Wycieczka o trip_id = % nie jest dostępna!', 
		p_trip_id;
  END IF;

  IF p_no_tickets > available_places THEN
    RAISE EXCEPTION 
		'Zbyt duża liczba biletów: zamówiono %, a dostępnych jest %.', 
		p_no_tickets, 
		available_places;
  END IF;

  INSERT INTO reservation (trip_id, person_id, no_tickets, status)
  VALUES (p_trip_id, p_person_id, p_no_tickets, 'N')
  RETURNING reservation_id
  INTO v_reservation_id;

  INSERT INTO log (reservation_id, log_date, status, no_tickets)
  VALUES (v_reservation_id, now(), 'N', p_no_tickets);
END;
$result$;
```
```sql
CREATE PROCEDURE p_modify_reservation_status(
  p_reservation_id  integer,
  p_new_status      char(1)
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_trip_id          integer;
  v_old_status       char(1);
  v_trip_date        date;
  v_no_tickets       integer;
  v_available_places integer;
BEGIN
  IF p_new_status NOT IN ('N', 'P', 'C') THEN
    RAISE EXCEPTION 
		'Błędne oznaczenie statusu. Dostępne: N, P, C';
  END IF;

  SELECT r.trip_id,
         r.status,
         r.no_tickets
    INTO v_trip_id,
         v_old_status,
         v_no_tickets
    FROM reservation r
   WHERE r.reservation_id = p_reservation_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 
		'Rezerwacja o reservation_id = % nie istnieje.', 
		p_reservation_id;
  END IF;

  SELECT t.trip_date
    INTO v_trip_date
    FROM trip t
   WHERE t.trip_id = v_trip_id;

  IF v_trip_date < current_date THEN
    RAISE EXCEPTION 
		'Nie można zmienić statusu rezerwacji % – wycieczka odbyła się %.',
		p_reservation_id, 
		v_trip_date;
  END IF;

  IF v_old_status = p_new_status THEN
    RAISE EXCEPTION 
		'Rezerwacja % już ma status "%".', 
		p_reservation_id, 
		p_new_status;
  END IF;

  IF p_new_status = 'C' THEN
    UPDATE reservation
       SET status = 'C'
     WHERE reservation_id = p_reservation_id;

    INSERT INTO log (reservation_id, log_date, status, no_tickets)
    VALUES (p_reservation_id, now(), 'C', v_no_tickets);

    RETURN;
  END IF;

  IF v_old_status = 'C' THEN
    SELECT v.no_available_places
      INTO v_available_places
      FROM vw_available_trip v
     WHERE v.trip_id = v_trip_id;

    IF NOT FOUND OR v_available_places < v_no_tickets THEN
      RAISE EXCEPTION 
	  	'Brak wystarczającej liczby miejsc: żądano %, a dostępnych = %.',
		v_no_tickets,
		COALESCE(v_available_places, 0);
    END IF;
  END IF;

  UPDATE reservation
     SET status = p_new_status
   WHERE reservation_id = p_reservation_id;

  INSERT INTO log (reservation_id, log_date, status, no_tickets)
  VALUES (p_reservation_id, now(), p_new_status, v_no_tickets);
END;
$$
```
```sql
CREATE OR REPLACE PROCEDURE p_modify_reservation(
  p_reservation_id  integer,
  p_no_tickets      integer
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_trip_id          integer;
  v_old_no_tickets   integer;
  v_status           char(1);
  v_trip_date        date;
  v_available_places integer;
  v_delta            integer;
BEGIN
  SELECT r.trip_id,
         r.no_tickets,
         r.status
    INTO v_trip_id,
         v_old_no_tickets,
         v_status
    FROM reservation r
   WHERE r.reservation_id = p_reservation_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 
	'Rezerwacja o reservation_id = % nie istnieje.', 
	p_reservation_id;
  END IF;

  SELECT t.trip_date
    INTO v_trip_date
    FROM trip t
   WHERE t.trip_id = v_trip_id;

  IF v_trip_date < current_date THEN
    RAISE EXCEPTION 
		'Nie można zmienić liczby biletów rezerwacji %, ponieważ wycieczka odbyła się %.',
		p_reservation_id, 
		v_trip_date;
  END IF;

  IF v_status = 'C' THEN
    RAISE EXCEPTION 
		'Nie można zmienić liczby biletów rezerwacji %, ponieważ jest anulowana.',
		p_reservation_id;
  END IF;

  v_delta := p_no_tickets - v_old_no_tickets;

  IF v_delta > 0 THEN
    SELECT vt.no_available_places
      INTO v_available_places
      FROM vw_trip vt
     WHERE vt.trip_id = v_trip_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 
	  	'Nie ma dostępnych biletów na wycieczkę.';
    END IF;

    IF v_delta > v_available_places THEN
      RAISE EXCEPTION 
	  	'Brak wystarczającej liczby miejsc: żądano dodatkowo %, a dostępnych = %.',
		v_delta,
		v_available_places;
    END IF;
  END IF;

  UPDATE reservation
     SET no_tickets = p_no_tickets
   WHERE reservation_id = p_reservation_id;

  INSERT INTO log (reservation_id, log_date, status, no_tickets)
  VALUES (p_reservation_id, now(), v_status, p_no_tickets);
END;
$$;
```
```sql
CREATE OR REPLACE PROCEDURE p_modify_max_no_places(
  p_trip_id        integer,
  p_max_no_places  integer
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_reserved_tickets  integer;
  v_old_max_places    integer;
BEGIN
  SELECT t.max_no_places
    INTO v_old_max_places
    FROM trip t
   WHERE t.trip_id = p_trip_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 
		'Wycieczka o trip_id = % nie istnieje.', 
		p_trip_id;
  END IF;

  SELECT COALESCE(SUM(r.no_tickets), 0)
    INTO v_reserved_tickets
    FROM reservation r
   WHERE r.trip_id = p_trip_id
     AND r.status IN ('P','N');

  IF p_max_no_places < v_reserved_tickets THEN
    RAISE EXCEPTION
      'Nie można zmniejszyć max_no_places poniżej liczby zarezerwowanych miejsc = %.',
      p_trip_id,
      v_reserved_tickets;
  END IF;

  UPDATE trip
     SET max_no_places = p_max_no_places
   WHERE trip_id = p_trip_id;
END;
$$;
```

---
# Zadanie 4  - triggery


Zmiana strategii zapisywania do dziennika rezerwacji. Realizacja przy pomocy triggerów

Należy wprowadzić zmianę, która spowoduje, że zapis do dziennika będzie realizowany przy pomocy trigerów

Triggery:
- trigger/triggery obsługujące 
	- dodanie rezerwacji
	- zmianę statusu
	- zmianę liczby zarezerwowanych/kupionych biletów
- trigger zabraniający usunięcia rezerwacji

Oczywiście po wprowadzeniu tej zmiany należy "uaktualnić" procedury modyfikujące dane. 

>UWAGA
Należy stworzyć nowe wersje tych procedur (dodając do nazwy dopisek 4 - od numeru zadania). Poprzednie wersje procedur należy pozostawić w celu  umożliwienia weryfikacji ich poprawności

Należy przygotować procedury: `p_add_reservation_4`, `p_modify_reservation_status_4` , `p_modify_reservation_4`


## Rozwiązanie

Z poniższych procedur usunięto dodawanie do tabeli `log`.

```sql
CREATE PROCEDURE p_add_reservation_4(
  p_trip_id    integer,
  p_person_id  integer,
  p_no_tickets integer
)
LANGUAGE plpgsql
AS $result$
DECLARE
  available_places integer;
  v_reservation_id integer;
BEGIN
  IF NOT f_person_exists(p_person_id) THEN
    RAISE EXCEPTION 
		'Osoba o person_id = % nie istnieje w bazie.', 
		p_person_id;
  END IF;

  IF p_no_tickets <= 0 THEN
    RAISE EXCEPTION 
		'Liczba biletów musi być dodatnia.';
  END IF;

  SELECT no_available_places
    INTO available_places
    FROM vw_available_trip
    WHERE trip_id = p_trip_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 
		'Wycieczka o trip_id = % nie jest dostępna!', 
		p_trip_id;
  END IF;

  IF p_no_tickets > available_places THEN
    RAISE EXCEPTION 
		'Zbyt duża liczba biletów: zamówiono %, a dostępnych jest %.', 
		p_no_tickets, 
		available_places;
  END IF;

  INSERT INTO reservation (trip_id, person_id, no_tickets, status)
  VALUES (p_trip_id, p_person_id, p_no_tickets, 'N')
  RETURNING reservation_id
  INTO v_reservation_id;
END;
$result$;



CREATE PROCEDURE p_modify_reservation_status_4(
  p_reservation_id  integer,
  p_new_status      char(1)
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_trip_id          integer;
  v_old_status       char(1);
  v_trip_date        date;
  v_no_tickets       integer;
  v_available_places integer;
BEGIN
  IF p_new_status NOT IN ('N', 'P', 'C') THEN
    RAISE EXCEPTION 
		'Błędne oznaczenie statusu. Dostępne: N, P, C';
  END IF;

  SELECT r.trip_id,
         r.status,
         r.no_tickets
    INTO v_trip_id,
         v_old_status,
         v_no_tickets
    FROM reservation r
   WHERE r.reservation_id = p_reservation_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 
		'Rezerwacja o reservation_id = % nie istnieje.', 
		p_reservation_id;
  END IF;

  SELECT t.trip_date
    INTO v_trip_date
    FROM trip t
   WHERE t.trip_id = v_trip_id;

  IF v_trip_date < current_date THEN
    RAISE EXCEPTION 
		'Nie można zmienić statusu rezerwacji % – wycieczka odbyła się %.',
		p_reservation_id, 
		v_trip_date;
  END IF;

  IF v_old_status = p_new_status THEN
    RAISE EXCEPTION 
		'Rezerwacja % już ma status "%".', 
		p_reservation_id, 
		p_new_status;
  END IF;

  IF p_new_status = 'C' THEN
    UPDATE reservation
       SET status = 'C'
     WHERE reservation_id = p_reservation_id;
    RETURN;
  END IF;

  IF v_old_status = 'C' THEN
    SELECT v.no_available_places
      INTO v_available_places
      FROM vw_available_trip v
     WHERE v.trip_id = v_trip_id;

    IF NOT FOUND OR v_available_places < v_no_tickets THEN
      RAISE EXCEPTION 
	  	'Brak wystarczającej liczby miejsc: żądano %, a dostępnych = %.',
		v_no_tickets,
		COALESCE(v_available_places, 0);
    END IF;
  END IF;

  UPDATE reservation
     SET status = p_new_status
   WHERE reservation_id = p_reservation_id;
END;
$$;



CREATE PROCEDURE p_modify_reservation_4(
  p_reservation_id  integer,
  p_no_tickets      integer
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_trip_id          integer;
  v_old_no_tickets   integer;
  v_status           char(1);
  v_trip_date        date;
  v_available_places integer;
  v_delta            integer;
BEGIN
  SELECT r.trip_id,
         r.no_tickets,
         r.status
    INTO v_trip_id,
         v_old_no_tickets,
         v_status
    FROM reservation r
   WHERE r.reservation_id = p_reservation_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 
		'Rezerwacja o reservation_id = % nie istnieje.', 
		p_reservation_id;
  END IF;

  SELECT t.trip_date
    INTO v_trip_date
    FROM trip t
   WHERE t.trip_id = v_trip_id;

  IF v_trip_date < current_date THEN
    RAISE EXCEPTION 
		'Nie można zmienić liczby biletów rezerwacji %, ponieważ wycieczka odbyła się %.',
		p_reservation_id, 
		v_trip_date;
  END IF;

  IF v_status = 'C' THEN
    RAISE EXCEPTION 
		'Nie można zmienić liczby biletów rezerwacji %, ponieważ jest anulowana.',
        p_reservation_id;
  END IF;

  v_delta := p_no_tickets - v_old_no_tickets;

  IF v_delta > 0 THEN
    SELECT vt.no_available_places
      INTO v_available_places
      FROM vw_trip vt
     WHERE vt.trip_id = v_trip_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 
	  	'Nie ma dostępnych biletów na wycieczkę.';
    END IF;

    IF v_delta > v_available_places THEN
      RAISE EXCEPTION 
	  	'Brak wystarczającej liczby miejsc: żądano dodatkowo %, a dostępnych = %.',
		v_delta,
		v_available_places;
    END IF;
  END IF;

  UPDATE reservation
     SET no_tickets = p_no_tickets
   WHERE reservation_id = p_reservation_id;
END;
$$;
```
```sql
CREATE FUNCTION trg_log_reservation_changes()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO log (reservation_id, log_date, status, no_tickets)
  VALUES (NEW.reservation_id, now(), NEW.status, NEW.no_tickets);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_reservation_insert_update
AFTER INSERT OR UPDATE
ON reservation
FOR EACH ROW
EXECUTE FUNCTION trg_log_reservation_changes();
```
```sql
CREATE OR REPLACE FUNCTION trg_prevent_reservation_delete()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 
  	'Usuwanie rezerwacji jest zabronione. Reservation_id=%', 
	OLD.reservation_id;
END;
$$;

CREATE TRIGGER trg_prevent_reservation_delete
BEFORE DELETE
ON reservation
FOR EACH ROW
EXECUTE FUNCTION trg_prevent_reservation_delete();
```

### Komentarz

Jak widać wyżej, triggery w `PostgreSQL` nie mogą mieć wielu elementów logiki (np. `INSERT`), przez co trzeba robić tzw. trigger function, gdzie ukrywane jest całe polecenie. 

---
# Zadanie 5  - triggery


Zmiana strategii kontroli dostępności miejsc. Realizacja przy pomocy triggerów

Należy wprowadzić zmianę, która spowoduje, że kontrola dostępności miejsc na wycieczki (przy dodawaniu nowej rezerwacji, zmianie statusu) będzie realizowana przy pomocy trigerów

Triggery:
- Trigger/triggery obsługujące: 
	- dodanie rezerwacji
	- zmianę statusu
	- zmianę liczby zakupionych/zarezerwowanych miejsc/biletów

Oczywiście po wprowadzeniu tej zmiany należy "uaktualnić" procedury modyfikujące dane. 

>UWAGA
Należy stworzyć nowe wersje tych procedur (np. dodając do nazwy dopisek 5 - od numeru zadania). Poprzednie wersje procedur należy pozostawić w celu  umożliwienia weryfikacji ich poprawności. 

Należy przygotować procedury: `p_add_reservation_5`, `p_modify_reservation_status_5`, `p_modify_reservation_status_5`


## Rozwiązanie

Funkcja pomocnicza do sprawdzenia czy wycieczka jest dostępna (bez dostępności miejsc), żeby nie korzystać z widoku `vw_available_trip`.

```sql
CREATE FUNCTION f_trip_exists_future(p_trip_id integer)
RETURNS boolean
LANGUAGE sql
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM trip
    WHERE trip_id = $1
      AND trip_date > current_date
  );
$$;
```
```sql
CREATE OR REPLACE FUNCTION f_trip_exists_future(p_trip_id integer)
RETURNS boolean
LANGUAGE sql
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM trip
    WHERE trip_id = $1
      AND trip_date > current_date
  );
$$;

CREATE PROCEDURE p_add_reservation_5(
  p_trip_id    integer,
  p_person_id  integer,
  p_no_tickets integer
)
LANGUAGE plpgsql
AS $result$
DECLARE
  v_reservation_id integer;
BEGIN
  IF NOT f_person_exists(p_person_id) THEN
    RAISE EXCEPTION 
		'Osoba o person_id = % nie istnieje w bazie.', 
		p_person_id;
  END IF;

  IF p_no_tickets <= 0 THEN
    RAISE EXCEPTION 
		'Liczba biletów musi być dodatnia.';
  END IF;

  IF NOT f_trip_exists_future(p_trip_id) THEN
    RAISE EXCEPTION 
		'Wycieczka o trip_id = % nie istnieje, lub już się odbyła!', 
		p_trip_id;
  END IF;

  INSERT INTO reservation (trip_id, person_id, no_tickets, status)
  VALUES (p_trip_id, p_person_id, p_no_tickets, 'N')
  RETURNING reservation_id
  INTO v_reservation_id;
END;
$result$;



CREATE PROCEDURE p_modify_reservation_status_5(
  p_reservation_id  integer,
  p_new_status      char(1)
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_trip_id          integer;
  v_old_status       char(1);
BEGIN
  IF p_new_status NOT IN ('N', 'P', 'C') THEN
    RAISE EXCEPTION 
		'Błędne oznaczenie statusu. Dostępne: N, P, C';
  END IF;

  SELECT r.trip_id,
         r.status
    INTO v_trip_id,
         v_old_status
    FROM reservation r
   WHERE r.reservation_id = p_reservation_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 
		'Rezerwacja o reservation_id = % nie istnieje.', 
		p_reservation_id;
  END IF;

  IF NOT f_trip_exists_future(v_trip_id) THEN
    RAISE EXCEPTION 
		'Wycieczka o trip_id = % nie istnieje, lub już się odbyła!', 
		v_trip_id;
  END IF;

  IF v_old_status = p_new_status THEN
    RAISE EXCEPTION 
		'Rezerwacja % już ma status "%".', 
		p_reservation_id, 
		p_new_status;
  END IF;

  UPDATE reservation
     SET status = p_new_status
   WHERE reservation_id = p_reservation_id;
END;
$$;



CREATE PROCEDURE p_modify_reservation_5(
  p_reservation_id  integer,
  p_no_tickets      integer
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_trip_id          integer;
  v_status           char(1);
BEGIN
  SELECT r.trip_id,
         r.status
    INTO v_trip_id,
         v_status
    FROM reservation r
   WHERE r.reservation_id = p_reservation_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 
		'Rezerwacja o reservation_id = % nie istnieje.', 
		p_reservation_id;
  END IF;

  IF NOT f_trip_exists_future(v_trip_id) THEN
    RAISE EXCEPTION 
		'Wycieczka o trip_id = % nie istnieje, lub już się odbyła!', 
		v_trip_id;
  END IF;

  IF v_status = 'C' THEN
    RAISE EXCEPTION 
		'Nie można zmienić liczby biletów rezerwacji %, ponieważ jest anulowana.',
        p_reservation_id;
  END IF;

  UPDATE reservation
     SET no_tickets = p_no_tickets
   WHERE reservation_id = p_reservation_id;
END;
$$;
```
```sql
CREATE OR REPLACE FUNCTION trg_reservation_availability()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_max_places       integer;
  v_current_reserved integer;
  v_new_total        integer;
BEGIN
  SELECT max_no_places
    INTO v_max_places
    FROM trip
   WHERE trip_id = NEW.trip_id;

  SELECT COALESCE(SUM(no_tickets), 0)
    INTO v_current_reserved
    FROM reservation
   WHERE trip_id = NEW.trip_id
     AND status IN ('N','P')
     AND (TG_OP = 'INSERT'
      OR reservation_id <> OLD.reservation_id);


  IF NEW.status IN ('N','P') THEN
    v_new_total := v_current_reserved + NEW.no_tickets;
  ELSE
    v_new_total := v_current_reserved;
  END IF;

  IF v_new_total > v_max_places THEN
    RAISE EXCEPTION
      'Not enough places on trip %: requested total = %, but max_no_places = %',
      NEW.trip_id,
      v_new_total,
      v_max_places;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_reservation_availability
BEFORE INSERT OR UPDATE
ON reservation
FOR EACH ROW
EXECUTE FUNCTION trg_reservation_availability();
```
### Komentarz

Podczas sprawdzania aktualnej liczby zajętych miejsc użyłem:
```sql
AND (TG_OP = 'INSERT'
	OR reservation_id <> OLD.reservation_id);
```
`TG_OP` to zmienna opisująca operację wykonywaną przez trigger, w tym przypadku `INSERT`. Warunek ten ma 2 przypadki:
- Podczas insert'owania możemy po prostu sprawdzić wszystkie rezerwacje (z odpowiednim statusem) i zliczyć ich `no_tickets`,
- Podczas update'owania musimy jednak od sumy biletów tymczasowo odjąć `old.no_tickets`, potem `new.no_tickets` dodajemy do sumy biletów i porównujemy z `max_no_tickets`.

---
# Zadanie 6


Zmiana struktury bazy danych. W tabeli `trip`  należy dodać  redundantne pole `no_available_places`.  Dodanie redundantnego pola uprości kontrolę dostępnych miejsc, ale nieco skomplikuje procedury dodawania rezerwacji, zmiany statusu czy też zmiany maksymalnej liczby miejsc na wycieczki.

Należy przygotować polecenie/procedurę przeliczającą wartość pola `no_available_places` dla wszystkich wycieczek (do jednorazowego wykonania)

Obsługę pola `no_available_places` można zrealizować przy pomocy procedur lub triggerów

Należy zwrócić uwagę na spójność rozwiązania.

>UWAGA
Należy stworzyć nowe wersje tych widoków/procedur/triggerów (np. dodając do nazwy dopisek 6 - od numeru zadania). Poprzednie wersje procedur należy pozostawić w celu  umożliwienia weryfikacji ich poprawności. 


- zmiana struktury tabeli

```sql
alter table trip add  
    no_available_places int null
```

- polecenie przeliczające wartość `no_available_places`
	- należy wykonać operację "przeliczenia"  liczby wolnych miejsc i aktualizacji pola  `no_available_places`

## Rozwiązanie

```sql
CREATE PROCEDURE p_update_no_available_places()
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE trip
     SET no_available_places = max_no_places
       - COALESCE(
           (
             SELECT SUM(r.no_tickets)
               FROM reservation r
              WHERE r.trip_id = trip.trip_id
                AND r.status IN ('N','P')
           ),
           0
         );
END;
$$;
```
```sql
create view vw_available_trip_6 as
select trip_id, trip_name, country, trip_date, max_no_places, no_available_places
from trip
where trip_date > CURRENT_DATE
and no_available_places > 0
```

Widok `vw_trip` stał się redundantny, ponieważ posiada te same dane co tabela `trip`.

Widok `vw_reservation` pozostaje bez zmian.

---
# Zadanie 6a  - procedury



Obsługę pola `no_available_places` należy zrealizować przy pomocy procedur
- procedura dodająca rezerwację powinna aktualizować pole `no_available_places` w tabeli trip
- podobnie procedury odpowiedzialne za zmianę statusu oraz zmianę maksymalnej liczby miejsc na wycieczkę
- należy przygotować procedury oraz jeśli jest to potrzebne, zaktualizować triggery oraz widoki



>UWAGA
Należy stworzyć nowe wersje tych widoków/procedur/triggerów (np. dodając do nazwy dopisek 6a - od numeru zadania). Poprzednie wersje procedur należy pozostawić w celu  umożliwienia weryfikacji ich poprawności. 
- może  być potrzebne wyłączenie 'poprzednich wersji' triggerów 


## Rozwiązanie

```sql
ALTER TABLE reservation
DISABLE TRIGGER trg_reservation_availability
```

**Uwaga pozostawiam trigery `trg_prevent_reservation_delete` oraz `trg_reservation_insert_update`, które odpowiadają za uniemożliwienie usuwania rezerwacji oraz wpisywanie zmian do tabeli `log`**
```sql
CREATE OR REPLACE PROCEDURE p_add_reservation_6a(
  p_trip_id    integer,
  p_person_id  integer,
  p_no_tickets integer
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_reservation_id integer;
  v_available      integer;
BEGIN
  IF NOT f_person_exists(p_person_id) THEN
    RAISE EXCEPTION 
		'Osoba o person_id = % nie istnieje w bazie.', 
		p_person_id;
  END IF;

  IF p_no_tickets <= 0 THEN
    RAISE EXCEPTION 
		'Liczba biletów musi być dodatnia.';
  END IF;

  IF NOT f_trip_exists_future(p_trip_id) THEN
    RAISE EXCEPTION 
		'Wycieczka o trip_id = % nie istnieje lub już się odbyła.', 
		p_trip_id;
  END IF;

  SELECT no_available_places
    INTO v_available
    FROM trip
   WHERE trip_id = p_trip_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 
		'Wycieczka o trip_id = % nie została znaleziona w tabeli trip.', 
		p_trip_id;
  END IF;

  IF v_available < p_no_tickets THEN
    RAISE EXCEPTION
      'Brak wystarczającej liczby miejsc na wycieczce %: żądano %, dostępne %.',
      p_trip_id,
      p_no_tickets,
      v_available;
  END IF;

  INSERT INTO reservation (trip_id, person_id, no_tickets, status)
  VALUES (p_trip_id, p_person_id, p_no_tickets, 'N')
  RETURNING reservation_id
  INTO v_reservation_id;

  UPDATE trip
     SET no_available_places = no_available_places - p_no_tickets
   WHERE trip_id = p_trip_id;
END;
$$;
```
```sql
CREATE PROCEDURE p_modify_reservation_6a(
  p_reservation_id  integer,
  p_no_tickets      integer
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_trip_id         integer;
  v_status          char(1);
  v_old_no_tickets  integer;
  v_available       integer;
  v_delta           integer;
BEGIN
  IF p_no_tickets <= 0 THEN
    RAISE EXCEPTION 
		'Liczba biletów musi być dodatnia.';
  END IF;

  SELECT r.trip_id,
         r.status,
         r.no_tickets
    INTO v_trip_id,
         v_status,
         v_old_no_tickets
    FROM reservation r
   WHERE r.reservation_id = p_reservation_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 
		'Rezerwacja o reservation_id = % nie istnieje.', 
		p_reservation_id;
  END IF;

  IF NOT f_trip_exists_future(v_trip_id) THEN
    RAISE EXCEPTION 
		'Wycieczka o trip_id = % nie istnieje lub już się odbyła.', 
		v_trip_id;
  END IF;

  IF v_status = 'C' THEN
    RAISE EXCEPTION
      'Nie można zmienić liczby biletów rezerwacji %, ponieważ jest anulowana.',
      p_reservation_id;
  END IF;

  v_delta := p_no_tickets - v_old_no_tickets;

  IF v_delta > 0 THEN
    SELECT no_available_places
      INTO v_available
      FROM trip
     WHERE trip_id = v_trip_id;

    IF v_available < v_delta THEN
      RAISE EXCEPTION
        'Brak wolnych miejsc na wycieczce %: potrzeba dodatkowo %, dostępne %.',
        v_trip_id,
        v_delta,
        v_available;
    END IF;
  END IF;

  UPDATE trip
     SET no_available_places = no_available_places - v_delta
   WHERE trip_id = v_trip_id;

  UPDATE reservation
     SET no_tickets = p_no_tickets
   WHERE reservation_id = p_reservation_id;
END;
$$;
```
```sql
CREATE OR REPLACE PROCEDURE p_modify_reservation_status_6a(
  p_reservation_id  integer,
  p_new_status      char(1)
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_trip_id     integer;
  v_old_status  char(1);
  v_no_tickets  integer;
  v_available   integer;
BEGIN
  IF p_new_status NOT IN ('N','P','C') THEN
    RAISE EXCEPTION 
		'Błędny status. Dozwolone: N, P, C.';
  END IF;

  SELECT r.trip_id,
         r.status,
         r.no_tickets
    INTO v_trip_id,
         v_old_status,
         v_no_tickets
    FROM reservation r
   WHERE r.reservation_id = p_reservation_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 
		'Rezerwacja o reservation_id = % nie istnieje.', 
		p_reservation_id;
  END IF;

  IF NOT f_trip_exists_future(v_trip_id) THEN
    RAISE EXCEPTION 
		'Wycieczka o trip_id = % nie istnieje lub już się odbyła.', 
		v_trip_id;
  END IF;

  IF v_old_status = p_new_status THEN
    RAISE EXCEPTION 
		'Rezerwacja % już ma status "%".', 
		p_reservation_id, 
		p_new_status;
  END IF;

  IF p_new_status = 'C' THEN
    UPDATE reservation
      SET status = 'C'
      WHERE reservation_id = p_reservation_id;

    UPDATE trip
      SET no_available_places = no_available_places + v_no_tickets
      WHERE trip_id = v_trip_id;
    RETURN;
  END IF;

  IF v_old_status = 'C' THEN
    SELECT no_available_places
      INTO v_available
      FROM trip
     WHERE trip_id = v_trip_id;

    IF v_available < v_no_tickets THEN
      RAISE EXCEPTION
        'Brak wolnych miejsc na wycieczce %: trzeba %, dostępne %.',
        v_trip_id,
        v_no_tickets,
        v_available;
    END IF;

    UPDATE reservation
       SET status = p_new_status
     WHERE reservation_id = p_reservation_id;

    UPDATE trip
       SET no_available_places = no_available_places - v_no_tickets
     WHERE trip_id = v_trip_id;

    RETURN;
  END IF;

  UPDATE reservation
     SET status = p_new_status
   WHERE reservation_id = p_reservation_id;
END;
$$;
```
---
# Zadanie 6b -  triggery


Obsługę pola `no_available_places` należy zrealizować przy pomocy triggerów
- podczas dodawania rezerwacji trigger powinien aktualizować pole `no_available_places` w tabeli trip
- podobnie, podczas zmiany statusu rezerwacji
- należy przygotować trigger/triggery oraz jeśli jest to potrzebne, zaktualizować procedury modyfikujące dane oraz widoki


>UWAGA
Należy stworzyć nowe wersje tych widoków/procedur/triggerów (np. dodając do nazwy dopisek 6b - od numeru zadania). Poprzednie wersje procedur należy pozostawić w celu  umożliwienia weryfikacji ich poprawności. 
- może  być potrzebne wyłączenie 'poprzednich wersji' triggerów 



## Rozwiązanie


```sql
CREATE PROCEDURE p_add_reservation_6b(
  p_trip_id    integer,
  p_person_id  integer,
  p_no_tickets integer
)
LANGUAGE plpgsql
AS $result$
BEGIN
  IF NOT f_person_exists(p_person_id) THEN
    RAISE EXCEPTION 
		'Osoba o person_id = % nie istnieje w bazie.', 
		p_person_id;
  END IF;

  IF p_no_tickets <= 0 THEN
    RAISE EXCEPTION 
		'Liczba biletów musi być dodatnia.';
  END IF;

  IF NOT f_trip_exists_future(p_trip_id) THEN
    RAISE EXCEPTION 
		'Wycieczka o trip_id = % nie istnieje, lub już się odbyła!', 
		p_trip_id;
  END IF;

  INSERT INTO reservation (trip_id, person_id, no_tickets, status)
  VALUES (p_trip_id, p_person_id, p_no_tickets, 'N');
END;
$result$;
CREATE PROCEDURE p_modify_reservation_status_6b(
  p_reservation_id  integer,
  p_new_status      char(1)
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_trip_id          integer;
  v_old_status       char(1);
BEGIN
  IF p_new_status NOT IN ('N', 'P', 'C') THEN
    RAISE EXCEPTION 
		'Błędne oznaczenie statusu. Dostępne: N, P, C';
  END IF;

  SELECT r.trip_id,
         r.status
    INTO v_trip_id,
         v_old_status
    FROM reservation r
   WHERE r.reservation_id = p_reservation_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 
		'Rezerwacja o reservation_id = % nie istnieje.', 
		p_reservation_id;
  END IF;

  IF NOT f_trip_exists_future(v_trip_id) THEN
    RAISE EXCEPTION 
		'Wycieczka o trip_id = % nie istnieje, lub już się odbyła!', 
		v_trip_id;
  END IF;

  IF v_old_status = p_new_status THEN
    RAISE EXCEPTION 
		'Rezerwacja % już ma status "%".', 
		p_reservation_id, 
		p_new_status;
  END IF;

  UPDATE reservation
     SET status = p_new_status
   WHERE reservation_id = p_reservation_id;
END;
$$;
CREATE PROCEDURE p_modify_reservation_6b(
  p_reservation_id  integer,
  p_no_tickets      integer
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_trip_id          integer;
  v_status           char(1);
BEGIN
  SELECT r.trip_id,
         r.status
    INTO v_trip_id,
         v_status
    FROM reservation r
   WHERE r.reservation_id = p_reservation_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 
		'Rezerwacja o reservation_id = % nie istnieje.', 
		p_reservation_id;
  END IF;

  IF NOT f_trip_exists_future(v_trip_id) THEN
    RAISE EXCEPTION 
		'Wycieczka o trip_id = % nie istnieje, lub już się odbyła!', 
		v_trip_id;
  END IF;

  IF v_status = 'C' THEN
    RAISE EXCEPTION 
		'Nie można zmienić liczby biletów rezerwacji %, ponieważ jest anulowana.',
		p_reservation_id;
  END IF;

  UPDATE reservation
     SET no_tickets = p_no_tickets
   WHERE reservation_id = p_reservation_id;
END;
$$;
```
```sql
CREATE FUNCTION trg_reservation_check_and_adjust()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_old_consumed   integer := 0;
  v_new_consumed   integer := 0;
  v_delta          integer;
  v_available      integer;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_old_consumed := 0;
  ELSE  -- UPDATE
    IF OLD.status IN ('N','P') THEN
      v_old_consumed := OLD.no_tickets;
    END IF;
  END IF;

  IF NEW.status IN ('N','P') THEN
    v_new_consumed := NEW.no_tickets;
  ELSE
    v_new_consumed := 0;
  END IF;

  v_delta := v_new_consumed - v_old_consumed;

  IF v_delta > 0 THEN
    SELECT no_available_places
      INTO v_available
      FROM trip
     WHERE trip_id = NEW.trip_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 
	  	'Wycieczka o id = % nie znaleziona.', 
		NEW.trip_id;
    END IF;

    IF v_available < v_delta THEN
      RAISE EXCEPTION
        'Brak wolnych miejsc na wycieczce %: trzeba %, dostępne %.',
        NEW.trip_id, 
		v_delta, 
		v_available;
    END IF;
  END IF;

  IF v_delta <> 0 THEN
    UPDATE trip
       SET no_available_places = no_available_places - v_delta
     WHERE trip_id = NEW.trip_id;
  END IF;

  RETURN NEW;
END;
$$;


CREATE TRIGGER trg_reservation_check_and_adjust
BEFORE INSERT OR UPDATE
ON reservation
FOR EACH ROW
EXECUTE FUNCTION trg_reservation_check_and_adjust();
```


# Zadanie 7 - podsumowanie

Porównaj sposób programowania w systemie PostgreSQL ze znanymi ci systemami/językami

```
Ze wszystkich systemów SQL w tym pisało mi się najlepiej, bardzo dużo składni jest uproszczonej (np. obsługa błędów, obiekty). 
Składniowo jest bardziej zbliżony do Oracle PL/SQL, ale może to wynikać z używania języka plpgsql.
Do niektórych rzeczy na pewno muszę się przyzwyczaić m.in. do pisania funkcji tworzących trigger, co nie było potrzebne w MS SQL SERVER ani Oracle PL/SQL.
```