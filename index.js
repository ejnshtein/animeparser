const puppeteer = require('puppeteer')
const request = require('request')
const imgur = require('imgur')
let arrr = []
let names = []
imgur.setClientId('55547fc9799235a');
async function run(searched, output) {
    let anime = {
        engname: '',
        fullname: '',
        japanese: '',
        synonyms: '',
        genres: '',
        url: {
            shikimori: '',
            anitokyo: ''
        },
        cover: ''
    }
    const browser = await puppeteer.launch({ 
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage()
    try {
        await page.goto('https://shikimori.org/animes?search=' + searched, {
            timeout: 10000,
            waitUntil: 'domcontentloaded',
        })
    } catch (err) {
        await CloseBrowser()
        return output(true)
    };
    await page.waitForSelector('body')
    anime.url.shikimori = await page.evaluate(() => {
        if (document.querySelectorAll('.b-db_entry')[0] == undefined) {
            let doc = document.querySelectorAll('.cc-entries > article')
            let id = Number.parseInt(doc[0].getAttribute('id'))
            let link = doc[0].querySelector('a').href
            for (let i = 0; i < doc.length; i++) {
                let name = doc[i].querySelector('a').href.slice(doc[i].querySelector('a').href.indexOf('-') + 1)
                if (Number.parseInt(doc[i].getAttribute('id')) < id &&
                    name.search(document.querySelector('input[type="text"]').value.toLowerCase().split(' ').join('-')) != -1) {
                    id = doc[i].getAttribute('id')
                    link = doc[i].querySelector('a').getAttribute('href') || false
                }
            }
            return link
        } else {
            return "https:" + document.querySelectorAll('meta[itemprop="url"]')[0].getAttribute('content')
        }
    })
    try {
        await page.goto('http://anitokyo.tv/index.php?do=multisearch', {
            timeout: 10000,
            waitUntil: 'domcontentloaded',
        })
    } catch (err) {
        await CloseBrowser()
        return output(true)
    };
    await page.click('#story')
    await page.type('#story', searched)
    await page.click('input[value="Поиск"]')
    await page.waitForSelector('.content')
    let anitokyo = await page.evaluate(() => {
        if (document.querySelectorAll('.story').length == 1) {
            return {
                link: document.querySelector('.story a').href,
                cover: document.querySelector('.poster-img a').href
            }
        }
        return {
            link: document.querySelector('.story a').href,
            cover: ''
        }
    })
    if (anitokyo.cover == '') {
        try {
            await page.goto(anitokyo.link, {
                timeout: 10000,
                waitUntil: 'domcontentloaded',
            })
        } catch (e) {z
        };
        anitokyo = await page.evaluate(() => {
            return {
                link: document.querySelector('#dle-content > article > div.section > div > div > ul > li:nth-child(1) > a').href,
                cover: document.querySelector('#dle-content > article > div.story_c > div.poster > span > a').href
            }
        })
        anime.cover = anitokyo.cover
        anime.url.anitokyo = anitokyo.link
    } else {
        anime.url.anitokyo = anitokyo.link
        anime.cover = anitokyo.cover
    }
    CloseBrowser()
    console.log(anime)
    let str = anime.url.shikimori.slice(anime.url.shikimori.lastIndexOf('/') + 1, anime.url.shikimori.indexOf('-'))
    await request.get('https://shikimori.org/api/animes/' + str,
        function (req, res) {
            res = JSON.parse(res.body)
            anime.engname = res.name
            anime.fullname = res.name + ' / ' + res.russian
            for (let i = 0; i < res.japanese.length; i++) {
                anime.japanese = anime.japanese + res.japanese[i] + ' '
            }
            for (let i = 0; i < res.synonyms.length; i++) {
                anime.synonyms = anime.synonyms + res.synonyms[i] + ' '
            }
            for (let i = 0; i < res.genres.length; i++) {
                anime.genres = anime.genres + res.genres[i].russian + ' '
            }
            imgur.uploadUrl(anime.cover)
                .then(function (json) {
                    anime.cover = json.data.link
                    arrr.push(anime);
                    output(false,anime)
                })
                .catch(function (err) {
                    console.error(err.message);
                });
        })
    async function CloseBrowser() {
        await browser.close()
    };
};

// names = ['Masamune-kun\'s Revenge'] // write there array of title names

// let a = 0

// function start(name, output) {
//     if (name != undefined) {
//         run(name, function (res) {
//             pushData(res)
//             a++
//             if (a < names.length) start(names[a])
//         })
//     } else {
//         start(names[a])
//     }
// }

// function pushData(dataToPush) {
//     console.log(JSON.stringify(dataToPush))
// };
exports.getAllAnimeData = function(animeName, output){
    run(animeName, (err,data) => {
        if (err) return output('Error!')
        output(data)
    })
}