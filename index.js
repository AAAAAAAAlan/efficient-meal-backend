const puppeteer = require('puppeteer')
const express = require('express')
const app = express()
const cors = require('cors')
const port = 4000
const products = []



async function getData () {
	const browser = await puppeteer.launch({ headless: false, defaultViewport: null, args: ['--window-size=1920,1080']})
	const page = await browser.newPage()

	await page.goto('https://mcdonalds.ru/menu')

	await getProducts(4)


	async function getProducts(index) {
		await page.click(`#__layout  div  div.page-container  section  article  div.delivery-main.page-catalog__delivery  div.menu-categories-wrap  div  div  div.menu-categories__wrap  div:nth-child(${index})`)
		await page.waitFor(1000)


		const name = await page.$$eval('ul.base-grid-container li.catalog-product .catalog-product-title', options => options.map(option => option.textContent))
		const productsPrice = await page.$$eval('ul.base-grid-container li.catalog-product .catalog-product__price', options => options.map(option => option.textContent.replace(/\s/g,'')))
		const productsName = [...new Set(name)]
		const productsCalories = []
		const productsURL = []

    

		for (let i = 1; i < productsPrice.length + 1; i++) { // 
			await page.click(`#__layout > div > div.page-container > section > article > div:nth-child(4) > ul > li:nth-child(${i}) > div.catalog-product__link-image > div`) // Open product modal
			try {
				await page.waitForSelector('.el-collapse-item__header') // Wait for calories info bar appear
				await page.click('.el-collapse-item__header') // Open calories info
				console.log('Element exist')

				let calories = await page.$eval('div.product-nutrition__line.product-nutrition__line_no-border > span', el => el.innerText) // Get calories info
				productsCalories.push(calories)

				try{
					const URL = await page.$eval('div.product-settings__img-wrap > div > img', el => el.src) // Get img
					productsURL.push(URL)
				} catch(error){
					const URL = await page.$eval('el-image__inner', el => el.src) // Get img
					productsURL.push(URL)
				}


				await page.waitFor(500)
				await page.click('div.base-modal.modal-product.base-modal_product-settings.modal-product_active div button') // Close modal
				await page.waitFor(500)

			} catch (error) {
				await page.click('.mc-combo-variants__product') // Show modal of product
				await page.waitFor(500)
				console.log('The element didn\'t appear.')

				await page.waitForSelector('.el-collapse-item__header') // Wait for calories info bar appear
				await page.click('.el-collapse-item__header') // Open calories info

				let calories = await page.$eval('div.product-nutrition__line.product-nutrition__line_no-border > span', el => el.innerText) // Get calories info
				productsCalories.push(calories) // Get calories info

				try{
					const URL = await page.$eval('div.product-settings__img-wrap > div > img', el => el.src) // Get img
					productsURL.push(URL)
				} catch(error){
					const URL = await page.$eval('el-image__inner', el => el.src) // Get img
					productsURL.push(URL)
				}

				await page.waitFor(500)
				await page.click('div.base-modal.modal-product.base-modal_product-settings.modal-product_active div button') // Close modal
				await page.waitFor(500)
			}
		}


		for (let i = 0; i < productsName.length; i++) {
			products.push(
				{
					name: productsName[i],
					price: productsPrice[i],
					calories: productsCalories[i],
					efficiency: productsCalories[i].split(',')[0].replace(/[^0-9.]/g, '') / productsPrice[i].replace(/[^0-9.]/g, ''),
					url: productsURL[i]
				})
		}
	}
	return products
}

getData()


// Server

app.use(cors())

app.get('/', (req, res) => {
	res.send(products)
})

app.listen(port, () => {
	console.log(`App listening at http://localhost:${port}`)
})