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
            alert(`signed up: ${user.email}`)
            favoritesLists.doc(user.uid).set({ favorites: [] })
        })
        .catch((error) => {
            let errorCode = error.code;
            let errorMessage = error.message;
            console.log(errorCode);
            console.log(errorMessage);
            alert(errorMessage);
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
            alert(`log in: ${user.email}`)
        })
        .catch((error) => {
            alert("Usuario incorrecto. Si no se ha registrado, debe hacerlo primero");
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
        alert("Log out: " + user.email);
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

//Funcion para subir foto de perfil
function uploadFile() {
    let storageRef = firebase.storage().ref();
    let file = document.getElementById("files").files[0];
    let thisRef = storageRef.child(file.name);
    let profilePic = document.querySelector("#profilePic");

    thisRef.put(file).then(function (snapshot) {
        snapshot.ref.getDownloadURL().then(function (url) {
            profilePic.setAttribute("src", url);
            profilePic.style.display = "block";
        });
    }).catch(function (error) {
        console.log(error);
    });
}

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

function toggleFavorites(bookId, list) {
    let userId = firebase.auth().currentUser.uid;
    favoritesLists.doc(userId).get().then((doc) => {
        let favoritesDoc = doc.data();
        let newFavorites = favoritesDoc.favorites.filter(book => book.title !== bookId);
        if (favoritesDoc.favorites.length === newFavorites.length) {
            //El libro no se encuentra en la lista, añadelo
            newFavorites.push({ title: bookId, "list": list });
        }
        favoritesLists.doc(userId).update({ favorites: newFavorites });
    });
}

//Función asíncrona que obtiene la lista de favoritos del usuario
const getFavorites = async () => {
    let userId = firebase.auth().currentUser.uid;
    const doc = await favoritesLists.doc(userId).get();
    let favorites = doc.data();
    return favorites;
}


const body = document.querySelector("body");
const main = document.querySelector("#main");
const favoritesList = document.querySelector("#favoritesList");
const mainList = document.querySelector("#mainList");

//Establece la lista de favoritos del usuario
firebase.auth().onAuthStateChanged(function (user) { //Verifica si el usuario ha iniciado sesión
    if (!user) {
        favoritesList.addEventListener("click", function () {
            alert("You should log up before watching your favorites list");
        });
    } else {
        favoritesList.addEventListener("click", function () {
            main.style.display = "none";
            mainList.style.display = "none";
            let mainFavoritesList = document.querySelector("#mainFavoritesList");
            mainFavoritesList.innerHTML = "";
            mainFavoritesList.style.display = "flex"
            let favoritesTitle = document.createElement("p");
            favoritesTitle.innerHTML = "Favorites list";
            favoritesTitle.setAttribute("class", "sectionTitle");
            mainFavoritesList.appendChild(favoritesTitle);
            let backToIndex = document.createElement("button");
            backToIndex.innerHTML = "BACK TO INDEX";
            backToIndex.setAttribute("class", "backToIndex");
            mainFavoritesList.appendChild(backToIndex);
            backToIndex.addEventListener("click", function () {
                mainFavoritesList.style.display = "none";
                main.style.display = "flex";
            });
            getFavorites().then((favoritesDoc) => {
                let lists = favoritesDoc.favorites.reduce((acc, { list }) => {
                    if (!acc.find(elem => elem === list)) {
                        acc.push(list);
                    }
                    return acc;
                }, []);
                let titles = favoritesDoc.favorites.reduce((acc, { title }) => {
                    if (!acc.find(elem => elem === title)) {
                        acc.push(title);
                    }
                    return acc;
                }, []);
                for (list of lists) {
                    getBooks(list)
                        .then(data => {
                            for (title of titles) {
                                for (book of data.results.books)
                                    if (title === book.title) {
                                        let divBook = document.createElement("div");
                                        divBook.setAttribute("class", "divBook")
                                        mainFavoritesList.appendChild(divBook);
                                        let bookTitle = document.createElement("p");
                                        bookTitle.innerHTML = `<h4>${book.title}</h4>`;
                                        divBook.appendChild(bookTitle);
                                        let bookImg = document.createElement("img");
                                        bookImg.setAttribute("src", book.book_image);
                                        bookImg.setAttribute("class", "bookImg");
                                        divBook.appendChild(bookImg);
                                        let bookDescription = document.createElement("p");
                                        bookDescription.innerHTML = book.description;
                                        divBook.appendChild(bookDescription);
                                        bookDescription.setAttribute("class", "bookDescription");
                                        let amazonLink = document.createElement("button");
                                        amazonLink.innerHTML = "BUY AT AMAZON";
                                        divBook.appendChild(amazonLink);
                                        let favoritesButton = document.createElement("button");
                                        divBook.appendChild(favoritesButton);
                                        favoritesButton.innerHTML = "DELETE FROM FAVORITES";
                                        (function (actualBook, actualList) { //Función IIFE que aplica a todos los libros en lugar de solo el último
                                            amazonLink.addEventListener("click", function () {
                                                window.open(actualBook.buy_links[0].url);
                                            });
                                            favoritesButton.addEventListener("click", function () {
                                                toggleFavorites(actualBook.title, actualList);
                                                divBook.style.display = "none";
                                            });
                                        })(book, list);
                                    }
                            }
                        })
                }
            });
        });
    }
})

getLists()
    .then(data => {
        for (list of data.results) {
            //Crea un div por cada lista que contiene el título, primera y última publicación y la frecuencia de actualización, además de un botón que ofrece más información sobre la lista
            let divList = document.createElement("div");
            divList.setAttribute("class", "divList");
            main.appendChild(divList);
            let listTitle = document.createElement("p");
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
            //Evento del botón que oculta todas las listas y muestra los datos de la lista. Incluye un botón que oculta la lista y vuelve a mostrarlas todas. También incluye un botón para añadir el libro a la lista de favoritos
            (function (listName) { //Función IIFE que aplica a todas las listas en lugar de solo la última
                readMore.addEventListener("click", function () {
                    window.scrollTo(0, 0);
                    getBooks(listName)
                        .then(data => {
                            main.style.display = "none";
                            mainList.innerHTML = "";
                            showLoading();
                            mainList.style.display = "flex";
                            let listTitle = document.createElement("p");
                            listTitle.innerHTML = data.results.display_name;
                            listTitle.setAttribute("class", "sectionTitle");
                            mainList.appendChild(listTitle);
                            let backToIndex = document.createElement("button");
                            backToIndex.setAttribute("class", "backToIndex");
                            backToIndex.innerHTML = "BACK TO INDEX";
                            mainList.appendChild(backToIndex);
                            backToIndex.addEventListener("click", function () {
                                mainList.style.display = "none";
                                main.style.display = "flex";
                            });
                            for (book of data.results.books) {
                                let divBook = document.createElement("div");
                                divBook.setAttribute("class", "divBook");
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
                                bookDescription.setAttribute("class", "bookDescription");
                                bookDescription.innerHTML = book.description;
                                divBook.appendChild(bookDescription);
                                let amazonLink = document.createElement("button");
                                amazonLink.innerHTML = "BUY AT AMAZON";
                                divBook.appendChild(amazonLink);
                                let favoritesButton = document.createElement("button");
                                divBook.appendChild(favoritesButton);
                                favoritesButton.innerHTML = "FAVORITES";
                                (function (actualBook) { //Función IIFE que aplica a todos los libros en lugar de solo el último
                                    amazonLink.addEventListener("click", function () {
                                        window.open(actualBook.buy_links[0].url);
                                    });
                                    firebase.auth().onAuthStateChanged(function (user) { //Verifica si el usuario ha iniciado sesión
                                        if (!user) {
                                            favoritesButton.addEventListener("click", function () {
                                                alert("You should login before adding books to your favorites list");
                                            });
                                        } else {
                                            getFavorites().then((favoritesDoc) => { //El botón de favoritos cambiará su texto en función de si el libro se encuentra en la lista de favoritos o no
                                                if (favoritesDoc.favorites.some(elem => elem.title === actualBook.title)) {
                                                    favoritesButton.innerHTML = "DELETE";
                                                } else {
                                                    favoritesButton.innerHTML = "FAVORITES";
                                                };
                                                favoritesButton.addEventListener("click", function () {
                                                    toggleFavorites(actualBook.title, data.results.list_name_encoded);
                                                    if (favoritesButton.innerHTML === "FAVORITES") {
                                                        favoritesButton.innerHTML = "DELETE";
                                                    } else {
                                                        favoritesButton.innerHTML = "FAVORITES";
                                                    }
                                                });
                                            });
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



