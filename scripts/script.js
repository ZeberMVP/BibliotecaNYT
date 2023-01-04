// API Key: eADVyEagry9TgVbcwAGiUGpLnoAJguAg

//Función que obtiene las listas de la API del NYTimes
async function getLists() {
    let res = await fetch("https://api.nytimes.com/svc/books/v3/lists/names.json?api-key=eADVyEagry9TgVbcwAGiUGpLnoAJguAg");
    let data = await res.json();
    return data
};

let main = document.querySelector("main");

getLists()
    .then(data => {
        for (element of data.results) {
            //Crea un div por cada lista que contiene el título, primera y última publicación y la frecuencia de actualización, además de un botón que ofrece más información sobre la lista
            let divList = document.createElement("div");
            main.appendChild(divList);
            let listTitle = document.createElement("p");
            listTitle.setAttribute("class", "listTitle");
            listTitle.innerHTML = element.display_name;
            divList.appendChild(listTitle);
            let oldest = document.createElement("p");
            oldest.setAttribute("class", "listData");
            oldest.innerHTML = "Oldest: " + element.oldest_published_date;
            divList.appendChild(oldest);
            let newest = document.createElement("p");
            newest.setAttribute("class", "listData");
            newest.innerHTML = "Newest: " + element.newest_published_date;
            divList.appendChild(newest);
            let updateFrecuency = document.createElement("p");
            updateFrecuency.setAttribute("class", "listData");
            updateFrecuency.innerHTML = "Updated: " + element.updated;
            divList.appendChild(updateFrecuency);
            let readMore = document.createElement("button");
            readMore.innerHTML = "READ MORE!";
            divList.appendChild(readMore);
            //Evento del botón que oculta todas las listas y muestra los datos de la lista. Incluye un botón que oculta la lista y vuelve a mostrarlas todas
            readMore.addEventListener("click", function () {
                main.style.display = "none";
                
            });
        }
    })
    .catch(error => console.log("Hubo un error: " + error));



