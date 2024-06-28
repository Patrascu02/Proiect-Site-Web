DROP TYPE IF EXISTS categ_adidasi;/*resetare de tabel*/
DROP TYPE IF EXISTS brand_produse;

CREATE TYPE categ_adidasi AS ENUM( 'editie speciala', 'editie limitata', 'pentru barbati', 'pentru copii', 'pentru femei','unisex','oferta black friday');
CREATE TYPE brand_produse AS ENUM('Nike','Adidas','Jordan');/*pt fiecare specificator enum asoc un intreg*/


CREATE TABLE IF NOT EXISTS adidasi (--daca nu exista tabelul il creeam 
   id serial PRIMARY KEY,--identif unic ,serial va genera automat un ob de tip  secventa ce gen nr(id ul) 
   nume VARCHAR(100)  NOT NULL,
   descriere TEXT,-- bucati mari de text (dif intre text si varchar)
   pret NUMERIC(8,2) NOT NULL,--sa fie cu cifre ,2-cu 2 zecimale
   marime INT NOT NULL CHECK (marime>=0),--sa fim siguri ca adidasii nu au size negativ
   tip_produs varchar(30) DEFAULT 'adidasi',--default e daca nu punem nimic el pune autom cofetarie
   categorie categ_adidasi DEFAULT 'unisex',
   brand brand_produse DEFAULT 'Nike',
   material VARCHAR [], --pot sa nu fie specificate deci nu punem NOT NULL
   imagine VARCHAR(300),--
   data_adaugare TIMESTAMP DEFAULT current_timestamp
);

INSERT into adidasi (nume,descriere,pret, marime, tip_produs, categorie, brand, material, imagine) VALUES 

('Air force 1 low','Cei mai buni adidasi in raport calitate-pret',800.00,44,'adidasi','unisex','Nike','{"piele intoarsa","bumbac"}',''),

('Stan Smith','Adidasi clasici pentru orice garderoba',250.00,40,'adidasi','pentru barbati','Adidas','{"piele","sintetic"}',''),

('Air Jordan 1 Mid','O reinterpretare moderna a unei legende',300.00,42,'adidasi','pentru barbati','Jordan','{"piele","sintetic"}',''),

('Air Max 90','Adidasi clasici, confortabili si stilati',220.00,41,'adidasi','pentru femei','Nike','{"material textil","piele"}',''),

('Yeezy Boost 350','Design inovativ si confort maxim',500.00,43,'adidasi','pentru femei','Adidas','{"material textil","cauciuc"}',''),

('Blazer Mid','Stil urban si confort maxim',180.00,39,'adidasi','pentru femei','Nike','{"piele","material textil"}',''),

('Jordan 5 Retro','Estetica inconfundabila si confort excelent',350.00,42,'adidasi','pentru barbati','Jordan','{"piele","material textil"}',''),

('Superstar','Clasici si versatili, potriviti pentru orice tinuta',150.00,38,'adidasi','pentru copii','Adidas','{"piele","sintetic"}',''),

('React Element 55','Confort si design modern',280.00,45,'adidasi','pentru copii','Nike','{"material textil","cauciuc"}',''),

('Jordan 3 Retro','Estetica iconica si confort superior',320.00,41,'adidasi','pentru copii','Jordan','{"piele","material textil"}',''),

('UltraBoost','Alergare fara efort si confort exceptional',280.00,44,'adidasi','pentru barbati','Adidas','{"material textil","cauciuc"}',''),

('Air Presto','Confort remarcabil si design futurist',200.00,39,'adidasi','pentru femei','Nike','{"material textil","cauciuc"}',''),

('Jordan 6 Retro','Stil legendar si confort de neegalat',400.00,43,'adidasi','pentru barbati','Jordan','{"piele","material textil"}',''),

('NMD','Design modern si tehnologie Boost',260.00,42,'adidasi','pentru femei','Adidas','{"material textil","cauciuc"}',''),

('Air Jordan 11 Retro','Eleganta si confort',450.00,41,'adidasi','pentru barbati','Jordan','{"piele","material textil"}',''),

('Air Max 97','Stil iconic si confort maxim',300.00,40,'adidasi','pentru femei','Nike','{"material textil","cauciuc"}',''),

('Air Jordan 4 Retro','Stil remarcabil si performanta',380.00,42,'adidasi','pentru barbati','Jordan','{"piele","material textil"}',''),

('Gazelle','Simpli si versatili',120.00,38,'adidasi','pentru copii','Adidas','{"piele","sintetic"}',''),

('Cortez','Stil clasic si confortabil',130.00,41,'adidasi','pentru copii','Nike','{"piele","material textil"}',''),

('Jordan 1 Retro High','Retro si modernitate intr-un singur design',350.00,44,'adidasi','pentru barbati','Jordan','{"piele","material textil"}',''),

('Stan Smith','Clasici si versatili, potriviti pentru orice tinuta',150.00,38,'adidasi','pentru femei','Adidas','{"piele","sintetic"}','');
