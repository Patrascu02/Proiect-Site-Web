
const express = require("express");
const fs= require('fs');
const path=require('path');
const sharp=require('sharp');
const sass=require('sass');
const ejs=require('ejs');
const xmljs=require('xml-js');
const { MongoClient } = require("mongodb");

const AccesBD= require("./module_proprii/accesbd.js");
const formidable=require("formidable");//formmular
const {Utilizator}=require("./module_proprii/utilizator.js")//utilizatori;
const session=require('express-session');//sesiuni
const Drepturi = require("./module_proprii/drepturi.js");//drepturi




let app = express();


  



const Client = require('pg').Client;
const QRCode= require('qrcode');
const puppeteer=require('puppeteer');

 
var client= new Client({database:"cti_2024",
        user:"patrascu02",
        password:"475RADU1",
        host:"localhost",
        port:5432});
client.connect();

client.query("select * from unnest (enum_range(null::brand_produse))",function(err,rez){
    console.log(rez);
})




obGlobal ={
    obErori:null,
    obImagini:null,
    folderScss:path.join(__dirname,"resurse/scss"),
    folderCss:path.join(__dirname,"resurse/css"),
    folderBackup:path.join(__dirname,"backup"),
    optiuniMeniu:[],
    protocol:"http://",
    numeDomeniu:"localhost:8080",
    clientMongo:null,
    bdMongo:null

}

const uri = "mongodb://localhost:27017";
obGlobal.clientMongo = new MongoClient(uri);
obGlobal.bdMongo = obGlobal.clientMongo.db('cti_2024');
/*async function afisFacturi(){
    const facturi=obGlobal.bdMongo.collection('facturi');
    const query={username:'prof67915'};
    const factura= await facturi.findOne(query);
    console.log("Factura:", factura);
}
afisFacturi()
*/

client.query("select * from unnest(enum_range(null::tipuri_produse))", function(err, rezCategorie){    
    if (err){        
        console.log(err);    
    }    
    else{        
        obGlobal.optiuniMeniu=rezCategorie.rows;    
    }
});

vect_foldere=["temp", "temp1","backup","poze_uploadate"]
for (let folder of vect_foldere){
    let caleFolder=path.join(__dirname, folder)
    if (!fs.existsSync(caleFolder)){
        fs.mkdirSync(caleFolder);//facem calea completa
    }
}

app= express();
console.log("Folder proiect", __dirname);
console.log("Cale fisier", __filename);
console.log("Director de lucru", process.cwd());

app.use(session({ // aici se creeaza proprietatea session a requestului (pot folosi req.session)   
    secret: 'abcdefg',//folosit de express session pentru criptarea id-ului de sesiune    
    resave: true, 
    saveUninitialized: false  
}));

app.use("/*",function(req, res, next){    
    res.locals.optiuniMeniu=obGlobal.optiuniMeniu;    
    res.locals.Drepturi=Drepturi;    //trimitem drepturi catre toate pag
    if (req.session.utilizator){     //  sa putem primi date despre fiecare utiliz,daca exista in sesiune
        req.utilizator=res.locals.utilizator=new Utilizator(req.session.utilizator);  //creeam un utiliz pe baza sesiunii  
    }        
    next();
})






 
app.set("view engine","ejs");
 
app.use("/resurse", express.static(__dirname+"/resurse"));
app.use("/poze_uploadate", express.static(__dirname+"/poze_uploadate"));
app.use("/node_modules", express.static(__dirname+"/node_modules"));



// --------------------------utilizatori online ------------------------------------------
function getIp(req){//pentru Heroku/Render    
    var ip = req.headers["x-forwarded-for"];
    //ip-ul userului pentru care este forwardat mesajul    
    if (ip){        
        let vect=ip.split(",");        
        return vect[vect.length-1];    
    }    else if (req.ip){        
        return req.ip;    
    }    
    else{     
        return req.connection.remoteAddress;    
    }
}

