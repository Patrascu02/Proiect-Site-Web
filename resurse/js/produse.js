
window.addEventListener("load" , function(){

        document.getElementById("inp-pret").onchange=function(){
            document.getElementById("infoRange").innerHTML=`(${this.value})`
        }

        document.getElementById("filtrare").onclick=function(){
            var inpNume= document.getElementById("inp-nume").value.toLowerCase().trim();

            var radioprt=document.getElementsByName("gr_rad");
            let inpprt;
            for(let rad of radioprt){
                if(rad.checked){
                    inpprt=rad.value;
                    break;
                }
            }
            let minprt,maxprt
            if(inpprt!="toate"){//val intre care se va afla pretul
                vprt=inpprt.split(":")
                minprt=parseInt(vprt[0])
                maxprt=parseInt(vprt[1])
            }


            var inpPret= parseInt(document.getElementById("inp-pret").value);


            var inpBrand=document.getElementById("inp-brand").value.toLowerCase().trim()//select simplu


            var produse=document.getElementsByClassName("produs");
            for(let produs of produse ){
                let valNume = produs.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase().trim()

                let cond1=valNume.startsWith(inpNume)

                let valprt = parseInt(produs.getElementsByClassName("val-pret")[0].innerHTML)
                let cond2=(inpprt=="toate" || (minprt<=valprt&& valprt < maxprt));

                let valPret = parseFloat(produs.getElementsByClassName("val-pret")[0].innerHTML)
                let cond3=(valPret>inpPret)


                let valBrand = produs.getElementsByClassName("val-brand")[0].innerHTML.toLowerCase().trim()
                let cond4=(inpBrand==valBrand || inpBrand=="toate")


                if(cond1 && cond2 && cond3 && cond4){
                    produs.style.display="block";
                }
                else{

                    produs.style.display="none";
                }


            }
        }

        document.getElementById("resetare").onclick = function() {

            const confirmReset = confirm("Vrei cu adevărat să resetezi filtrele?");


            if (confirmReset) {

                resetFilters();
            }
        }

        function resetFilters() {

            document.getElementById("inp-nume").value = "";
            document.getElementById("inp-pret").value = document.getElementById("inp-pret").min;
            document.getElementById("inp-brand").value = "toate";
            document.getElementById("i_rad4").checked = true;

            var produse = document.getElementsByClassName("produs");
            document.getElementById("infoRange").innerHTML="(0)";
            for (let prod of produse) {
                prod.style.display = "block";
            }


        }

        function sorteaza(semn){ 
            var produse=document.getElementsByClassName("produs");
            let v_produse=Array.from(produse)
            v_produse.sort(function(a,b){
                let pret_a=parseInt(a.getElementsByClassName("val-pret")[0].innerHTML)
                let pret_b=parseInt(b.getElementsByClassName("val-pret")[0].innerHTML)
                if(pret_a==pret_b){
                    let nume_a=a.getElementsByClassName("val-nume")[0].innerHTML
                    let nume_b=b.getElementsByClassName("val-nume")[0].innerHTML
                    return semn*nume_a.localeCompare(nume_b)
                }
                return semn*(pret_a-pret_b);
            })
            console.log(v_produse)
            for(let prod of v_produse){
                prod.parentNode.appendChild(prod)
            }

        }

        document.getElementById("sortCrescNume").onclick= function(){
            sorteaza(1)
        }
        document.getElementById("sortDescrescNume").onclick= function(){
            sorteaza(-1)
        }


        window.onkeydown = function(e) {
            if (e.key == "c" && e.altKey) {//cand apasam c + alt
                var suma = 0;
                var produse = document.getElementsByClassName("produs");
                for (let produs of produse) {
                    var stil = getComputedStyle(produs);
                    if (stil.display != "none") {//daca apare prod
                        suma += parseFloat(produs.getElementsByClassName("val-pret")[0].innerHTML);
                    }
                }
                if(!document.getElementById("par_suma")){//face paragraful unde apare suma
                    let p=document.createElement("p")
                    p.innerHTML=suma;
                    p.id="par_suma";
                    container=document.getElementById("produse")
                    container.insertBefore(p,container.children[0])
                    setTimeout(function(){
                        var pgf=document.getElementById("par_suma")
                        if(pgf)
                        pgf.remove()
                    }, 2000)
                }
        }
        }



//cel mai ieftin prod

        var products = document.querySelectorAll(".produs");


        var cheapestProducts = {};
    
    
        products.forEach(function(product) {
    
            var category = product.querySelector(".val-brand").textContent;
            var price = parseFloat(product.querySelector(".val-pret").textContent);
            var productName = product.querySelector(".val-nume").textContent;
    
    
            if (!(category in cheapestProducts) || price < cheapestProducts[category].price) {
    
                cheapestProducts[category] = { price: price, productName: productName };
            }
        });
    
    
        Object.keys(cheapestProducts).forEach(function(category) {
            var cheapestProduct = cheapestProducts[category];//ia containerul celui mai ieftin prod din categ curenta 
    
            var productContainer = Array.from(products).find(function(product) {
                return product.querySelector(".val-nume").textContent === cheapestProduct.productName;
            });
            if (productContainer) {
                var saleTag = document.createElement("span");
                saleTag.classList.add("sale-tag");
                saleTag.textContent = "SALE";
                productContainer.appendChild(saleTag);
            }
        });




        /* MODAL  */
        var modal = document.getElementById("myModal");


        var btns = document.querySelectorAll(".produs");


        var span = document.getElementsByClassName("close")[0];


        btns.forEach(btn => {
            btn.onclick = function() {
                modal.style.display = "block";

                var productDetails =  "<h2> " + btn.querySelector(".val-nume").textContent + "</h2>"; // Example: Get product name
                productDetails +=  "<p> " + btn.querySelector(".val-marime").textContent + "</p>"
                productDetails +=   "<p> " + btn.querySelector(".val-pret").textContent + "</p>"
                productDetails +=  "<p> " + btn.querySelector(".val-brand").textContent + "</p>"
                productDetails +=   "<p> " + btn.querySelector(".val-categorie").textContent + "</p>"

                document.getElementById("productDetails").innerHTML = productDetails;
            }
        });


        span.onclick = function() {
            modal.style.display = "none";
        }


        window.onclick = function(event) {
            if (event.target == modal) {//sa inchida doar modalul
                modal.style.display = "none";
            }
        }

    


    })

    