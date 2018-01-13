const puppeteer = require('puppeteer');
const request = require('request');
let arrr = [];
let now = 0;
let names = [];
async function run(searched) {
    var anime = {}
    console.log(searched)
    // Setup pupeteer
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage()
    try {
        await page.goto('http://anitokyo.tv/index.php?do=multisearch', {
            timeout: 10000,
            waitUntil: 'domcontentloaded',
        })
    } catch (err) {
        await console.log('Тут эррор 1')
        await CloseBrowser()
    };
    await page.click('#story')
    await page.type('#story', searched)
    await page.click('input[value="Поиск"]')
    await page.waitForSelector('.story')
    let Output = await page.evaluate(() => {
        try{
            var years = document.querySelectorAll('.story')[0].querySelector('ul.lcol > li:nth-child(2)').innerHTML.slice(-11, -7)
            var nmu = 0
            for (var i = 0; i < document.querySelectorAll('.story').length; i++) {
                if (document.querySelectorAll('.story')[i].querySelector('ul.lcol > li:nth-child(2)').innerHTML.slice(-11, -7) < years) {
                    years = document.querySelectorAll('.story')[i].querySelector('ul.lcol > li:nth-child(2)').innerHTML.slice(-11, -7)
                    nmu = i
                }
            }
            return document.querySelectorAll('.story')[nmu].querySelector('.story_h > a').href
        } catch (e) {
            return ''
        }
    });
    console.log(Output)
    if (Output == ''){
        console.log(Output)
        console.log('Неверное имя')
        return await CloseBrowser()
    }
    let link = await Output
    try {
        await page.goto(Output)
    } catch (err) {
        console.log(Output)
        await console.log('Тут эррор 2');
        return await CloseBrowser()
    };
    anime = await page.evaluate(() => {
        var genres = ' '
        for (var i = 0; i <= document.querySelector('#dle-content > article > div.story_c > ul > li:nth-child(4)').querySelectorAll('a').length-1; i++) {
            genres = genres + document.querySelector('#dle-content > article > div.story_c > ul > li:nth-child(4)').querySelectorAll('a')[i].innerHTML + ' '
        }
        return {
            name: document.querySelector('.story_h').innerHTML,
            fullnames: document.querySelector('.reset').querySelector('b').innerHTML,
            cover: document.querySelector('.poster').querySelector('a').href
        }
    })
    console.log('aaaa')
    anime.url = {
        anitokyo: link
    };
    try {
        await page.goto('https://shikimori.org/animes?search='+ searched, {
            timeout: 10000,
            waitUntil: 'domcontentloaded',
        })
    } catch (err) {
        await console.log('Тут эррор 3');
        return await CloseBrowser()
    };
    await page.waitForSelector('body')
    anime.url.shikimori = await page.evaluate(() => {
        if (document.querySelectorAll('.b-db_entry')[0] == undefined){
            return document.querySelectorAll('.cover')[0].href
        } else {
            return "https:" + document.querySelectorAll('meta[itemprop="url"]')[0].getAttribute('content')
        }
    })
    console.log(anime.url.shikimori)
    console.log(page.url())
    if (page.url() != anime.url.shikimori){
        try {
            await page.goto(anime.url.shikimori, {
                timeout: 10000,
                waitUntil: 'domcontentloaded',
            })
        } catch (err) {
            await console.log('Тут эррор 4');
            return await CloseBrowser()
        };
    }
    anime.genres = await page.evaluate(() => {
        var genres = ' ';
        for (var i = 0; i < document.querySelectorAll('.b-tag').length; i++) {
            genres = genres + document.querySelectorAll('.b-tag')[i].querySelector('.genre-ru').getAttribute('data-text') + ' '
        };
        return genres;
    })
    async function CloseBrowser() {
        await browser.close()
    };
    await CloseBrowser()
    arrr.push(anime);
    console.log(arrr)
    
};
names = []
request.post({
    url: 'https://us-central1-website-8d475.cloudfunctions.net/getData',
    json: true,
    body: {name: "anime"}
}, function (res, req) {
    for (let i=0; i<req.body.length-1;i++){
        names.push(req.body[i].engname.replace(';', ' ').replace(':',' ').toLowerCase())
    }
    console.log(names)
    for (let a =0; a<names.length-1;a++){
        setTimeout(
            function (){
                console.log(a);
                run(names[a])
            }
        ,a*15000)
    }
//})

})

