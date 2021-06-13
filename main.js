const puppeteer = require('puppeteer');
const readline = require('readline');
const db = require('./db')
const config = require('./config')
const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
dotenv.config();
const app = express();
const port = process.env.PORT || 8080;


let browsers = [];
//For development
app.use(cors({ // enables CORS 
  credentials: true, 
  origin: true, 
  methods: ['GET','POST'], 
  allowedHeaders: ['Content-Type', 'Authorization'] 
}));
//Interpreting JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/run',(req,res)=>{
    try{
        if(browsers.length!=0){
            console.log("Program already running ...")
          
        }
        else{
            console.log("Starting program ...")
            console.log('Number of processes: ',config.length)
            for(const c of config){
                scrape(c.url,c.start,c.destination,c.interval)
            }
        res.send('Successful')
    }
}catch(error){ res.send('Error')}
       
    
})
app.get('/stop',(req,res)=>{
    try{
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
        res.send('Successful')
    }catch(error){ res.send('Error')}
       
    
})


if(process.env.NODE_ENV == 'development'){

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
                console.log("Programs are now running ...")
     
              
            }
        }
      }
    });
}






async function scrape(url,start,destination,interval) {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox','--disable-setuid-sandbox']
    });
    browsers.push(browser)
    try{
        const page = await browser.newPage();
        await page.setJavaScriptEnabled(true)
        await page.goto(url);
        await page.click("#yDmH0d > c-wiz > div > div > div > div.NIoIEf > div.G4njw > div.AIC7ge > form > div.lssxud > div > button > span");
        await page .waitForSelector('.section-directions-trip-duration');
        
        while (true & browsers.length!=0) {
            await page.reload();
            await new Promise(resolve => setTimeout(resolve, 3000));
            let data = await page.evaluate(() => {
                console.log("QUERY : ",document.body.querySelector(".section-directions-trip-duration"))
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

        }

    }catch(error){
        console.log("Error caught, closing browser ...")
        console.log(error)
        await browser.close()
    }finally{
        await browser.close();
    }
   



};

app.listen(port, () => {
    console.log("We are live on " + port);
  });