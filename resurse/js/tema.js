document.addEventListener("DOMContentLoaded", function () {

    let darkMode = localStorage.getItem("darkMode");


    if (darkMode === "enabled") {//daca userul lasa pe dark asa sa raman si la urm load
        document.body.classList.add("dark-mode");
        document.body.classList.add("dark");

        slideToMoon();
    }


    document.getElementById("switch-theme").addEventListener("click", function () {
        if (document.body.classList.contains("dark")) {//daca faci click pe dark trebuie sa devina opusul adica soarele

            document.body.classList.remove("dark");
            localStorage.setItem("darkMode", "disabled");
            slideToSun();
        } else {

            document.body.classList.add("dark");
            localStorage.setItem("darkMode", "enabled");
            slideToMoon();
        }
    });


    function slideToSun() {
        document.querySelector(".theme-toggle i:first-child").style.transform = "translateX(0%)";
        document.querySelector(".theme-toggle i:last-child").style.transform = "translateX(130%)";


    }


    function slideToMoon() {
        document.querySelector(".theme-toggle i:first-child").style.transform = "translateX(-120%)";
        document.querySelector(".theme-toggle i:last-child").style.transform = "translateX(0%)";
    }
});