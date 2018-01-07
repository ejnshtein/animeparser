const puppeteer = require('puppeteer');
let arrr = [];
async function run(searched) {
    var anime = {}
    console.log(searched)
    // Setup pupeteer
    const browser = await puppeteer.launch({
        headless: false
    })
    const page = await browser.newPage()
    // Connect to Anitokyo
    try {
        await page.goto('http://anitokyo.tv/index.php?do=multisearch', {
            timeout: 10000,
            waitUntil: 'domcontentloaded',
        })
    } catch (err) {
        await console.log('Тут эррор')
        await CloseBrowser()
    };
    await page.click('#story')
    await page.type('#story', searched)
    await page.click('input[value="Поиск"]')
    await page.waitForSelector('.content')

    let Output = await page.evaluate(() => {
        try{
            var years = document.querySelectorAll('.story')[0].querySelector('.reset > li:nth-child(3)> a').innerHTML
            var nmu = 0
            for (var i = 0; i < document.querySelectorAll('.story').length-1; i++) {
                if (document.querySelectorAll('.story')[i].querySelector('.reset > li:nth-child(3)> a').innerHTML < years) {
                    years = document.querySelectorAll('.story')[i].querySelector('.reset > li:nth-child(3)> a').innerHTML
                    nmu = i
                }
            }
            return document.querySelectorAll('.story')[nmu].querySelector('.story_h > a').href
        } catch (e) {
            return ''
        }
    });
    if (Output == ''){
        console.log('Неверное имя')
        return await CloseBrowser()
    }
    let link = await Output
    //await console.log('[API] Link: ' + Output);
    try {
        await page.goto(Output)
    } catch (err) {
        await console.log('Тут эррор');
        await CloseBrowser()
    };
    anime = await page.evaluate(() => {
        var genres = ' '
        for (var i = 0; i <= document.querySelector('#dle-content > article > div.story_c > ul > li:nth-child(4)').querySelectorAll('a').length-1; i++) {
            genres = genres + document.querySelector('#dle-content > article > div.story_c > ul > li:nth-child(4)').querySelectorAll('a')[i].innerHTML + ' '
        }
        return {
            name: document.querySelector('.story_h').innerHTML,
            fullnames: document.querySelector('.reset').querySelector('b').innerHTML,
            cover: document.querySelector('.poster').querySelector('a').href,
            genre: genres
        }
    })
    anime.url = {
        anitokyo: link,
        shikimori: ''
    };
    await console.log(anime)
    arrr.push(anime);
    async function CloseBrowser() {
        await browser.close()
    };
    await CloseBrowser()
    
    console.log(arrr)
};
run('Boku no hero academia')
run('Steins Gate')