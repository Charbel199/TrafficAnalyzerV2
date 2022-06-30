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

app.get('/run/:interval?',(req,res)=>{
    try{
        if(browsers.length!=0){
            console.log("Program already running ...")
          
        }
        else{
            console.log("Starting program ...")
            console.log('Number of processes: ',config.length)

           
            for(const c of config){
                if(req.params.interval!=null){
                    try{
                   
                    interval = parseFloat(req.params.interval)
                        if(isNaN(interval)){
                            interval = c.interval
                        }
                    }
                    catch(exception){
                        interval = c.interval
                    }
                }else{
                    interval = c.interval
                }
                console.log('Interval: ',interval)
                scrape(c.url,c.start,c.destination,interval)
            }
        res.send('Successful Run')
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
        res.send('Successful Close')
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
        headless: true, 
        args: ['--no-sandbox','--disable-setuid-sandbox']
    });
    browsers.push(browser)
    try{
        const page = await browser.newPage();
        await page.setJavaScriptEnabled(true)
        await page.goto(url);

        await page .waitForSelector('#section-directions-trip-0 > div.MespJc > div:nth-child(1) > div.XdKEzd > div.Fk3sm.fontHeadlineSmall.delay-medium > span:nth-child(1)');
        
        while (true & browsers.length!=0) {
            await page.reload();
            await new Promise(resolve => setTimeout(resolve, 3000));
            let data = await page.evaluate(() => {
            	
                console.log("QUERY : ",document.body.querySelector("#section-directions-trip-0 > div.MespJc > div:nth-child(1) > div.XdKEzd > div.Fk3sm.fontHeadlineSmall.delay-medium > span:nth-child(1)"))
                let minute = document.body.querySelector("#section-directions-trip-0 > div.MespJc > div:nth-child(1) > div.XdKEzd > div.Fk3sm.fontHeadlineSmall.delay-medium > span:nth-child(1)").textContent
                return {
                    minute
                }
            });
        
            //Main logic 
            var regex = /\d+/g;
            var numbers = data.minute.match(regex);  // creates array from matches
            if(data.minute.indexOf('hr')!=-1){
                duration = parseInt(numbers[0])*60+parseInt(numbers[1])
            }
            else{
                duration = parseInt(numbers[0])
            }
            date = new Date().toISOString();
            day = new Date(date).getDay()
            await db.execute(`INSERT INTO traffic (id, start, destination, duration,day, time) VALUES (DEFAULT, '${start}', '${destination}', ${duration}, ${day},'${date}')`)
            console.log("From ",start," to ",destination,", duration: ",duration)
            //End main logic
    

            await new Promise(resolve => setTimeout(resolve, parseFloat(interval)*1000*60));

        }

    }catch(error){
        console.log("Error caught, closing browser ...")
        console.log(error)
        await browser.close()
        const index = browsers.indexOf(browser);
        if (index > -1) {
            browsers.splice(index, 1);
        }
    }



};

app.listen(port, () => {
    console.log("We are live on " + port);
  });