app.all("/*",function(req,res,next){    
    let ipReq=getIp(req);    
    if (ipReq){         
        var id_utiliz=req?.session?.utilizator?.id;       
        id_utiliz=id_utiliz?id_utiliz:null;       
         //console.log("id_utiliz", id_utiliz);        
         // TO DO comanda insert (folosind AccesBD) cu  ip, user_id, pagina(url  din request)       
        var obiectCerere;        
        if(id_utiliz){            
            obiectCerere={                
                ip: ipReq,                
                user_id:id_utiliz,                
                pagina: req.url            
            }        
        }        
        else{            
            obiectCerere={                
                ip: ipReq,                
                pagina: req.url            
            }        
        }        
        AccesBD.getInstanta().insert({            
            tabel:"accesari",            
            campuri:obiectCerere        
        }, function(err, rez){            
            if (err){                
                console.log(err)            
            }        
        })    
    }    
    next(); 
});

function stergeAccesariVechi(){    
    AccesBD.getInstanta().delete({        
        tabel:"accesari",        
        conditiiAnd:["now() - data_accesare >= interval '10 minutes' "]},         
        function(err, rez){           
            console.log(err);        
        })
    }
    
    stergeAccesariVechi();
    setInterval(stergeAccesariVechi, 10*60*1000);
    
    async function obtineUtilizatoriOnline(){    
        try{        
            var rez = await client.query("select username, nume, prenume from utilizatori where id in (select distinct user_id from accesari where now()-data_accesare <= interval '5 minutes')");            
            console.log(rez.rows);            
            return rez.rows        
        } catch (err) {            
            console.error(err);            
            return []        
        }
    }


//--------------------------------------locatie---------------------------------------
async function obtineLocatie() {    
    try {        
        const response = await fetch('https://secure.geobytes.com/GetCityDetails?key=7c756203dbb38590a66e01a5a3e1ad96&fqcn=109.99.96.15');        
        const obiectLocatie = await response.json();        
        console.log(obiectLocatie);        
        locatie=obiectLocatie.geobytescountry+" "+obiectLocatie.geobytesregion        
        return locatie    
    } catch(error) {        
        console.error(error);    
    }
}



function genereazaEvenimente(){    
    var evenimente=[]    
    var texteEvenimente=["Eveniment important", "Festivitate", "Prajituri gratis", "Zi cu soare", "Aniversare"];    
    var dataCurenta=new Date();    
    for(i=0;i<texteEvenimente.length;i++){        
        evenimente.push({            
            data: new Date(dataCurenta.getFullYear(), dataCurenta.getMonth(), Math.ceil(Math.random()*27) ),             
            text:texteEvenimente[i]        
        });    
    }    
    return evenimente;
}


//---------------------et 4-----------------------///
// app.get("/", function(req, res){
//     res.sendFile(__dirname+"/index.html")
// })


app.get(["/","/home","/index"],async function(req, res){
    res.render("pagini/index", {
        ip: req.ip,
        imagini:obGlobal.obImagini.imagini,
        useriOnline:await obtineUtilizatoriOnline(),
        locatie:await obtineLocatie(),
        evenimente:genereazaEvenimente()

    });
})

app.get("/produse", function(req, res){
    console.log(req.query)
    var conditieQuery="";
    if(req.query.brand){//daca brrandul exista
        conditieQuery=` where brand='${req.query.brand}'`// pentru filtrarea produselor pe baza brandului specificat
    }
    client.query("select * from unnest(enum_range(null::brand_produse))",function(err,rezOptiuni){

        client.query(`select * from adidasi ${conditieQuery}`, function(err, rez){        
        if(err){            
            console.log(err);            
            afisareEroare(res, 2);        
        }        
        else{       //daca nu are nicio eroare     
            res.render("pagini/produse", {produse: rez.rows, optiuni:rezOptiuni.rows} )        
        }            
        })
    });
})



app.get("/produs/:id_produs", function(req, res) {//definim ruta
    client.query('SELECT * FROM adidasi WHERE id_produs = $1', [req.params.id_produs], function(err, rez) {
        if (err) {
            console.log(err);
            afisareEroare(res, 2);
        } else {
            client.query('SELECT DISTINCT b.id_set,s.nume_set from seturi as s join asociere_set as b on s.id = b.id_set WHERE b.id_produs = $1',[req.params.id_produs], function(err, rezQuerySet){
                if(err){
                    console.log(err)
                    afisareEroare(res,2);
                }
                else{
                    let apartine_set = rezQuerySet.rows.length > 0 ? rezQuerySet.rows[0] : null;
                    res.render("pagini/produs", { prod: rez.rows[0], apartine_set: apartine_set });
                }
               
            })

        }
    });
});



