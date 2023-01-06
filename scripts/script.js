const loading = document.querySelector(".loading");

function showLoading() {
    loading.style.display = "block";
}

function hideLoading() {
    loading.style.display = "none";
}



//Función que obtiene las listas de la API del NYTimes
async function getLists() {
    let res = await fetch("https://api.nytimes.com/svc/books/v3/lists/names.json?api-key=eADVyEagry9TgVbcwAGiUGpLnoAJguAg");
    let data = await res.json();
    return data
};

async function getBooks(list) {
    let res = await fetch(`https://api.nytimes.com/svc/books/v3/lists/current/${list}.json?api-key=eADVyEagry9TgVbcwAGiUGpLnoAJguAg`);
    let data = await res.json();
    return data
}




const body = document.querySelector("body");
const main = document.querySelector("#main");


getLists()
    .then(data => {
        for (list of data.results) {
            //Crea un div por cada lista que contiene el título, primera y última publicación y la frecuencia de actualización, además de un botón que ofrece más información sobre la lista
            let divList = document.createElement("div");
            main.appendChild(divList);
            let listTitle = document.createElement("p");
            listTitle.setAttribute("class", "listTitle");
            listTitle.innerHTML = list.display_name;
            divList.appendChild(listTitle);
            let oldest = document.createElement("p");
            oldest.setAttribute("class", "listData");
            oldest.innerHTML = "Oldest: " + list.oldest_published_date;
            divList.appendChild(oldest);
            let newest = document.createElement("p");
            newest.setAttribute("class", "listData");
            newest.innerHTML = "Newest: " + list.newest_published_date;
            divList.appendChild(newest);
            let updateFrecuency = document.createElement("p");
            updateFrecuency.setAttribute("class", "listData");
            updateFrecuency.innerHTML = "Updated: " + list.updated;
            divList.appendChild(updateFrecuency);
            let readMore = document.createElement("button");
            readMore.innerHTML = "READ MORE!";
            divList.appendChild(readMore);
            //Evento del botón que oculta todas las listas y muestra los datos de la lista. Incluye un botón que oculta la lista y vuelve a mostrarlas todas
            (function (listName) {
                readMore.addEventListener("click", function () {
                    window.scrollTo(0, 0);
                    getBooks(listName)
                        .then(data => {
                            main.style.display = "none";
                            showLoading();
                            let mainList = document.createElement("main");
                            body.appendChild(mainList)
                            let listTitle = document.createElement("p");
                            listTitle.innerHTML = data.results.display_name;
                            mainList.appendChild(listTitle);
                            let backToIndex = document.createElement("button");
                            backToIndex.innerHTML = "BACK TO INDEX";
                            mainList.appendChild(backToIndex);
                            backToIndex.addEventListener("click", function () {
                                mainList.style.display = "none";
                                main.style.display = "block";
                            });
                            for (book of data.results.books) {
                                let divBook = document.createElement("div");
                                mainList.appendChild(divBook);
                                let bookTitle = document.createElement("p");
                                bookTitle.innerHTML = `<h4>#${book.rank} ${book.title}</h4>`;
                                divBook.appendChild(bookTitle);
                                let bookImg = document.createElement("img");
                                bookImg.setAttribute("src", book.book_image);
                                bookImg.setAttribute("class", "bookImg");
                                divBook.appendChild(bookImg);
                                if (data.results.updated === "WEEKLY") {
                                    let weeksOnList = document.createElement("p");
                                    weeksOnList.innerHTML = `<i>Weeks on list: ${book.weeks_on_list}</i>`
                                    divBook.appendChild(weeksOnList);
                                }
                                let bookDescription = document.createElement("p");
                                bookDescription.innerHTML = book.description;
                                divBook.appendChild(bookDescription);
                                let amazonLink = document.createElement("button");
                                amazonLink.innerHTML = "BUY AT AMAZON";

                                (function (actualBook) {
                                    amazonLink.addEventListener("click", function () {
                                        window.open(actualBook.buy_links[0].url);
                                    });
                                })(book);
                                divBook.appendChild(amazonLink);
                            }
                            hideLoading();
                        })
                        .catch(error => console.log("Hubo un error: " + error));
                });
            })(list.list_name_encoded);
            hideLoading();
        }
    })
    .catch(error => console.log("Hubo un error: " + error));



