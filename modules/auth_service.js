const mongoose = require('mongoose');
let Schema = mongoose.Schema;

require('dotenv').config()
const bcrypt = require('bcryptjs');

let userSchema = new Schema({
  userName:{
    type:String,
    unique: true,
  },
  password: String,
  email: String,
  loginHistory: [
    {
        dateTime: Date,
        userAgent: String,
    }
    ],
});

let User;

function initialize() {
    return new Promise(async (resolve, reject) => {
      let db = mongoose.createConnection(process.env.MONGODB);
  
      db.on("error", (err) => {
        reject(err); // reject the promise with the provided error
      });
      db.once("open", () => {
        User = db.model("users", userSchema);
        resolve();
      });
    });
  }
  function registerUser(userData){
    return new Promise((resolve, reject) => {
      if(userData.password === userData.password2){ // che k match
        bcrypt.hash(userData.password, 10)
          .then((hash) => {
            userData.password = hash; 
            let newUser = new User(userData); //create a new User from the userData

            newUser
            .save()
              .then(() => {
                resolve();
              })
              .catch((err) => {
                if(err.code == 11000){ //duplicate key
                  reject("User Name already Taken");
                }else{
                  reject("There was an error creating the user: " + err);
                };
              }); 
          })
          .catch((err) => {
            reject("There was an error encrypting the password");
          });
      }else{
        reject('Passwords do not match')
      }
    });
  }

  function checkUser(userData){
    return new Promise(async (resolve, reject) => {
      User.find({userName : userData.userName}).exec()
        .then((users)=> {
          if(users.length == 0){ // check is empty array or not
            reject("Unable to find user: " + userData.userName);
          }
          
          bcrypt.compare(userData.password, users[0].password)
            .then((result) => {
              if(result === true){
                if(users[0].loginHistory.length == 8){
                  users[0].loginHistory.pop();
                }
                //unshift: add the specified elements to the beginning
                users[0].loginHistory.unshift({
                  dateTime: (new Date()).toString(), 
                  userAgent: userData.userAgent
                });

                User.updateOne({userName: users[0].userName}, {
                  $set : {
                    loginHistory : users[0].loginHistory
                  }
                }).exec()
                  .then(() => {
                    resolve(users[0]);
                  })
                  .catch((err => {
                    reject("There was an error verifying the user: " + err);
                  }))
              }else{
                reject("Incorrect Password for user: " + userData.userName);
              }
            })
            .catch((err) => {
              reject("There was an error verifying the user: " + err);
            });
          
        })
        .catch((err) => {
          reject("Unable to find user: " + userData.userName);
        })
    });
  }
  
  module.exports = { initialize, registerUser, checkUser };