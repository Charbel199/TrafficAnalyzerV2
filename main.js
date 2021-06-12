const puppeteer = require('puppeteer');
const readline = require('readline');
const db = require('./db')

let running = false;
console.log("Press 'q' to exit the program, press 'l' to start the program.")
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', (str, key) => {
  if (key.ctrl && key.name === 'c') {
    process.exit();
  } else {
    //console.log(`You pressed the "${str}" key`);
    if(str == 'q'){
        if(!running){
            console.log("Program already closed ...")
        }else{
            running = false;
            console.log("Closing program ...")
        }
    }
    if(str == 'l'){
        if(running){
            console.log("Program already running ...")
        }
        else{
            console.log("Starting program ...")
            running = true;
            scrape()
        }
    }
  }
});


async function scrape() {
    const browser = await puppeteer.launch({
        "headless": false,
        "args": ["--fast-start", "--disable-extensions", "--no-sandbox"],
        "ignoreHTTPSErrors": true
    });
    try{
        const page = await browser.newPage();
        await page.setJavaScriptEnabled(true)
        await page.goto('https://www.google.com/maps/dir/Lebanese+American+University,+Byblos+Campus,+Blat,+Lebanon/Fanar,+Lebanon/@34.0010134,35.4776456,11z/data=!3m1!4b1!4m14!4m13!1m5!1m1!1s0x151f5b485f22ba8b:0xb777d642de56b49a!2m2!1d35.6744347!2d34.1155614!1m5!1m1!1s0x151f3d919385703f:0xcdd985b12eddd900!2m2!1d35.578307!2d33.8798483!3e0');
        await page.click("#yDmH0d > c-wiz > div > div > div > div.NIoIEf > div.G4njw > div.AIC7ge > form > div.lssxud > div > button > span");
        await page .waitForSelector('.section-directions-trip-duration');
    
        while (true && running) {
            let minute = await page.evaluate(() => {
                let minuteElement = document.body.querySelector(".section-directions-trip-duration").textContent
                
                return minuteElement
            });
            
            //Main logic 
            var regex = /\d+/g;
            var numbers = parseInt(minute.match(regex)[0]);  // creates array from matches
            if(minute.indexOf('min')!=-1){
                duration = numbers
            }else{
                duration = numbers * 60
            }
            console.log(duration);
            date = new Date().toISOString();
            console.log(date)
            await db.execute(`INSERT INTO traffic (id, start, destination, duration, time) VALUES (DEFAULT, 'jdeideh', 'jbeil', 30, '${date}')`)
           
            //End main logic
    
    
    
            await page.reload();
            await new Promise(resolve => setTimeout(resolve, 5000));
            if(!running){
                await browser.close()
            }
        }
       console.log("Program closed ...")
    }catch(error){
        console.log("Error caught, closing browser ...")
        await browser.close()
    }
   



};

