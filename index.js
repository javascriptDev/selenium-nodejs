const {Builder, By, promise, until} = require('selenium-webdriver');

const config = require('./config');

let result = {};
promise.consume(function*() {

	let driver;

	let name = process.argv[2] ,pwd = process.argv[3];
	if(name == '' || pwd == '')return console.log('用户名,密码不能为空.');

	try{
		//初始化 builder
		driver = initBuilder();
	  	
	  	// 加载登录界面
		yield driver.get(config.index);
		
		//登录
		yield login(driver,name,pwd);

		//获取 pid 和 appid
		result.ids = yield navToDetail(driver);
		
		//跳转到 shop 页面
		driver.navigate().to(config.shop);

		driver.wait(until.urlContains(config.shopurl));

		//抓取 shop 数据
		let text = yield driver.findElement(By.css('table'));
		
		let tab = text.getText();

	}catch(e){
		throw e;
		// yield driver.quit();
	}finally{
		// yield driver.quit();
	}

}).then(_ => console.log('SUCCESS!'),
            e => console.error('FAILURE: ' + e));

/**
 * 初始化 builder
 * @return {[type]} [description]
 */
function initBuilder(){
	return new Builder()
					.forBrowser('chrome')
					.usingServer('http://localhost:4444/wd/hub')
					.build();
}
/**
 * 登录
 */
function login(driver,name,pwd){
	return promise.all([
			//设置用户名
			driver.findElement(By.name('logonId')).sendKeys( name),
			//设置密码
			driver.findElement(By.name('password_rsainput')).sendKeys(pwd),
			//自动点击登录
			driver.findElement(By.id('J-login-btn')).click(),
			//等待页面加载完毕
			driver.wait(until.urlContains(config.main))
	])
}

/**
 * 获取 pid 和 appid
 */
function navToDetail(driver){

	return promise.all([
			//跳转到详情页
			driver.navigate().to('https://e.alipay.com/merchant/accountDetail.htm'),
			//等待详情页面加载完毕
			driver.wait(until.urlContains(config.detail)),
			driver.findElements(By.className(config.detailItemCls)).then(function*(els){
				let pid  = yield els[0].getText();
				let appid  = yield els[1].getText();
				return {pid,appid}
			})
			
		]).then(item=>item[2])
}