app.get("/seturi" , function(req,res){
    client.query('select s.nume_set , s.descriere_set , b.id_set , b.id_produs , a.nume , a.descriere ,a.pret ,a.marime,a.material, a.categorie from seturi as s join asociere_set as b on s.id = b.id_set join adidasi as a on a.id_produs = b.id_produs;' , function(err , rezQuery){
        if(err){
            console.log(err);
            afisareEroare(res, 2);
        }
        else{
            res.render("pagini/seturi" , {seturi : rezQuery.rows})
            console.log(rezQuery.rows);
        }
    })
})

// ---------------------------------  cos virtual --------------------------------------
app.use(["/produse_cos","/cumpara"],express.json({limit:'2mb'}));//obligatoriu de setat pt request body de tip json


app.post("/produse_cos",function(req, res){    
    console.log(req.body);    
    if(req.body.ids_prod.length!=0){        
        //TO DO : cerere catre AccesBD astfel incat query-ul sa fie `select nume, descriere, pret, gramaj, imagine from prajituri where id in (lista de id-uri)`        
        AccesBD.getInstanta().select({tabel:"adidasi", campuri:"nume,descriere,pret,marime,imagine".split(","),conditiiAnd:[`id_produs in (${req.body.ids_prod})`]},        
        function(err, rez){            
            if(err)                
                res.send([]);            
            else                
            res.send(rez.rows);         
        });
    }    
    else{        
        res.send([]);    
    } 
});


cale_qr=__dirname+"/resurse/imagini/qrcode";
if (fs.existsSync(cale_qr))  
    fs.rmSync(cale_qr, {force:true, recursive:true});
fs.mkdirSync(cale_qr);
client.query("select id_produs from adidasi", function(err, rez){    
    for(let prod of rez.rows){        
        let cale_prod=obGlobal.protocol+obGlobal.numeDomeniu+"/produs/"+prod.id_produs;        
        //console.log(cale_prod);        
        QRCode.toFile(cale_qr+"/"+prod.id_produs+".png",cale_prod);    
    }
});


async function genereazaPdf(stringHTML,numeFis, callback) {    
    const chrome = await puppeteer.launch();    
    const document = await chrome.newPage();    
    console.log("inainte load")    
    //await document.setContent(stringHTML, {waitUntil:"load"});    
    await document.setContent(stringHTML, {waitUntil:"load"});        
    console.log("dupa load")    
    await document.pdf({path: numeFis, format: 'A4'});        
    console.log("dupa pdf")    
    await chrome.close();        
    console.log("dupa inchidere")    
    if(callback)        
        callback(numeFis);
    }





    function insereazaFactura(req,rezultatRanduri){
        rezultatRanduri.rows.forEach(function (elem){ elem.cantitate=1});
        let jsonFactura= {
            data: new Date(),
            username: req.session.utilizator.username,
            produse:rezultatRanduri.rows
        }
        console.log("JSON factura", jsonFactura)
        if(obGlobal.bdMongo){
            obGlobal.bdMongo.collection("facturi").insertOne(jsonFactura, function (err, rezmongo){
                if (err) console.log(err)
                else console.log ("Am inserat factura in mongodb");
    
                obGlobal.bdMongo.collection("facturi").find({}).toArray(
                    function (err, rezInserare){
                        if (err) console.log(err)
                        else console.log (rezInserare);
                })
            })
        }
    }
    
    app.post("/cumpara",function(req, res){    
        console.log(req.body);    
        if (req?.utilizator?.areDreptul?.(Drepturi.cumparareProduse)){        
            AccesBD.getInstanta().select({            
                tabel:"adidasi",            
                campuri:["*"],            
                conditiiAnd:[`id_produs in (${req.body.ids_prod})`]        
            }, function(err, rez){            
                if(!err  && rez.rowCount>0){                
                    console.log("produse:", rez.rows);                
                    let rezFactura= ejs.render(fs.readFileSync("./views/pagini/factura.ejs").toString("utf-8"),{                    
                        protocol: obGlobal.protocol,                     
                        domeniu: obGlobal.numeDomeniu,                    
                        utilizator: req.session.utilizator,                    
                        produse: rez.rows                
                    });                
                    console.log(rezFactura);                
                    let numeFis=`./temp/factura${(new Date()).getTime()}.pdf`;                
                    genereazaPdf(rezFactura, numeFis, function (numeFis){                    
                        mesajText=`Stimate ${req.session.utilizator.username} aveti mai jos factura.`;                    
                        mesajHTML=`<h2>Stimate ${req.session.utilizator.username},</h2> aveti mai jos factura.`;                    
                        req.utilizator.trimiteMail("Factura", mesajText,mesajHTML,[{                        
                            filename:"factura.pdf",                        
                            content: fs.readFileSync(numeFis)                    
                        }] 
                    );                    
                    res.send("Totul e bine!");                
                });  
                insereazaFactura(req,rez)                          
            }        
        })    
    }    
    else{        
        res.send("Nu puteti cumpara daca nu sunteti logat sau nu aveti dreptul!");    
    }    
});










