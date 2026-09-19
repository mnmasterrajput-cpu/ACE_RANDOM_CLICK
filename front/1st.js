function getimg() {
    const input = document.getElementById("imageInput");
    const button = document.getElementById("uploadBtn");

    input.onchange = null;

    input.onchange = function () {
        const file = input.files[0];

        if (!file) return;

        button.disabled = true;
        button.innerText = "Uploading...";

        console.log("Uploading file...");

        const poto = new FormData();
        poto.append("image", file);

        input.value = "";

        fetch("http://localhost:5000/getimg", {
            method: "POST",
            body: poto
        })
        .then(response => response.json())
        .then(data => {
            console.log("Backend response:", data);

            if (data.success) {
                alert("Image uploaded successfully.");

                button.disabled = false;
                button.innerText = "+ image";

                location.reload();
            }
        })
        .catch(error => {
            console.error("Fetch error:", error);

            button.disabled = false;
            button.innerText = "+ image";
        });
    };

    input.click();
}




function like(btn) {

    let imgId = btn.closest(".post").dataset.imgid;

    fetch("http://localhost:5000/imgl",{
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            imgId: imgId
        })
    })
    .then(response => response.json())
    .then(data => {

        console.log(data);

        btn.innerText="❤️"
        btn.disabled = true;
    })
    .catch(error => {
        console.error("Error:", error);
    });
}

 let imgId = null;
function comment(btn) {
   
    
    imgId = btn.closest(".post").dataset.imgid;
    

    //document.getElementById("main").style.display = "none";
    document.getElementById("popup").style.display="block";
    getComments(imgId);
}


function docomment() {
        

    let nam = document.getElementById("nam").value;
    let com = document.getElementById("com").value;
     

    if (nam.trim() === "" || com.trim() === "") {
        alert("Please enter both your name and comment.");
        return;
    }

    fetch("http://localhost:5000/imgc", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: nam,
            comment: com,
            imgId:imgId
        })
    })
    .then(resp => resp.json())
    .then(data => {
        console.log(data);

        let ndiv=document.createElement("div");
        ndiv.classList.add("popup")
        let div = document.createElement("div");

        div.classList.add("doc");

        div.innerText = nam + " : " + com;

    
        document.querySelector(".allc").appendChild(div);

        document.getElementById("nam").value = "";
        document.getElementById("com").value = "";
    })
    .catch(err => {
        console.log(err);
    });
}
function cancle()
{
    
    document.getElementById("main").style.display="block";
    document.getElementById("popup").style.display="none";
}
let offset = 0;

function getdata() {

    fetch(`http://localhost:5000/sendimg?offset=${offset}`)
        .then(res => res.json())
        .then(data => {

            if (!data.success) {
                console.log("Images nahi mili");
                return;
            }

            const container = document.querySelector(".mid");

            data.images.forEach(img => {

                const post = document.createElement("div");

                post.className = "post";
                post.setAttribute("data-imgid", img.imgid);

                post.innerHTML = `
                    <img src="${img.imgurl}">

                    <div class="buttons">
                        <button onclick="like(this)">
                            ❤️ ${img.imglike}
                        </button>

                        <button onclick="comment(this)">
                            💬 Comment
                        </button>

                        <button onclick="deimg(this)" id="del">
                            Delete
                        </button>
                    </div>
                `;

                container.appendChild(post);

            });

            offset = data.nextOffset;

        })
        .catch(err => {
            console.log("Fetch error:", err);
        });
}

window.addEventListener("load", getdata);
function lodemore()
{
    getdata();
}
function getComments(currentImgId) {
    const commentsContainer = document.querySelector(".allc");
    commentsContainer.innerHTML = "Loading comments...";

    fetch(`http://localhost:5000/getcomments?imgid=${currentImgId}`)
        .then(res => res.json())
        .then(data => {
            commentsContainer.innerHTML = "";

            if (!data.success || data.comments.length === 0) {
                commentsContainer.innerHTML = "<p>No comments available yet.</p>";
                return;
            }

            data.comments.forEach(c => {
                let div = document.createElement("div");
                div.classList.add("doc");
                div.innerText = `${c.name} : ${c.comment}`;
                commentsContainer.appendChild(div);
            });
        })
        .catch(err => {
            console.error("Fetch comments error:", err);
            commentsContainer.innerHTML = "<p>Unable to load comments.</p>";
        });
}

let login = false;

function deimg(btn) {
    let imgId = btn.closest(".post").dataset.imgid;

    if (login === false) {
        alert("Please enter the password before deleting an image.");
        return;
    }

    fetch("http://localhost:5000/delete", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            imgId: imgId
        })
    })
    .then(data => data.json())
    .then((data) => {
        alert("Image deleted successfully!");
        btn.closest(".post").remove();
        login = false;
    })
    .catch(err => console.error("Error:", err));
}

function pass() {
    let passw = document.getElementById("pass").value;
    
    if (passw === "") {
        alert("Please enter your password.");
        return;
    }

    fetch("http://localhost:5000/pass", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            passw: passw
        })
    })
    .then(data => data.json())
    .then((data) => {
        login = data.status;

        if (data.status === true) {
            alert("Password verified successfully. You can now delete one image.");
            document.getElementById("pass").value = "";
        } else {
            alert("Incorrect password. Please try again.");
        }
    })
    .catch(error => console.error("Error:", error));
}
