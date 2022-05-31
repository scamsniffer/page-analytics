const fetch = require('node-fetch');
const { Detector } = require('./main')
async function getNewDomains(lastId = 20) {
  const req = await fetch("https://api.scamsniffer.io/domainSummary?sort=-id");
  const allDomains = await req.json();
  return allDomains.filter((_) => _.id > lastId).map((_) => _.host);
}

async function getScamList(hosts = []) {
  const req = await fetch(
    "https://api.scamsniffer.io/scamList?limit=100&host=" + hosts.join(",")
  );
  const list = await req.json();
  return list.reduce((all, _) => {
    all[_.topDomain] = {
      link: _.link,
      tweet: _.tweet,
      matchType: _.matchType,
      projectUrl: _.projectUrl,
      projectName: _.project,
    };
    return all;
  }, {});
}
const instance = new Detector();

async function scanAndAnalytics() {
  const newDomains = await getNewDomains();
  const domains = await getScamList(newDomains);
  const report = JSON.stringify(newDomains, null, 2);
  await instance.init();

  const allResults = []

  const sites = Object.keys(domains);
  for (let index = 0; index < sites.length; index++) {
    const site = sites[index];
    const siteDetail = domains[site];
    console.log("detectPage", siteDetail.link);
    const result = await instance.detectPage(siteDetail.link);
    console.log(result);
    allResults.push(result);
  }
  console.log(allResults);
  setTimeout(scanAndAnalytics, 60 * 1000 * 2);
}


scanAndAnalytics();
