require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");

const db = require("./dbconnection/db");

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({
    storage: multer.memoryStorage()
});

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


// IMAGE
app.post("/getimg", upload.single("image"), (req, res) => {

    console.log("GETIMG ROUTE HIT");

    if (!req.file) {
        console.log("FILE NAHI MILI");
        return res.status(400).json({
            success: false,
            message: "Image nahi mili"
        });

    }

    console.log("Image backend par aa gayi");
    console.log(req.file);


    const stream = cloudinary.uploader.upload_stream(
        {
            folder: "my_website"
        },

        (error, result) => {

            if (error) {

                console.log("Cloudinary error:", error);

                return res.status(500).json({
                    success: false,
                    message: "Cloudinary upload failed"
                });

            }


            console.log("Cloudinary URL:", result.secure_url);
            console.log("Public ID:", result.public_id);

const sql = `
    INSERT INTO images (imgid, imgurl, imglike)
    VALUES (?, ?, ?)
`;

db.query(
    sql,
    [result.public_id, result.secure_url, 0],
    (err, data) => {

        if (err) {
            console.log("MySQL error:", err);

            return res.status(500).json({
                success: false,
                message: "Image MySQL mein save nahi hui"
            });
        }

        console.log("Image MySQL mein save ho gayi");

        res.json({
            success: true,
            message: "Image upload aur save successful",
            id: data.insertId,
            imgid: result.public_id,
            imgurl: result.secure_url,
            imglike: 0
        });
    }
);



        }
    );


    stream.end(req.file.buffer);

});


// COMMENT
// 1. COMMENT SAVE KARNE KI API
app.post("/imgc", (req, res) => {
    console.log("Comment Request Body:", req.body);

    const { name, comment } = req.body;
    const imgid = req.body.imgId || req.body.imgid;

    if (!imgid || !comment || !name) {
        return res.status(400).json({
            success: false,
            message: "name, comment aur imgId teeno zaroori hain"
        });
    }

    const sql = "INSERT INTO comments (imgid, name, comment) VALUES (?, ?, ?)";

    db.query(sql, [imgid, name.trim(), comment.trim()], (err, result) => {
        if (err) {
            console.log("MySQL Comment Error:", err);
            return res.status(500).json({
                success: false,
                message: "Comment save nahi ho paya"
            });
        }

        console.log("Comment MySQL mein save ho gaya");

        res.json({
            success: true,
            message: "Comment successfully save ho gaya!",
            commentId: result.insertId
        });
    });
});

// 2. COMMENTS FETCH KARNE KI API
app.get("/getcomments", (req, res) => {
    const imgid = req.query.imgid || req.query.imgId;

    if (!imgid) {
        return res.status(400).json({
            success: false,
            message: "imgid required hai"
        });
    }

    const sql = `
        SELECT id, imgid, name, comment, created_at 
        FROM comments 
        WHERE imgid = ? 
        ORDER BY id DESC
    `;

    db.query(sql, [imgid], (err, data) => {
        if (err) {
            console.log("MySQL Fetch Comments Error:", err);
            return res.status(500).json({
                success: false,
                message: "Comments fetch nahi ho paye"
            });
        }

        res.json({
            success: true,
            comments: data,
            count: data.length
        });
    });
});


// LIKE
// LIKE
app.post("/imgl", (req, res) => {
    console.log("Like Request Body:", req.body);
    const imgid = req.body.imgId || req.body.imgid;

    if (!imgid) {
        return res.status(400).json({ 
            success: false, 
            message: "imgid nahi mili request body mein" 
        });
    }

    const sql = "UPDATE images SET imglike = imglike + 1 WHERE imgid = ?";
    
    db.query(sql, [imgid], (err, result) => {
        if (err) {
            console.log("Database error:", err);
            return res.status(500).json({ success: false, error: "Database error" });
        }

        // Agar DB mein matching imgid nahi mila
        if (result.affectedRows === 0) {
            console.log("No row updated for imgid:", imgid);
            return res.status(404).json({ 
                success: false, 
                message: "Aisi koi imgid database mein nahi mili" 
            });
        }

        console.log("Like updated successfully for imgid:", imgid);
        res.json({ success: true, message: "Like updated successfully!" });
    });
});
app.get("/sendimg", (req, res) => {

    const offset = parseInt(req.query.offset) || 0;
    const limit = 10;

    const sql = `
        SELECT id, imgid, imgurl, imglike
        FROM images
        ORDER BY id DESC
        LIMIT ? OFFSET ?
    `;

    db.query(sql, [limit, offset], (err, data) => {

        if (err) {

            console.log("MySQL error:", err);

            return res.status(500).json({
                success: false,
                message: "Images fetch nahi hui"
            });
        }

        res.json({
            success: true,
            images: data,
            count: data.length,
            nextOffset: offset + data.length,
            hasMore: data.length === limit
        });

    });

});

function newpass() {
    let np = Date.now();
    np = Math.floor(np %10000); 

    
    const sql = "UPDATE pass SET pass_code = ? WHERE id = 1";

    db.query(sql, [np], (err, result) => {
        if (err) console.log("Update error:", err);
        else console.log("Naya pass update ho gaya:", np);
    });
}

app.post("/pass", (req, res) =>{
    
    let userPass = req.body.passw; 

    console.log("User ka bheja password:", userPass);

    
    const sql = "SELECT pass_code FROM pass WHERE id = 1";

    db.query(sql, (err, result) => {
        if (err) return res.json({ status: false });

        if (result.length > 0) {
            
            let dbPassword = result[0].pass_code;

            
            if (userPass == dbPassword) {
                newpass(); 
                return res.json({
                    status: true
                });
            }
        }

        
        res.json({
            status: false
        });
    });
});

app.post("/delete", (req, res) => {
    const { imgId } = req.body;

    if (!imgId) {
        return res.status(400).json({ success: false, message: "imgId required hai" });
    }

    // Database se wo puri line (row) delete karne ki query
    const sql = "DELETE FROM images WHERE imgid = ?";
    
    db.query(sql, [imgId], (err, result) => {
        if (err) {
            console.error("Delete Error:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Image nahi mili" });
        }

        // Deletion Successful
        return res.json({ success: true, message: "Image record deleted successfully" });
    });
});
app.get("/newpass", (req, res) => {
    const sql = "SELECT pass_code FROM pass WHERE id = 1";

    db.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database error" });
        }

        res.json(result[0].pass_code);
    });
});
app.get("/healthz", (req, res) => {
    res.status(200).send("OK");
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
