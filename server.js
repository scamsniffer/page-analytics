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

app.listen(8080)