var express = require('express')
var bodyParser = require('body-parser')
var mysql = require('mysql')
var session = require('express-session')
var jwt = require('jsonwebtoken')

var app = express()

var port = 3333

var db=mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '',
    database: 'loak-online'
})

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

// ADMIN
const isAdmin = (request, result, next) => {

    if (typeof request.headers["admin"] == "undefined") {
      return result.status(403).json({
        success: false,
        message: "Unauthorized. Token is not provided"
      });
    }
  
    let token = request.headers["admin"];
  
    jwt.verify(token, "SuperSecRetKey", (err, decoded) => {
      if (err) {
        return result.status(401).json({
          success: false,
          message: "Unauthorized. Token is invalid"
        });
        }
    });
    next();
};
  
app.post('/logAdmin', (req, res) => { //membuat end point untuk login akun
    var username = req.body.username; // mengimpor username dari form
    var password = req.body.password; //mengimpor password dari form
    const sql = "SELECT * FROM admin WHERE username = ? AND password = ?"; // mencocokkan data form dengan data tabel
    if (username && password) {
      // jika email dan password ada
      db.query(sql, [username, password], function (err, rows) {
        if (err) throw err;
        // jika error akan menampilkan errornya
        else if (rows.length > 0) {
          // jika kolom lebih dari 0
          jwt.sign( // mengenkripsi data menggunakan jwt
            { username, password },
            "SuperSecRetKey",
            {
              expiresIn: 60 * 60 * 7// waktu durasi token yang dikeluarkan
            },
            (err, admin) => {
              res.send(admin); // menampilkan token yang sudah ada
            }
          );
        } else {
          res.json({
            message: "email or password is incorrect"
          }) // jika semua if tidak terpenuhi maka menampilkan kalimat tersebut
        }
      });
    }
  })
  
app.get("/admin", isAdmin, (request, result) => {
    result.json({
      success: true,
      message: "Welcome"
    });
});
  
// USER 
const isUser = (request, result, next) => {

    if (typeof request.headers["token"] == "undefined") {
      return result.status(403).json({
        success: false,
        message: "Unauthorized. Token is not provided"
      });
    }
  
    let token = request.headers["token"];
  
    jwt.verify(token, "SuperSecRetKey", (err, decoded) => {
      if (err) {
        return result.status(401).json({
          success: false,
          message: "Unauthorized. Token is invalid"
        });
        }
    });
    next();
};

app.post('/signup', (req, res) => { // membuat end point untuk daftar akun
    var data = {
      // membuat variabel data
      username: req.body.username, // mengambil data nama dari form
      email: req.body.email, // mengambil data email dari form
      password: req.body.password,
      telp: req.body.telp,
      alamat: req.body.alamat
    };
    // let cekUsername =
    // 'SELECT email FROM users WHERE email =' +
    // req.body.email;
    // var hashPassword = bcrypt.hashSync(, salt);

    db.query("INSERT INTO user SET?", data, function (err, result) {
      // memasukkan data form ke tabel database
      if (err) throw err;
      // jika gagal maka akan keluar error
      else {
        res.json({
          message: "Data has been added"
        })
      }
    });
})

app.post('/logUser', (req, res) => { //membuat end point untuk login akun
    var username = req.body.username; // mengimpor username dari form
    var password = req.body.password; //mengimpor password dari form
    const sql = "SELECT * FROM user WHERE username = ? AND password = ?"; // mencocokkan data form dengan data tabel
    if (username && password) {
      // jika username dan password ada
      db.query(sql, [username, password], function (err, rows) {
        if (err) throw err;
        // jika error akan menampilkan errornya
        else if (rows.length > 0) {
          // jika kolom lebih dari 0
          jwt.sign( // mengenkripsi data menggunakan jwt
            { username, password },
            "SuperSecRetKey",
            {
              expiresIn: 60 * 60 * 7// waktu durasi token yang dikeluarkan
            },
            (err, token) => {
              res.send(token); // menampilkan token yang sudah ada
            }
          );
        } else {
          res.json({
            message: "username or password is incorrect"
          }) // jika semua if tidak terpenuhi maka menampilkan kalimat tersebut
        }
      });
    }
})
  
app.get("/user", isUser, (request, result) => {
    result.json({
      success: true,
      message: "Welcome Customer"
    });
});

app.listen(port, () => {
    console.log('Application Running in port');
})