const puppeteer = require("puppeteer");

module.exports = async function (context, req) {

    const url = "https://appinsightsmonitorlivetestweb.azurewebsites.net/";
    context.log('JavaScript timer trigger function ran!', url);
    var isloaded = "loading...";
    var isTelemetryTracked = "loading...";
    var isCdnTracked = "loading...";
    var isIntegrous = "loading...";
    var error = "";
    try
    {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox']
      });

      const page = await browser.newPage();
      await page.goto(url);
      await new Promise(resolve => setTimeout(resolve, 60000)); // Pause for 60 second
      let content = await page.evaluate(()=> document.body.outerHTML);
      isloaded = content.includes("AppInsights loaded successfully");
      isTelemetryTracked = content.includes("All Telemetry Signals Tracked: Yes");
      isCdnTracked = content.includes("CDN Check: success");
      isIntegrous = content.includes("Intergrity Check: success");
      await browser.close();
    } catch(e) { error = e.message; context.log('Error fetching URL:', error);}

    if (!isloaded) {
      context.log.error("AppInsights not loaded");
    } else {
      context.log("AppInsights loaded successfully: ", isloaded);
    }

    if (!isTelemetryTracked) {
      context.log.error("All Telemetry Signals Tracked: No");
    } else {
      context.log("contains All Telemetry Signals Tracked: Yes: ", isTelemetryTracked);
    }

    if (!isCdnTracked) {
      context.log.error("CDN Check success: No");
    } else {
      context.log("contains CDN Check success: ", isCdnTracked);
    }

    if (!isIntegrous) {
      context.log.error("Intergrity Check success: No");
    } else {
      context.log("contains Intergrity Check success: ", isIntegrous);
    }

    if (isloaded && isTelemetryTracked && isCdnTracked && isIntegrous) {
      context.log("All tests passed");
      context.res = {
        status: 200,
        body: {
          "AppInsights Loaded": isloaded,
          "All Telemetry Tracked": isTelemetryTracked,
          "All Cdn Available": isCdnTracked,
          "Internal Error": error,
          "Integrity check": isIntegrous
        },
        headers: {
            "content-type": "text/plain"
        }
      };
    } else {
      context.log("One or more tests failed");
      context.res = {
        status: 500,
        body: {
          "AppInsights Loaded": isloaded,
          "All Telemetry Tracked": isTelemetryTracked,
          "All Cdn Available": isCdnTracked,
          "Internal Error": error,
          "Integrity check": isIntegrous
        },
        headers: {
            "content-type": "text/plain"
        }
      };
    }
};