//cele cu on sunt evenimente 
app.post("/inregistrare",function(req, res){    
    var username;    
    var poza;    
    var formular= new formidable.IncomingForm()    //formular care vine
    formular.parse(req, function(err, campuriText, campuriFisier ){//4 ultmul pt ca trebuie sa avem toate campurile pt a crea utiliz.
          
        console.log("Inregistrare:",campuriText);        
        console.log(campuriFisier);        
        console.log(poza, username);        
        var eroare="";        
        var utilizNou=new Utilizator()    
        try{            
            utilizNou.setareNume=campuriText.nume[0];            
            utilizNou.setareUsername=campuriText.username[0];            
            utilizNou.email=campuriText.email[0]    ;        
            utilizNou.prenume=campuriText.prenume[0] ;                      
            utilizNou.parola=campuriText.parola[0];            
            utilizNou.culoare_chat=campuriText.culoare_chat[0];            
            utilizNou.poza= poza;            
            Utilizator.getUtilizDupaUsername(campuriText.username, {}, function(u, parametru ,eroareUser ){                
                if (eroareUser==-1){//nu exista username-ul in BD                    
                  
                    utilizNou.salvareUtilizator()                
                }                
                else{                    
                    eroare+="Mai exista username-ul";                
                }                
                if(!eroare){                    
                    res.render("pagini/inregistrare", {raspuns:"Inregistrare cu succes!"})                                   
                }                
                else                    
                res.render("pagini/inregistrare", {err: "Eroare: "+eroare});            
            })                   
        }        
        catch(e){            
            console.log(e);            
            eroare+= "Eroare site; reveniti mai tarziu";            
            console.log(eroare);            
            res.render("pagini/inregistrare", {err: "Eroare: "+eroare})        
        }       
    });    
    formular.on("field", function(nume,val){  // 1   sa salvam username intr un folder        
        console.log(`--- ${nume}=${val}`);               
        if(nume=="username")            
            username=val;    
        })    
        formular.on("fileBegin", function(nume,fisier){ //2        
            console.log("fileBegin");               
            console.log(nume,fisier);        
            //TO DO adaugam folderul poze_uploadate ca static si sa fie creat de aplicatie 

            //TO DO in folderul poze_uploadate facem folder cu numele utilizatorului (variabila folderUser)        
            var folderUser =path.join(__dirname,"poze_uploadate",username)               
            
            if(!fs.existsSync(folderUser))
                fs.mkdirSync(folderUser);//fiecare user va avea un folder cu numele lui


            fisier.filepath=path.join(folderUser, fisier.originalFilename)  //in acest folder salvam fisierul uploadat      
            poza=fisier.originalFilename;        
            //fisier.filepath=folderUser+"/"+fisier.originalFilename        
            console.log("fileBegin:",poza)        
            console.log("fileBegin, fisier:",fisier)    
        })        
        formular.on("file", function(nume,fisier){//3        
            console.log("file");        
            console.log(nume,fisier);    
        });
    });


