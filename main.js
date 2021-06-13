const puppeteer = require('puppeteer');
const readline = require('readline');
const db = require('./db')
const config = require('./config')


let browsers = [];
console.log("Press 'q' to exit the program, press 'l' to start the program.")
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', (str, key) => {
  if (key.ctrl && key.name === 'c') {
    console.log('There are ',browsers.length,' browsers')
    for(const b of browsers){
        console.log("Closing browser ...")
        b.close()
    }
    browsers = []
    console.log("Closing program ...")
    process.exit();
  } else {
    //console.log(`You pressed the "${str}" key`);
    if(str == 'q'){
        if(browsers.length==0){
            console.log("Program already closed ...")
        }else{
            console.log('There are ',browsers.length,' browsers')
            for(const b of browsers){
                console.log("Closing browser ...")
                b.close()
            }
            browsers = []

            console.log("Closing program ...")
            //process.exit();
        }
    }
    if(str == 'l'){
        if(browsers.length!=0){
            console.log("Program already running ...")
          
        }
        else{
            console.log("Starting program ...")
            console.log('Number of processes: ',config.length)
            for(const c of config){
                scrape(c.url,c.start,c.destination,c.interval)
            }
 
          
        }
    }
  }
});


async function scrape(url,start,destination,interval) {
    const browser = await puppeteer.launch({
        "headless": false,
        "args": ["--fast-start", "--disable-extensions", "--no-sandbox"],
        "ignoreHTTPSErrors": true
    });
    browsers.push(browser)
    try{
        const page = await browser.newPage();
        await page.setJavaScriptEnabled(true)
        await page.goto(url);
        await page.click("#yDmH0d > c-wiz > div > div > div > div.NIoIEf > div.G4njw > div.AIC7ge > form > div.lssxud > div > button > span");
        await page .waitForSelector('.section-directions-trip-duration');
    
        while (true & browsers.length!=0) {
            let data = await page.evaluate(() => {
                let minute = document.body.querySelector(".section-directions-trip-duration").textContent
                return {
                    minute
                }
            });
        
            //Main logic 
            var regex = /\d+/g;
            var numbers = parseInt(data.minute.match(regex)[0]);  // creates array from matches
            if(data.minute.indexOf('min')!=-1){
                duration = numbers
            }else{
                duration = numbers * 60
            }
            date = new Date().toISOString();
            day = new Date(date).getDay()
            await db.execute(`INSERT INTO traffic (id, start, destination, duration,day, time) VALUES (DEFAULT, '${start}', '${destination}', ${duration}, ${day},'${date}')`)
            console.log("From ",start," to ",destination,", duration: ",duration)
            //End main logic
    

            await new Promise(resolve => setTimeout(resolve, parseInt(interval)*1000*60));
            await page.reload();
        }

    }catch(error){
        console.log("Error caught, closing browser ...")
        console.log(error)
        await browser.close()
    }finally{
        await browser.close();
    }
   



};

