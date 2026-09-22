const API_URL = "https://ace-random-click.onrender.com/api/confessions";


// Page load hone par backend se data fetch karein
document.addEventListener("DOMContentLoaded", loadConfessions);

function addConfession() {
    const nameInput = document.getElementById("studentName");
    const targetInput = document.getElementById("targetPerson");
    const textInput = document.getElementById("confessionText");

    const name = nameInput.value.trim() || "Anonymous";
    const target = targetInput.value.trim() || "Someone Special";
    const text = textInput.value.trim();

    if (text === "") {
        alert("Kripya confession message likhein!");
        return;
    }

    const confessionData = {
        name: name,
        target: target,
        text: text,
        likes: 0,
        comments: [],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Promise (.then) format me backend par POST request
    fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(confessionData)
    })
    .then(response => response.json())
    .then(data => {
        // Clear Inputs
        nameInput.value = "";
        targetInput.value = "";
        textInput.value = "";
        
        loadConfessions();
    })
    .catch(error => console.error("Post save karne me error aaya:", error));
}

function loadConfessions() {
    const feed = document.getElementById("confessionsFeed");

    // Localhost 5000 se confessions GET karein
    fetch(API_URL)
    .then(response => response.json())
    .then(confessions => {
        feed.innerHTML = "";

        if (!confessions || confessions.length === 0) {
            feed.innerHTML = "<p style='text-align:center; color:#888;'>No confessions yet. Be the first one!</p>";
            return;
        }

        confessions.forEach(item => {
            const post = document.createElement("div");
            post.classList.add("post-card");

            // Comments list HTML generate karna
            const commentsListHTML = item.comments && item.comments.length > 0
                ? item.comments.map(c => `<div class="comment-item"><b>${escapeHTML(c.name)}:</b> ${escapeHTML(c.text)}</div>`).join('')
                : "<div class='no-comments'>No comments yet</div>";

            post.innerHTML = `
                <div class="post-header">
                    <span class="post-target">To: ${escapeHTML(item.target)}</span>
                    <span class="post-author">By: ${escapeHTML(item.name)}</span>
                </div>
                <p class="post-text">${escapeHTML(item.text)}</p>
                <div class="post-time">${item.time}</div>
                
                <!-- Action Buttons: Like & Comment Section -->
                <div class="post-actions">
                    <button class="like-btn" onclick="likePost('${item.id}')">
                        ❤️ Like (<span id="like-count-${item.id}">${item.likes || 0}</span>)
                    </button>
                </div>

                <div class="comments-section">
                    <div class="comments-list" id="comments-list-${item.id}">
                        ${commentsListHTML}
                    </div>
                    <div class="comment-input-box">
                        <input type="text" id="comment-name-${item.id}" placeholder="Your Name (Optional)" class="comment-name-input">
                        <input type="text" id="comment-text-${item.id}" placeholder="Write a comment..." class="comment-text-input">
                        <button onclick="addComment('${item.id}')" class="comment-btn">Reply</button>
                    </div>
                </div>
            `;

            feed.appendChild(post);
        });
    })
    .catch(error => {
        console.error("Data fetch karne me error:", error);
        feed.innerHTML = "<p style='text-align:center; color:red;'>Failed to load confessions from localhost:5000</p>";
    });
}

// Like Button Handler
function likePost(id) {
     
    fetch(`${API_URL}/${id}/like`, {
        method: "PUT"
    })
    .then(response => response.json())
    .then(data => {
               if (data.success) {
            const button = document.querySelector(
                `.like-btn[onclick="likePost('${id}')"]`
            );

            if (button) {
                button.disabled = true;
                button.innerHTML = `❤️ Liked (<span id="like-count-${id}">${data.likes || ''}</span>)`;
            }
        }

        
    })
    .catch(error => console.error("Like error:", error));
}

// Comment Add Handler
function addComment(id) {
    const nameInput = document.getElementById(`comment-name-${id}`);
    const textInput = document.getElementById(`comment-text-${id}`);

    const name = nameInput.value.trim() || "Anonymous";
    const text = textInput.value.trim();

    if (text === "") {
        alert("Kripya comment likhein!");
        return;
    }

    const commentData = { name: name, text: text };

    fetch(`${API_URL}/${id}/comment`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(commentData)
    })
    .then(response => response.json())
    .then(data => {
        nameInput.value = "";
        textInput.value = "";
        loadConfessions();
    })
    .catch(error => console.error("Comment error:", error));
}

// XSS Protection Helper
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}