app.post("/login",function(req, res){    
    /*TO DO parametriCallback: cu proprietatile: request(req), response(res) si parola        
    testam daca parola trimisa e cea din baza de date        
    testam daca a confirmat mailul    */    
    var username;    
    console.log("ceva");    
    var formular= new formidable.IncomingForm()  

       
    formular.parse(req, function(err, campuriText, campuriFisier ){ 
        var parametriCallback= {
            req:req,
            res:res,
            parola:campuriText.parola[0]
        }       
        Utilizator.getUtilizDupaUsername (campuriText.username[0],parametriCallback,
            function(u, obparam ,eroare){//proceseazaUtiliz 
            let parolaCriptata=Utilizator.criptareParola(obparam.parola)

            if(u.parola==parolaCriptata & u.confirmat_mail){                
                u.poza=u.poza?path.join("poze_uploadate",u.username, u.poza):"";                
                obparam.req.session.utilizator=u;                               
                obparam.req.session.mesajLogin="Bravo! Te-ai logat!";                
                obparam.res.redirect("/index");                            
            }            
            else{                
                console.log("Eroare logare")                
                obparam.req.session.mesajLogin="Date logare incorecte sau nu a fost confirmat mailul!";                
                obparam.res.redirect("/index");            
            }        
                })    
            });    
    });   
    

app.get("/logout", function(req, res){//daca da logout sa apara iar formularul de login
    req.session.destroy();
    res.locals.utilizator=null;
    res.render("pagini/logout");
});



//http://${Utilizator.numeDomeniu}/cod/${utiliz.username}/${token}
app.get("/cod/:username/:token",function(req,res){
    /*TO DO parametriCallback: cu proprietatile: request (req) si token (luat din parametrii cererii)
        setat parametriCerere pentru a verifica daca tokenul corespunde userului
    */
    console.log(req.params);
    
    try {
        var parametriCallback={
            req:req,
            token:req.params.token//token=cod+username
        }
        Utilizator.getUtilizDupaUsername(req.params.username,parametriCallback ,function(u,obparam){
            let parametriCerere={
                tabel:"utilizatori",
                campuri:{confirmat_mail:true},
                conditiiAnd:[`id=${u.id}`]
            };
            AccesBD.getInstanta().update(
                parametriCerere, 
                function (err, rezUpdate){
                    if(err || rezUpdate.rowCount==0){
                        console.log("Cod:", err);
                        afisareEroare(res,3);
                    }
                    else{
                        res.render("pagini/confirmare.ejs");
                    }
                })
        })
    }
    catch (e){
        console.log(e);
        afisareEroare(res,2);
    }
})



app.post("/profil", function(req, res){
    console.log("profil");
    if (!req.session.utilizator){
        afisareEroare(res,403,)
        return;
    }
    var formular= new formidable.IncomingForm();//parseaza datele utiliz
 
    formular.parse(req,function(err, campuriText, campuriFile){
       
        var parolaCriptata=Utilizator.criptareParola(campuriText.parola[0]);
 
        AccesBD.getInstanta().updateParametrizat(
            {tabel:"utilizatori",
            campuri:["nume","prenume","email","culoare_chat"],
            valori:[
                `${campuriText.nume[0]}`,
                `${campuriText.prenume[0]}`,
                `${campuriText.email[0]}`,
                `${campuriText.culoare_chat[0]}`],
            conditiiAnd:[
                `parola='${parolaCriptata}'`,
                `username='${campuriText.username[0]}'`
            ]
        },          
        function(err, rez){
            if(err){
                console.log(err);
                afisareEroare(res,2);
                return;
            }
            console.log(rez.rowCount);
            if (rez.rowCount==0){
                res.render("pagini/profil",{mesaj:"Update-ul nu s-a realizat. Verificati parola introdusa."});
                return;
            }
            else{            
                //actualizare sesiune
                console.log("ceva");
                req.session.utilizator.nume= campuriText.nume[0];
                req.session.utilizator.prenume= campuriText.prenume[0];
                req.session.utilizator.email= campuriText.email[0];
                req.session.utilizator.culoare_chat= campuriText.culoare_chat[0];
                res.locals.utilizator=req.session.utilizator;
            }
 
 
            res.render("pagini/profil",{mesaj:"Update-ul s-a realizat cu succes."});
 
        });
       
 
    });
});


