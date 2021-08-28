const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const Jimp = require('jimp');
const path = require("path");
const sharp = require('sharp');
const PORT = process.env.PORT;

if (!PORT) {
    console.log("PORT variable not defined. Please execute command 'export PORT=XYXY;' on the CLI");
}

// Storage engine for multer.
const storage = multer.diskStorage({
    destination: './public/upload',
    filename: function(req, file, cb){
        // TODO: Hash the image name or use some other technique? 
        // How to deal with multiple people accessing at once? Whom to render what image?
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Init upload
const upload = multer({
    storage: storage
}).single('image');

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("./public"));

app.get("/", function(req, res){
    res.render("index", {port: PORT});
});


app.post("/", function(req, res){
    upload(req, res, function(err){
        if(err){
            res.send("Please upload correct format");
        } else {
            console.log(req.file);
            console.log(req.file.filename);
            let quality = parseInt(JSON.parse(JSON.stringify(req.body)).quality);
            if(Number.isNaN(quality)) {
                quality = 100;
            }

            // Resizing with provided quality.
            Jimp.read(`public/upload/${req.file.filename}`)
                .then(image => {
                    return image
                        .quality(quality) // set JPEG quality
                        .write(`public/resized/${req.file.filename}`); // save
                })
                .catch(err => {
                    console.error(err);
                });
            res.render("result", 
                {resizedImage: `resized/${req.file.filename}`, 
                uploadedImage: `upload/${req.file.filename}`,
                port: PORT});

            // res.render("result", 
            //     {resizedImage: `upload/${req.file.filename}`});
        }
    });
});

// To 
app.listen(PORT, function(){
    console.log(`Server listening on port ${PORT}`);
});