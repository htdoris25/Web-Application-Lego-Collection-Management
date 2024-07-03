require('dotenv').config();
const Sequelize = require('sequelize');

//const setData = require("../data/setData");
//const themeData = require("../data/themeData");//delete in ass5
//let sets = [];


let sequelize = new Sequelize(
  process.env.DB_DATABASE, //should match .env name
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
  }
);

const Theme = sequelize.define('Theme', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: Sequelize.STRING,
  },
  {
  createdAt: false, //disable
  updatedAt: false,
  }
);

const Set = sequelize.define('Set', {
  set_num: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  name: Sequelize.STRING,
  year: Sequelize.INTEGER,
  num_parts: Sequelize.INTEGER,
  theme_id: Sequelize.INTEGER,
  img_url: Sequelize.STRING,
  },
  {
    createdAt: false,
    updatedAt: false,
  }
);

//create an association between the two:
Set.belongsTo(Theme, {foreignKey: 'theme_id'})

function initialize() {
  return new Promise(async (resolve, reject) => { //as5: part2.3
    try {
      await sequelize.sync();
      resolve();
    } catch (error) {
      reject(error);
    }
  });

}

function getAllSets() { //as5: part2.4
  return new Promise(async (resolve, reject) => {
    Set.findAll({ include: [Theme] })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject("Set No Found");
      });
  });
}

function getSetByNum(setNum) { ////as5: part2.5
  return new Promise((resolve, reject) => {
    Set.findAll({
      where: { set_num: setNum },
      include: [Theme],
    })
    .then((data) => {
      if (data.length > 0) {
        resolve(data[0]); // Resolve with the first elemen
      } else {
        reject("Unable to find requested set");
      }
    })
    .catch((err) => {
      reject(`Cannot found the setNum: ${setNum}`);
    });
  });

}

function getSetsByTheme(theme) { //as5: part2.6
  return new Promise((resolve, reject) => {
    Set.findAll({ 
      include: [ ],
      where: { '$Theme.name$': {[Sequelize.Op.iLike]: `%${theme}%`}},
    })
    .then((data) => {
      if (data.length > 0) {
        resolve(data[0]); // Resolve with the first elemen
      } else {
        reject("Unable to find requested set");
      }
    })
    .catch((err) => {
      reject(`Cannot found the setNum: ${setNum}`);
    });
  });
}

function addSet(setData) { //as5: part3 
  return new Promise((resolve, reject) => {
    Set.create(setData)
    .then(()=> {
        resolve(); // Resolve with the first element
    })
    .catch((err) => {
      reject(err.errors[0].message);
    });
  });
}

function getAllThemes(){ //as5: part3 
  return new Promise((resolve, reject) => {
    Theme.findAll()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject("No theme found");
      });
  });
};

function editSet(set_num, setData) {
  return new Promise((resolve, reject) => {
    // First, check if the set exists
    Set.findOne({
      where: { set_num: set_num }
    })
    .then((existingSet) => {
      if (existingSet) {
        // If the set exists, proceed with the update
        Set.update({
          name: setData.name,
          year: setData.year,
          num_parts: setData.num_parts,
          theme_id: setData.theme_id,
          img_url: setData.img_url,
        }, {
          where: { set_num: set_num }
        })
        .then(() => {
          resolve();
        })
        .catch((err) => {
          reject(err.errors[0].message);
        });
      } else {
        // If the set doesn't exist, reject with an error
        reject("Set not found");
      }
    })
    .catch((err) => {
      reject(err.errors[0].message);
    });
  });
}


function deleteSet(set_num){
  return new Promise((resolve, reject) => {
      Set.destroy({
          where : { set_num : set_num },
      }).then(() => {
          resolve();
      }).catch((err) => {
          reject(err.errors[0].message);
      });
  });
}

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme, addSet, getAllThemes, editSet, deleteSet}
// Code Snippet to insert existing data from Set / Themes

//bulkCreate
// sequelize
//   .sync()
//   .then( async () => {
//     try{
//       await Theme.bulkCreate(themeData);
//       await Set.bulkCreate(setData); 
//       console.log("-----");
//       console.log("data inserted successfully");
//     }catch(err){
//       console.log("-----");
//       console.log(err.message);

//       // NOTE: If you receive the error:
//       // insert or update on table "Sets" violates foreign key constraint "Sets_theme_id_fkey"
//       // it is because you have a "set" in your collection that has a "theme_id" that does not exist in the "themeData".   
//       // To fix this, use PgAdmin to delete the newly created "Themes" and "Sets" tables, fix the error in your .json files and re-run this code
//     }

//     process.exit();
//   })
//   .catch((err) => {
//     console.log('Unable to connect to the database:', err);
//   });