app.get("/useri", function(req, res){    
    /* TO DO    
    * in if testam daca utilizatorul din sesiune are dreptul sa vizualizeze utilizatori    
    * completam obiectComanda cu parametrii comenzii select pentru a prelua toti utilizatorii  
    * */  
    if(req?.utilizator?.areDreptul(Drepturi.vizualizareUtilizatori)){      //daca lips vreo prop ne da null  
        var obiectComanda={
            tabel:"utilizatori",
            campuri:["*"],
            //sa selectam tot
            conditiiAnd:[]
        } ;        
        AccesBD.getInstanta().select(obiectComanda, function(err, rezQuery){           
            console.log(err);            
            res.render("pagini/useri", {useri: rezQuery.rows});        
        });            
    }    
    else{        
        afisareEroare(res, 403);    
    }    
    });



    ///async function f(){
    //    console.log(1);
       // return 100;
    //}



   // rez =await  f();


    
    app.post("/sterge_utiliz", function(req, res){    
        /* TO DO    
    * in if testam daca utilizatorul din sesiune are dreptul sa stearga utilizatori    
    * completam obiectComanda cu parametrii comenzii select pentru a prelua toti utilizatorii  
    * */  
    if(req?.utilizator?.areDreptul(Drepturi.stergereUtilizatori)){        
        var formular= new formidable.IncomingForm();   

        formular.parse(req,function(err, campuriText, campuriFile){                
                var obiectComanda= {
                    tabel:"utilizatori",
                    campuri:["*"],
                    //sa selectam tot
                    conditiiAnd:[`id=${campuriText.id_utiliz[0]}`]
                } ;                     
                AccesBD.getInstanta().delete(obiectComanda, function(err, rezQuery){                
                console.log(err);                
                res.redirect("/useri");            
            });        
        });    
    }else{        
        afisareEroare(res,403);    
    } 

})



///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Contact
app.use(["/contact"], express.urlencoded({ extended: true }));

const caleXMLMesaje = "resurse/xml/contact.xml";
const headerXML = `<?xml version="1.0" encoding="utf-8"?>`;

function creeazaXMlContactDacaNuExista() {
    if (!fs.existsSync(caleXMLMesaje)) {
        let initXML = {
            "declaration": {
                "attributes": {
                    "version": "1.0",
                    "encoding": "utf-8"
                }
            },
            "elements": [
                {
                    "type": "element",
                    "name": "contact",
                    "elements": [
                        {
                            "type": "element",
                            "name": "mesaje",
                            "elements": []
                        }
                    ]
                }
            ]
        };
        let sirXml = xmljs.js2xml(initXML, { compact: false, spaces: 4 }); // obtin sirul xml (cu taguri)
        console.log(sirXml);
        fs.writeFileSync(caleXMLMesaje, sirXml);
        return false; // l-a creat
    }
    return true; // nu l-a creat acum
}

function parseazaMesaje() {
    let existaInainte = creeazaXMlContactDacaNuExista();
    let mesajeXml = [];
    let obJson;
    if (existaInainte) {
        let sirXML = fs.readFileSync(caleXMLMesaje, 'utf8');
        obJson = xmljs.xml2js(sirXML, { compact: false, spaces: 4 });
        let elementMesaje = obJson.elements[0].elements.find(function (el) {
            return el.name == "mesaje";
        });
        let vectElementeMesaj = elementMesaje.elements ? elementMesaje.elements : []; // conditie ? val_true : val_false
        console.log("Mesaje: ", obJson.elements[0].elements.find(function (el) {
            return el.name == "mesaje";
        }));
        let mesajeXml = vectElementeMesaj.filter(function (el) { return el.name == "mesaj" });
        return [obJson, elementMesaje, mesajeXml];
    }
    return [obJson, [], []];
}

app.get("/contact", function (req, res) {
    let obJson, elementMesaje, mesajeXml;
    [obJson, elementMesaje, mesajeXml] = parseazaMesaje();
    res.render("pagini/contact", { utilizator: req.session.utilizator, mesaje: mesajeXml });
});

