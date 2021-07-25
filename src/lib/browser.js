const puppeteer = require('puppeteer');

exports.closePage = async function closePage(browser, page) {
    if (page.browserContextId != undefined) {
      await browser._connection.send('Target.disposeBrowserContext', { browserContextId: page.browserContextId });
    }
    await page.close();
  }
  
exports.newPageContext = async function newPageContext(browser) {
    const { browserContextId } = await browser._connection.send('Target.createBrowserContext');
    const { targetId } = await browser._connection.send('Target.createTarget', { url: 'about:blank', browserContextId });
    var targetInfo = { targetId: targetId }
    const client = await browser._connection.createSession(targetInfo);
    const page = await browser.newPage({ context: 'another-context' }, client, browser._ignoreHTTPSErrors, browser._screenshotTaskQueue);
    page.browserContextId = browserContextId;
    return page;
}

exports.setBrowser = puppeteer.launch({ 
    headless: true,
    ignoreHTTPSErrors: true,
    args: [
        "--no-sandbox",
        '--netifs-to-ignore=INTERFACE_TO_IGNORE',
        '--ignore-certificate-errors',
        '--ignore-certificate-errors-spki-list ',
        '--user-agent="Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 123.1.0.26.115 (iPhone11,8; iOS 13_3; en_US; en-US; scale=2.00; 828x1792; 190542906)"'
    ]
})

exports.autoScroll = async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}