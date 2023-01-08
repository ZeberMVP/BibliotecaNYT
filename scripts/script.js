const firebaseConfig = {
    apiKey: "AIzaSyDMyExNJUwatSZkhEZjf7GLa5PENx0VsYg",
    authDomain: "biblioteca-nytimes.firebaseapp.com",
    projectId: "biblioteca-nytimes",
    storageBucket: "biblioteca-nytimes.appspot.com",
    messagingSenderId: "918383085779",
    appId: "1:918383085779:web:1544878e69939fd1352c26"
};

firebase.initializeApp(firebaseConfig);//Inicializar app Firebase

const db = firebase.firestore();//db representa mi BBDD //inicia Firestore
const favoritesLists = db.collection("favoritesLists");

//Registro de usuario
const signUpUser = (email, password) => {
    firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            //Registrado
            let user = userCredential.user;
            alert(`se ha registrado ${user.email}`)
            favoritesLists.doc(user.uid).set({})

        })
        .catch((error) => {
            let errorCode = error.code;
            let errorMessage = error.message;
            console.log(errorCode);
            console.log(errorMessage);
        });
};

document.getElementById("form1").addEventListener("submit", function (event) {
    event.preventDefault();
    let email = event.target.elements.email.value;
    let pass = event.target.elements.pass.value;
    let pass2 = event.target.elements.pass2.value;
    pass === pass2 ? signUpUser(email, pass) : alert("error: passwords didn't match");
    document.getElementById("form1").reset();
})

//Login de usuario
const signInUser = (email, password) => {
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            //Usuario logado
            let user = userCredential.user;
            alert(`se ha logado ${user.email}`)
        })
        .catch((error) => {
            let errorCode = error.code;
            let errorMessage = error.message;
            console.log(errorCode);
            console.log(errorMessage);
        });
}

document.getElementById("form2").addEventListener("submit", function (event) {
    event.preventDefault();
    let email = event.target.elements.email2.value;
    let pass = event.target.elements.pass3.value;
    signInUser(email, pass);
    document.getElementById("form2").reset();
})

//Cerrar sesión de usuario
const signOut = () => {
    let user = firebase.auth().currentUser;
    firebase.auth().signOut().then(() => {
        alert("Sale del sistema: " + user.email);
    }).catch((error) => {
        console.log("Hubo un error: " + error);
    });
}

document.getElementById("logout").addEventListener("click", signOut);
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        console.log(`Está en el sistema:${user.email}`);
    } else {
        console.log("No hay usuarios en el sistema");
    }
});

//Funciones para enseñar y ocultar la animación de carga
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

//Función para añadir a favoritos o eliminar de favoritos

function toggleFavorites(bookId) {
    let userId = firebase.auth().currentUser.uid;
    favoritesLists.doc(userId).get().then((doc) => {
        let favorites = doc.data() || {};
        if (favorites[bookId]) {
            // El libro ya está en la lista, eliminar
            favoritesLists.doc(userId).update({ [bookId]: firebase.firestore.FieldValue.delete() });
        } else {
            // El libro no está en la lista, añadir
            favoritesLists.doc(userId).update({ [bookId]: true });
        }
    });
}

const getFavorites = async () => {
    let userId = firebase.auth().currentUser.uid;
    const doc = await favoritesLists.doc(userId).get();
    let favorites = doc.data();
    return favorites;
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
            listTitle.innerHTML = `<h3>${list.display_name}</h3>`;
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
                                divBook.appendChild(amazonLink);
                                let favoritesButton = document.createElement("button");
                                divBook.appendChild(favoritesButton);
                                (function (actualBook) {
                                    getFavorites().then((favorites) => {
                                        if (favorites[actualBook.title]) {
                                            favoritesButton.innerHTML = "DELETE FROM FAVORITES"
                                        } else {
                                            favoritesButton.innerHTML = "ADD TO FAVORITES"
                                        }
                                    });
                                    amazonLink.addEventListener("click", function () {
                                        window.open(actualBook.buy_links[0].url);
                                    });
                                    favoritesButton.addEventListener("click", function () {
                                        toggleFavorites(actualBook.title);

                                        if (favoritesButton.innerHTML === "ADD TO FAVORITES") {
                                            favoritesButton.innerHTML = "DELETE FROM FAVORITES"
                                        } else {
                                            favoritesButton.innerHTML = "ADD TO FAVORITES"
                                        }

                                    });
                                })(book);




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



