import express from 'express';
import dotenv from 'dotenv'
import puppeteer from 'puppeteer';
import fs from 'fs/promises';

dotenv.config()
const Port = process.env.PORT || 8800
const app = express();

const url = 'https://books.toscrape.com'

const main = async () => {
    const browser = await puppeteer.launch({headless:true})
    const page = await browser.newPage()
    await page.goto(url)
    
    const bookData = await page.evaluate(()=>{

        const convertPrice = (price: string)=>{
            return parseFloat(price.replace('£'," "))
        }

        const convertRating=(rating:string)=>{
            switch(rating.toLowerCase()){
                case "one": return 1
                case "two": return 2
                case "three": return 3
                case "four": return 4
                case "five": return 5
                default: return 0
            }
        }

        const bookPods = Array.from(document.querySelectorAll('.product_pod'))
        const data = bookPods.map((pod:any) =>({
            title: pod.querySelector("h3 a")?.getAttribute("title"),
            price: convertPrice(pod.querySelector(".price_color")?.innerHTML) ,
            image: pod.querySelector('img')?.getAttribute('src'),
            rating: convertRating(pod.querySelector('.star-rating')?.classList[1])
        }))
        return data
    })

    console.log(bookData)

    await browser.close()

    fs.writeFile('data.json', JSON.stringify(bookData))
}

main()

app.get('/', (req,res) => {
    res.send('hello')
})

app.listen(Port,()=>{
    console.log(`listening at http://localhost:${Port}`)
})
