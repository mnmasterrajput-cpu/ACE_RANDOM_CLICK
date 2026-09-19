let pass = null;

function getpass() {
    fetch("https://ace-random-click.onrender.com/newpass")
        .then(response => response.json())
        .then(data => {
            pass = data;

            let div = document.getElementById("currentPass");
            div.innerText = "PASSWORD: " + pass;
        })
        .catch(err => console.error("Error:", err));
}

window.addEventListener("load", getpass);
function msg()
{
    alert("report send,done");
    document.getElementById("1").innerText="";
    document.getElementById("2").innerText="";
}
