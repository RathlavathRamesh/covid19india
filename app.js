const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "covid19India.db");
let db = null;
const initilizeDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server IS Running At http://localhost:3000/");
    });
  } catch (error) {
    console.log(`Db Error Is ${error.message}`);
    process.exit(1);
  }
};

initilizeDb();

//GET All States API1
const converCamesl = (eachState) => {
  return {
    stateId: eachState.state_id,
    stateName: eachState.state_name,
    population: eachState.population,
  };
};
app.get("/states", async (request, response) => {
  const quary = ` 
    SELECT 
    * 
    FROM 
    state ;
    `;
  const result = await db.all(quary);
  let final_result = [];
  for (let eachplayer of result) {
    let oneplayer = converCamesl(eachplayer);
    final_result.push(oneplayer);
  }
  response.send(final_result);
});

// GET One State API2

app.get("/states/:stateId", async (request, response) => {
  const { stateId } = request.params;
  const getstateQuary = ` 
    SELECT 
    *
    FROM 
    state
    WHERE state_id=${stateId};
  `;
  const state = await db.get(getstateQuary);
  const final_Result = converCamesl(state);
  response.send(final_Result);
});

//CREATE DISTRICT API3
app.post("/districts/", async (request, response) => {
  const details = request.body;
  const { districtName, stateId, cases, cured, active, deaths } = details;
  const addDistrictquary = `
    INSERT INTO 
    district (district_name,state_id,cases,cured,active,deaths)
    VALUES(
        '${districtName}',${stateId},${cases},${cured},${active},${deaths}
    );
    `;
  await db.run(addDistrictquary);
  response.send("District Successfully Added");
});

//GET District API 4

const getCamel = (each) => {
  return {
    districtId: each.district_id,
    districtName: each.district_name,
    stateId: each.state_id,
    cases: each.cases,
    cured: each.cured,
    active: each.active,
    deaths: each.deaths,
  };
};
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getdistrictquary = `
    SELECT 
    * 
    FROM
    district
    WHERE district_id=${districtId};
    `;
  const result = await db.get(getdistrictquary);
  const final = getCamel(result);
  response.send(final);
});

//DELETE District table API5

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deletequary = `
    DELETE  
    FROM 
    district 
    WHERE district_id=${districtId};
    `;
  await db.run(deletequary);
  response.send("District Removed");
});

//UPDATE Player API 6

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const disctrict = request.body;
  const { districtName, stateId, cases, cured, active, deaths } = disctrict;
  const updatequeary = `
    UPDATE 
    district 
    SET 
       district_name='${districtName}',
       state_id=${stateId},
       cases=${cases},
       cured=${cured},
       active=${active},
       deaths=${deaths}
       WHERE district_id=${districtId};
    `;
  await db.run(updatequeary);
  response.send("District Details Updated");
});
//GET STATS API7
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStats = `
  SELECT 
    SUM(cases) AS totalCases,
    SUM(cured) AS totalCured,
    SUM(active) AS totalActive,
    SUM(deaths) AS totalDeaths
    FROM 
     states
    WHERE state_id=${stateId};
  `;
  const result = await db.get(getStats);
  response.send(result);
});

//GET Districts API8
const getName = (object) => {
  return {
    stateName: object.state_name,
  };
};
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getState = `
    SELECT 
    state_name
    FROM 
    district 
    WHERE district_id=${districtId};
    `;
  const array = await db.get(getState);
  let final_result = getName(array);
});
module.exports = app;
