const express = require("express");
const app = express();
const fs = require("fs");
const port = 3001;

app.use(express.text());

app.post("/", async (req, res) => {
  // date in XX-XX-XXXX format and time in XX:XX:XX format
  const dateTime = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Colombo",
  });
  const dandT = dateTime.split(",");
  const date = dandT[0].replaceAll("/", "-");
  const time = dandT[1];

  const { rsrp, rssi, temp, humidity } = JSON.parse(req.body);
  let ele = {
    time: time,
    rsrp: parseInt(rsrp),
    rssi: parseInt(rssi),
    temp,
    humidity,
  };
  console.log(ele);
  updateDatabaseFile(ele, date);
  res.send("Data received");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

function updateDatabaseFile(ele, date) {
  let arr = [];

  const filePath = "./data/data-" + date + ".json";

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File doesn't exist, create a new one
      arr.push(ele);
      fs.writeFile(filePath, JSON.stringify(arr), (err) => {
        if (err) {
          console.error("Error creating file:", err);
        } else {
          console.log(`File created: ${filePath}`);
        }
      });
    } else {
      // File exists, update existing data
      fs.readFile(filePath, "utf8", (err, fileData) => {
        if (err) {
          console.error("Error reading file:", err);
        } else {
          try {
            arr = JSON.parse(fileData);
            arr.push(ele); // Merge data
            fs.writeFile(filePath, JSON.stringify(arr), (err) => {
              if (err) {
                console.error("Error updating file:", err);
              } else {
                console.log(`File updated: ${filePath}`);
              }
            });
          } catch (parseError) {
            console.error("Error parsing JSON:", parseError);
          }
        }
      });
    }
  });
}
