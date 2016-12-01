// Initialize Firebase Config
const config = {
	apiKey: "AIzaSyAAjby47cHjqBOCPy4PzThrfbeSmUnk9eU",
    authDomain: "starkey.firebaseapp.com",
    databaseURL: "https://starkey.firebaseio.com/customers"
}
firebase.initializeApp(config);

// Get Elements
var txtEmail = document.getElementById('txtEmail');
var txtPassword = document.getElementById('txtPassword');
var btnLogin = document.getElementById('btnLogin');

// Login Event
btnLogin.addEventListener('click', e => {
	const email = txtEmail.value;
	const pass = txtPassword.value;
	const auth = firebase.auth();

	const promise = auth.signInWithEmailAndPassword(email, pass);
	promise.catch(e => console.log(e.message));
});

firebase.auth().onAuthStateChanged(firebaseUser => {
	if(firebaseUser) {
		location.replace("/html/CustomerList.html");
	} else {
		console.log('not logged in');
	}
	return false;
});