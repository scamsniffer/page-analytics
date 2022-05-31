const { Detector } = require("./main");
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

app.listen(8080)