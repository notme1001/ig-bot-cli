const fs = require('fs');
const { Login, checkExp } = require('./src/lib/login')
const { menu } = require('./src/lib/menu')
const { clear_console } = require('./src/lib/clear_console')

const { 
    closePage, 
    newPageContext, 
    setBrowser 
} = require('./src/lib/browser')
const {
    auto_reply,
    send_msg,
    get_profile,
    get_posts,
    edit_profile,
    capture_msg,
    get_inbox,
    get_user_posts,
    follow_user,
    unfollow_user
} = require('./src/lib/bot')

// ------------CLI----------------
const prompts = require('prompts');
const signale = require('signale')
const ora = require('ora');
const chalk = require('chalk');
// ------------====----------------
const log = console.log

const path = require('path');


var run = async function () {
    return new Promise(async (resolve, reject) => {
        const spinner = ora(`Running ${chalk.greenBright('Bot..')}`).start();
    
        const browser = await setBrowser
        const context = await browser.defaultBrowserContext();
        const page = await newPageContext(browser);

        const previousSession = fs.existsSync('./src/cookie.json')
        
        if (previousSession) {
            // If file exist load the cookies
            const cookiesString = fs.readFileSync('./src/cookie.json');
            const parsedCookies = JSON.parse(cookiesString);
            if (parsedCookies.length !== 0) {
                for (let cookie of parsedCookies) {
                    await page.setCookie(cookie)
                }
                await checkExp(page)

                log('\n')
                signale.success('Session loaded in the browser');
                
                context.overridePermissions('https://www.instagram.com/', ["notifications"]);

                await clear_console();

                spinner.succeed(`Proccessing Complete!`);
                const {select} = await menu()
                switch (select) {
                    case 1:
                        await auto_reply(page)
                        break;
                    case 2:
                        await send_msg(page)
                        break;
                    case 3:
                        await get_profile(page)
                        break;
                    case 4:
                        await get_posts(page)
                        break;
                    case 5:
                        await edit_profile(page)
                        break;
                    case 6:
                        await capture_msg(page)
                        break;
                    case 7:
                        await get_inbox(page)
                        break;
                    case 8:
                        await get_user_posts(page)
                        break;
                    case 9:
                        await follow_user(page)
                        break;
                    case 10:
                        await unfollow_user(page)
                        break;
                    case 11:
                        log('Bye :(')
                        reject(process.exit());
                        break;
                
                    default:
                        await clear_console();
                        await menu()
                        break;
                }
            }
        } else {
            await clear_console();
            spinner.succeed(`Proccessing Complete!`);
            signale.warn('Please Login Instagram!');
            const form = await prompts([
                {
                    type: 'text',
                    name: 'username',
                    message: 'Input Username :'
                },
                {
                    type: 'password',
                    name: 'password',
                    message: 'Input Password :'
                }
            ]);

            await Login(page, form)
        }
        
        const quit = await prompts([
            {
                type: 'confirm',
                name: 'confirm',
                message: 'Repeat bot? (Y/N)',
            }
        ]);

        await closePage(browser, page);

        if(quit.confirm){
            await clear_console();
            resolve(run());
        } else {
            await browser.close();
            log('Bye :(')
            reject(process.exit());
        }
    })

//   Create New Page
//   const newpage = await newPageContext(browser);
//   await newpage.goto('https://example.com');
//   var newCookie = await newpage.cookies();

}

run()