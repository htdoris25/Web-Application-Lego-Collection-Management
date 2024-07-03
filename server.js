const legoData = require("./modules/legoSets");
const path = require("path");

const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }));

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));
app.set('view engine', 'ejs');

const clientSessions = require('client-sessions');
const authData = require("./modules/auth_service");
app.use( //add a6
  clientSessions({
    cookieName: "session",
    secret: "o6LjQ5EVNC28ZgK64hDELM18ScpFQr",
    duration: 2 * 60 * 1000,
    activeDuration: 1000 * 60,
  })
);

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

app.get('/', (req, res) => {
  res.render("home");
});

app.get('/about', (req, res) => {
  res.render("about");
});

app.get("/lego/sets", async (req,res)=>{
  if(req.query.theme){
    legoData.getSetsByTheme(req.query.theme).then(data => {
        res.render("sets", {sets : data});
    }).catch(error => {
        res.status(404).render("404", {message : "Unable to find requested sets."});
    })
  }else{
    legoData.getAllSets()
    .then(data => {
        res.render("sets", {sets:data})
    })
    .catch(error => {
      res.status(404).render("404", {message : "Unable to find requested sets."});
  });
}

});

app.get("/lego/sets/:num", async (req,res)=>{
  // legoData.getSetByNum(req.params.num)
  // .then(data => {
  //   res.render("set", { set: data }); // Pass the data as "set"
  // })
  // .catch(error => {
  //   res.status(404).render("404", { message: "Unable to find requested set." });
  // });
  try{
    let legoSet = await legoData.getSetByNum(req.params.num);
    res.render("set", { set: legoSet }); // Pass the data as "set"
    //res.send(set);
  }catch(err){
    res.status(404).render("404", { message: "Unable to find requested set." });
  }
});

app.get("/lego/addSet", ensureLogin,async (req, res) => {
  try{
    const themeData = await legoData.getAllThemes();
    res.render("addSet", { themes: themeData });
  }catch(err){
    res.status(404).render("404", { message: `${err.message}` });
  }
});

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect('/login');
  } else {
    next();
  }
}

app.post("/lego/addSet", ensureLogin,async (req, res) => {
  legoData.addSet(req.body)
    .then(() => {
      res.redirect("/lego/sets");
    })
    .catch((err) => {
      res.render("500", {message: `I'm sorry, but we have encountered the following error: ${err}`,});
    });
});

app.get("/lego/editSet/:num", ensureLogin,async (req, res) => {
  legoData.getSetByNum(req.params.num).then(data => {
    legoData.getAllThemes().then((themeData) => {
        res.render("editSet", { themes: themeData, set: data });
    }).catch((err) =>{
        res.status(404).render("404", { message: err });
    });
  })
  .catch(err=>{
    res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
  });
});

app.post("/lego/editSet", ensureLogin,async (req, res) => {
  legoData.editSet(req.body.set_num, req.body)
    .then(() => {
      res.redirect("/lego/sets")
    })
    .catch((err) => {
      res.render("500", {message: `I'm sorry, but we have encountered the following error: ${err}`,
      })
    });
});

app.get( "/lego/deleteSet/:num", ensureLogin,async (req, res) => {
  legoData.deleteSet(req.params.num)
    .then(() => {
      res.redirect("/lego/sets")
    })
    .catch((err) => {
      res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });      })
});

app.post('/lego/deleteSet/:num', ensureLogin, (req, res) => {
  legoData.deleteSet(req.params.num).then(() =>{
      res.redirect('/lego/sets');
  }).catch((err) => {
      res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
  });
});

// app.get("/login", (req, res) => {
//   if (!req.session.user) {
//     res.render("login", { errorMessage: "", userName: req.body.userName });
//   } else {
//     res.redirect("/");
//   }
// });
app.get("/login", (req, res) => {
  res.render("login");
});


app.get("/register", (req, res) => {

  res.render("register");
});


app.post("/register", (req, res) => {
  authData.registerUser(req.body)
    .then(() => {
      res.render("register", {successMessage: "User created",});
    })
    .catch((err) => {
      res.render("register", {
        errorMessage: err,
        userName: req.body.userName,
        successMessage: "",
      });
    });
});

app.post("/login", (req, res) => {
  req.body.userAgent = req.get('User-Agent');
  authData.checkUser(req.body)
    .then((user) => {
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory,
      }
      res.redirect('/lego/sets');
   })
   .catch((err) => {
    res.render("login", { errorMessage: err, userName: req.body.userName });
  });
});

app.get("/logout",(req, res) => {
  req.session.reset();
  res.redirect("/");
});

app.get("/userHistory", ensureLogin, (req, res) => {
  res.render("userHistory");
});


app.use((req, res, next) => {
  //res.status(404).sendFile(path.join(__dirname, "/views/404.html"));
  //res.status(404).render(404);
  res.status(404).render("404", {message: "I'm sorry, we're unable to find what you're looking for"});
});


// legoData.initialize().then(()=>{
//   app.listen(HTTP_PORT, () => { console.log(`server listening on: ${HTTP_PORT}`) });
// });

legoData.initialize()  //add a
  .then(authData.initialize)
  .then(function(){
    app.listen(HTTP_PORT, function(){
    console.log(`app listening on: ${HTTP_PORT}`);
  });
  })
  .catch(function(err){
    console.log(`unable to start server: ${err}`);
});