app.post("/contact", function (req, res) {
    let obJson, elementMesaje, mesajeXml;
    [obJson, elementMesaje, mesajeXml] = parseazaMesaje();
    
    let u = req.session.utilizator ? req.session.utilizator.username : "anonim";
    let mesajNou = {
        type: "element",
        name: "mesaj",
        attributes: {
            username: u,
            data: new Date()
        },
        elements: [{ type: "text", "text": req.body.mesaj }]
    };
    if (elementMesaje.elements)
        elementMesaje.elements.push(mesajNou);
    else
        elementMesaje.elements = [mesajNou];
    
    console.log(elementMesaje.elements);
    let sirXml = xmljs.js2xml(obJson, { compact: false, spaces: 4 });
    console.log("XML: ", sirXml);
    fs.writeFileSync("resurse/xml/contact.xml", sirXml);
    
    res.render("pagini/contact", { utilizator: req.session.utilizator, mesaje: elementMesaje.elements });
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////



app.get("/contact",  function(req, res){
    res.render("pagini/contact");
})

// trimiterea unui mesaj fix
app.get("/cerere", function(req, res){
    res.send("<b>Hello</b> <span style='color:red'>world!</span>");

})

//trimiterea unui mesaj dinamic

app.get("/data", function(req, res, next){
    res.write("Data: ");
    next();
});
app.get("/data", function(req, res){
    res.write(""+new Date());
    res.end();

});

/*
trimiterea unui mesaj dinamic in functie de parametri (req.params; req.query)
ce face /* si ordinea app.get-urilor.
*/
app.get("/suma/:a/:b", function(req, res){
    var suma=parseInt(req.params.a)+parseInt(req.params.b)
    res.send(""+suma);

});

app.get("/favicon.ico", function(req, res){
    res.sendFile(path.join(__dirname,"resurse/favicon/favicon.ico"));
    
});
 
app.get("/*.ejs", function(req, res){
    afisareEroare(res,400);
    
});

app.get(new RegExp("^\/[A-Za-z\/0-9]*\/$"), function(req, res){
    afisareEroare(res,403);
    
});

app.get("/*", function(req, res){
   console.log(req.url)
    try {
        res.render("pagini"+req.url, function(err, rezHtml){
             //console.log(rezHtml);
             //console.log("Eroare:"+err)

                if (err){
                    if (err.message.startsWith("Failed to lookup view")){
                        afisareEroare(res,404);
                        console.log("Nu a gasit pagina: ", req.url)
                    }
                    
                }
                else{
                    res.send(rezHtml);
                }

            
        });         
    }
    catch (err1){
        if (err1.message.startsWith("Cannot find module")){
            afisareEroare(res,404);
            console.log("Nu a gasit resursa: ", req.url)
        }
        else{
            afisareEroare(res);
            console.log("Eroare:"+err1)
        }
    }

})  
 
function initErori(){
    var continut= fs.readFileSync(path.join(__dirname,"resurse/json/erori.json")).toString("utf-8");
    console.log(continut);
    
    obGlobal.obErori=JSON.parse(continut);
    for (let eroare of obGlobal.obErori.info_erori){
        eroare.imagine=path.join(obGlobal.obErori.cale_baza,eroare.imagine)//actualizeaza calea imag
    }
    obGlobal.obErori.eroare_default=path.join(obGlobal.obErori.cale_baza,obGlobal.obErori.eroare_default.imagine)
    console.log(obGlobal.obErori);

} 
initErori()


function afisareEroare(res, _identificator, _titlu, _text, _imagine){
    let eroare=obGlobal.obErori.info_erori.find(
        function(elem){
            return elem.identificator==_identificator
        }
    )
    if (!eroare){
        let eroare_default=obGlobal.obErori.eroare_default;
        res.render("pagini/eroare", {
            titlu: _titlu || eroare_default.titlu,
            text: _text || eroare_default.text,
            imagine: _imagine || eroare_default.imagine,
        }) //al doilea argument este locals
        return;
    }
    else{//daca eroarea a fost gasita
        if (eroare.status)
            res.status(eroare.identificator)

        res.render("pagini/eroare", {
            titlu: _titlu || eroare.titlu,
            text: _text || eroare.text,
            imagine: _imagine || eroare.imagine,
        })
        return;

    }

}


function initImagini(){
    var continut= fs.readFileSync(path.join(__dirname,"resurse/json/galerie.json")).toString("utf-8");

    obGlobal.obImagini=JSON.parse(continut);
    let vImagini=obGlobal.obImagini.imagini;

    let caleAbs=path.join(__dirname,obGlobal.obImagini.cale_galerie);
    let caleAbsMediu=path.join(__dirname,obGlobal.obImagini.cale_galerie, "mediu");
    if (!fs.existsSync(caleAbsMediu))
        fs.mkdirSync(caleAbsMediu);

    //for (let i=0; i< vErori.length; i++ )
    for (let imag of vImagini){
        [numeFis, ext]=imag.fisier.split(".");
        let caleFisAbs=path.join(caleAbs,imag.fisier);
        let caleFisMediuAbs=path.join(caleAbsMediu, numeFis+".webp");
        sharp(caleFisAbs).resize(300).toFile(caleFisMediuAbs);//bibliotec a care redimensioneaza automat
        imag.fisier_mediu=path.join("/", obGlobal.obImagini.cale_galerie, "mediu",numeFis+".webp" )//cale abs pt fis mediu
        imag.fisier=path.join("/", obGlobal.obImagini.cale_galerie, imag.fisier )
        
    }
    console.log(obGlobal.obImagini)
}
initImagini();

//----------------compileazaScss----------------------// 
function compileazaScss(caleScss, caleCss){    
    console.log("cale:",caleCss);    
    if(!caleCss){
        let numeFisExt=path.basename(caleScss);        
        let numeFis=numeFisExt.split(".")[0]   /// "a.scss"  -> ["a","scss"]        
        caleCss=numeFis+".css";   
    }

    if (!path.isAbsolute(caleScss))        
    caleScss=path.join(obGlobal.folderScss,caleScss )    
    
    if (!path.isAbsolute(caleCss))        
    caleCss=path.join(obGlobal.folderCss,caleCss )
    
    let caleBackup=path.join(obGlobal.folderBackup, "resurse/css");    
    if (!fs.existsSync(caleBackup)) {        //daca nu are cale catre folderul de backup
        fs.mkdirSync(caleBackup,{recursive:true})    
    }
    
       
    let numeFisCss=path.basename(caleCss);    
    if (fs.existsSync(caleCss)){        
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, "resurse/css",numeFisCss ))//copie de rezerva
    }
    rez=sass.compile(caleScss, {"sourceMap":true});   
    fs.writeFileSync(caleCss,rez.css)    
    //console.log("Compilare SCSS",rez);
}
//compileazaScss("a.scss");
vFisiere=fs.readdirSync(obGlobal.folderScss);
for( let numeFis of vFisiere ){    
    if (path.extname(numeFis)==".scss"){        
        compileazaScss(numeFis)
    }
}

fs.watch(obGlobal.folderScss, function(eveniment, numeFis){  
    console.log(eveniment, numeFis);
    if (eveniment=="change" || eveniment=="rename"){
        let caleCompleta=path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)){            
            compileazaScss(caleCompleta);
        }
    }
})


// -------------------------------------------------------------------CHAT---------------------------------------------------------------------------

// initializari socket.io
const http=require('http')
const socket = require('socket.io');
const server = new http.createServer(app);
var io = socket(server);
io = io.listen(server);//asculta pe acelasi port ca si serverul



io.on("connection", (socket) => {
    console.log("Conectare!");
    //if(!conexiune_index)
    //    conexiune_index=socket
    socket.on('disconnect', () => {conexiune_index=null;console.log('Deconectare')});
});


app.post('/mesaj', function(req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        console.log("primit mesaj");
        console.log(fields);
        io.sockets.emit('mesaj_nou', fields.nume, fields.culoare, fields.mesaj, fields.font);
        res.send("ok");
    });
});



app.get('/chat', function(req, res)  {
    const utilizator = req.session.utilizator; 
    res.render('chat', { utilizator: utilizator });
});









server.listen(8080);
console.log("Serverul a pornit");