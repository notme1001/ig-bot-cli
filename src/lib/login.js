const selector = require('../selector.json');
const fs = require('fs');
const log = console.log
const signale = require('signale')

exports.Login = async (page, form) => {
    await page.goto('https://instagram.com', { waitUntil: "networkidle0" });
    const Login = await page.$x(selector.login.go_login);
    await Login[0].click();

    await new Promise(y => setTimeout(y, 1000));

    const Username = await page.$x(selector.login.username);
    const Password = await page.$x(selector.login.password);
    const SubmitBtn = await page.$x(selector.login.Submit_btn);
    await Username[0].type(form?.username);
    await Password[0].type(form?.password);
    await SubmitBtn[0].click();

    await new Promise(r => setTimeout(r, 2000));
    
    const [wrongPw] = await page.$x(selector.login.err.wrong_pw)
    const [alert] = await page.$x(selector.login.err.alert)

    if(alert){
        const getMsg = await page.evaluate(name => name.innerText, alert);
        log({err: true, msg: getMsg})
        signale.error(getMsg);
    } else if(wrongPw){
        const getMsg = await page.evaluate(name => name.innerText, wrongPw);
        log({err: true, msg: getMsg})
        signale.error(getMsg);
    }

    await new Promise(r => setTimeout(r, 2000));
    const cookie = await page.cookies();
    await fs.writeFileSync('./src/cookie.json',JSON.stringify(cookie), 'utf8')
    signale.success('Login Success!!');
}

exports.checkExp = async (page) => {
    try{
        await page.goto('http://instagram.com', { waitUntil: "networkidle0" })
        const Login = await page.$x(selector.login.go_login);
        await Login[0].click();

        await new Promise(y => setTimeout(y, 2000));

        const [loginCheck] = await page.$x(selector.login.login_check)
        const checkLogin = await page.evaluate(name => name.innerText, loginCheck) == "Don't have an account? Sign up"
        if(checkLogin) fs.unlinkSync('./src/cookie.json')
    } catch {
        return
    }
}