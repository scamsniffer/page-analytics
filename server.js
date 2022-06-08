const { Detector } = require("./main");
const whois = require("freewhois");
const app = require("express")();
const instance = new Detector();
app.get("/detect", async (req, res) => {
  try {
    await instance.init();
    res.json(await instance.detectPage(req.query.link));
  } catch (e) {
    console.log("failed", e);
    res.json({
      error: e.toString(),
    });
  }
});

app.get("/getWhois", async (req, res) => {
  try {
    const data = await whois(req.query.link);
    res.json({
      data,
    });
  } catch (e) {
    console.log("failed", e);
    res.json({
      error: e.toString(),
    });
  }
});

const { lookup } = require("./whois");

app.get("/whois/lookup", async (req, res) => {
  try {
    const data = await new Promise((resolve, reject) => {
      lookup(req.query.domain, (err, data) => {
        if (err) {
          return reject(rtt)
        }
        resolve(data);
      });
    })
    res.json({
      data,
    });
  } catch (e) {
    console.log("failed", e);
    res.json({
      error: e.toString(),
    });
  }
});

// console.log(lookup);
// lookup("baidu.com", (err, data) => {
//   console.log(err, data);
// });

app.listen(8080)