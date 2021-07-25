const { clear_console } = require('../clear_console')
const selector = require('../../selector.json')
const prompts = require('prompts');
const ora = require('ora');
const chalk = require('chalk');
const log = console.log
const { autoScroll, closePage } = require('../browser')
const signale = require('signale')
const fs = require('fs')

exports.auto_reply = async (page) => {
    await clear_console()
    const form = await prompts([
        {
            type: 'text',
            name: 'message',
            message: 'Message Reply: '
        }
    ]);
    
    await page.goto('https://www.instagram.com/direct/inbox/', { waitUntil: "networkidle0" });

    try {
        const CloseModal = await page.$x(selector.auto_reply.closeModal);
        await CloseModal[0].click();
    } catch (err) {

    }

    let run = ora(`Auto Reply ${chalk.greenBright('Running..')}`).start();

    setInterval(async () => {
        try {
            await clear_console()
            run.start()
            const UrlMsg = await page.$$eval(selector.auto_reply.urlMsg, urls => urls.map(url => url.innerHTML));
                    
            let listReply = await UrlMsg.filter(item => item.includes('<div class=" _41V_T')).map( async res => res.match(/href="([^"]*)/)[1] )
            for(let user = 0; user < listReply.length; user++){
                await page.$$eval(selector.auto_reply.newMsg, 
                    urls => urls.filter(async url => url.getAttribute('href') == await listReply[user])[0].click()
                );
                const [inputMsg] = await page.$x(selector.auto_reply.inputMsg);
                await page.evaluate(name => name.value = '', inputMsg);
                await inputMsg.type(form?.message);
                await new Promise(y => setTimeout(y, 1000));
                const sendBtn = await page.$x(selector.auto_reply.sendBtn);
                await sendBtn[0].click();
                await new Promise(y => setTimeout(y, 2000));
                log("success send message")
                const [button] = await page.$x(selector.auto_reply.backBtn);
                await button.click();
                run.succeed('Success reply message!')
                await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
            }
        } catch (err) {
            // log('No new message')
            // await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
        }
    }, 4000);
}

exports.get_profile = async (page) => {
    await clear_console()
    const run = ora(`Scrap Data ${chalk.greenBright('Running..')}`).start();
    await page.goto('https://instagram.com', { waitUntil: "networkidle0" });
    try {
        const CloseModal = await page.$x(selector.profile.close_modal);
        await CloseModal[0].click();
    } catch (err) {
    }
    await new Promise(y => setTimeout(y, 1000));
    const ProfileMenu = await page.$x(selector.profile.profileMenu);
    await ProfileMenu[0].click();
    await new Promise(y => setTimeout(y, 2000));
    await autoScroll(page);
    const [Followers] = await page.$x(selector.profile.followers)
    const [TotalPost] = await page.$x(selector.profile.totalPost)
    const [Following] = await page.$x(selector.profile.following)

    run.succeed('Scrap Profile Success!')

    log({
        followers: await page.evaluate(name => name.innerText, Followers),
        totalPost: await page.evaluate(name => name.innerText, TotalPost),
        following: await page.evaluate(name => name.innerText, Following),
    })
}

exports.send_msg = async (page) => {
    await clear_console()
    const form = await prompts({
        type: 'text',
        name: 'username',
        message: 'Find message recipient username : '
    });
    const findUser = ora(`Find ${chalk.greenBright('User..')}`).start();

    await page.goto(`https://www.instagram.com/direct/inbox/`, { waitUntil: "networkidle0" });
    try {
        const CloseModal = await page.$x(selector.auto_reply.closeModal);
        await CloseModal[0].click();
    } catch (err) {
        log('new message 0')
    }

    await new Promise(y => setTimeout(y, 2000));
    const [newMsg] = await page.$x(selector.send_msg.msg_btn);
    await newMsg.click();
    await new Promise(y => setTimeout(y, 1000));
    const [inputUser] = await page.$x(selector.send_msg.input_user);
    await inputUser.type(form.username);
    await new Promise(y => setTimeout(y, 2000));
    const userList = await page.$$eval(selector.send_msg.user_list, urls => urls.map(url => url.innerText));

    await findUser.succeed('Find User Success!')
    await userList.map((item, index) =>  log(`${index + 1}. ${chalk.blueBright(`[${item.split('\n')[0]}] ${item.split('\n')[1]}`)}`))

    let {user} = await prompts({
        type: 'number',
        name: 'user',
        message: chalk` {green Select Username :}`
    });
    
    await page.$$eval(selector.send_msg.user_list, 
        urls => urls.filter(async url => url.innerText == await UrlMsg[user - 1])[0].click()
    );
    
    await new Promise(y => setTimeout(y, 1000));
    const [btnNext] = await page.$x(selector.send_msg.btn_next);
    await btnNext.click();
    await page.waitForNavigation({
		waitUntil: "networkidle2",
	});

    await clear_console()
    
    const sendMsg = () => {
        return new Promise(async (resolve, reject) => {
            const {message} = await prompts({
                type: 'text',
                name: 'message',
                message: 'Input your message : '
            });
            const sending = ora(`Send ${chalk.greenBright('Message..')}`).start();
        
            const [inputMsg] = await page.$x(selector.send_msg.input_msg);
            await page.evaluate(name => name.value = '', inputMsg);
            await inputMsg.type(message);
            await new Promise(y => setTimeout(y, 1000));
            const sendBtn = await page.$x(selector.send_msg.send_btn);
            await sendBtn[0].click();
            sending.succeed('Success Send Message ^_^')

            const quit = await prompts([
                {
                    type: 'confirm',
                    name: 'confirm',
                    message: 'Resend Message? (Y/N)',
                }
            ]);
            
            if(quit.confirm){
                await clear_console();
                resolve(sendMsg());
            } else {
                resolve()
            }
        })
    }

    await sendMsg()

}

exports.get_posts = async (page) => {
    await clear_console()
    const getPosts = ora(`Scrap ${chalk.greenBright('User posts..')}`).start();
    await page.goto('https://instagram.com', { waitUntil: "networkidle0" });
    try {
        const CloseModal = await page.$x(selector.profile.close_modal);
        await CloseModal[0].click();
    } catch (err) {
        log()
    }
    await new Promise(y => setTimeout(y, 1000));
    const ProfileMenu = await page.$x(selector.profile.profileMenu);
    await ProfileMenu[0].click();
    await new Promise(y => setTimeout(y, 2000));
    await autoScroll(page);

    await new Promise(y => setTimeout(y, 4000));
    const Images = await page.$$eval(selector.user_posts.image, imgs => imgs.map(img => img.getAttribute('src')));

    const UrlPost = await page.$$eval(selector.user_posts.url, urls => urls.map(url => `https://instagram.com/${url.getAttribute('href')}`));

    await getPosts.succeed('Scrap User posts Success!')
    
    log({
        Images,
        UrlPost
    })
}

exports.edit_profile = async (page) => {
    await clear_console()
    const run = ora(`${chalk.greenBright('Processing...')}`).start();
    await page.goto('https://www.instagram.com/accounts/edit/', { waitUntil: "networkidle0" });

    const [Name] = await page.$x(selector.edit_profile.name);
    const [Username] = await page.$x(selector.edit_profile.username);
    const [Website] = await page.$x(selector.edit_profile.website);
    const [Bio] = await page.$x(selector.edit_profile.bio);
    const SaveBtn = await page.$x(selector.edit_profile.submit);

    await page.evaluate(name => name.value = '', Name);
    await page.evaluate(name => name.value = '', Username);
    await page.evaluate(name => name.value = '', Website);
    await page.evaluate(name => name.value = '', Bio);

    await run.stop()
    const form = await prompts([
        {
            type: 'text',
            name: 'name',
            message: 'edit name : '
        },
        {
            type: 'text',
            name: 'username',
            message: 'edit username : '
        },
        {
            type: 'text',
            name: 'website',
            message: 'edit website : '
        },
        {
            type: 'text',
            name: 'bio',
            message: 'edit bio : '
        }
    ]);

    if(form.name){
        await Name.type(form.name);
    } else if(form.username){
        await Username.type(form.username);
    } else if(form.website){
        await Website.type(form.website);
    } else if(form.bio){
        await Bio.type(form.bio);
    }
    
    await SaveBtn[0].click();
}

exports.capture_msg = async (page) => {
    await clear_console()
    const form = await prompts([
        {
            type: 'text',
            name: 'username',
            message: 'Find message by username : '
        },
        {
            type: 'number',
            name: 'width',
            message: 'set width capture [optional] : '
        },
        {
            type: 'number',
            name: 'height',
            message: 'set height capture [optional] : '
        }
    ]);
    const run = ora(`${chalk.greenBright('Processing..')}`).start();
    
    await page.setViewport({width: form.width || 620, height: form.height || 1480});
    await page.goto(`https://www.instagram.com/direct/inbox/`, { waitUntil: "networkidle0" });
    try {
        const CloseModal = await page.$x(selector.auto_reply.closeModal);
        await CloseModal[0].click();
    } catch (err) {
        log('new message 0')
    }

    await new Promise(y => setTimeout(y, 2000));
    const [newMsg] = await page.$x(selector.send_msg.msg_btn);
    await newMsg.click();
    await new Promise(y => setTimeout(y, 1000));
    const [inputUser] = await page.$x(selector.send_msg.input_user);
    await inputUser.type(form.username);
    await new Promise(y => setTimeout(y, 2000));
    const userList = await page.$$eval(selector.send_msg.user_list, urls => urls.map(url => url.innerText));

    await run.succeed('Find User Success!')
    await userList.map((item, index) =>  log(`${index + 1}. ${chalk.blueBright(`[${item.split('\n')[0]}] ${item.split('\n')[1]}`)}`))

    let {user} = await prompts({
        type: 'number',
        name: 'user',
        message: chalk` {green Select Username :}`
    });
    
    await page.$$eval(selector.send_msg.user_list, 
        urls => urls.filter(async url => url.innerText == await UrlMsg[user - 1])[0].click()
    );
    
    await new Promise(y => setTimeout(y, 1000));
    const [btnNext] = await page.$x(selector.send_msg.btn_next);
    await btnNext.click();
    await page.waitForNavigation({
		waitUntil: "networkidle2",
	});

    const scrollable_section = selector.capture_msg.scroll_sec;
    await page.waitForSelector(selector.capture_msg.page_wait);

    await page.evaluate(selector => {
    const scrollableSection = document.querySelector(selector);

    scrollableSection.scrollTop = scrollableSection.offsetHeight;
    }, scrollable_section);

    await clear_console();

    await new Promise(y => setTimeout(y, 2000));
    await page.screenshot({path: `./src/screenshoot/chat-${form.username}.png`, fullPage: true});
    signale.success('\n', {
        "msg": 'Capture Inbox Success',
        "img_path": `./src/screenshoot/chat-${form.username}.png`
    })
}

exports.get_inbox = async (page) => {
    await clear_console()
    const run = ora(`${chalk.greenBright('Processing...')}`).start();
    await page.goto('https://www.instagram.com/direct/inbox/', { waitUntil: "networkidle0" });

    try {
        const CloseModal = await page.$x(selector.auto_reply.closeModal);
        await CloseModal[0].click();
    } catch (err) {
        log('new message 0')
    }
    await run.stop();
    const msgList = await page.$$eval('#react-root > section > div.IEL5I > div > div > div.N9abW > div a[href]', urls => urls.map(url => url.innerText))

    let result = await msgList.map(item => {
        return {
            user: item.split('\n')[0],
            last_msg: item.split('\n')[1]
        }
    })

    log(result, '\n')
}

exports.get_user_posts = async (page) => {
    await clear_console()
    const { username } = await prompts(
        {
            type: 'text',
            name: 'username',
            message: 'Input username : '
        },
    )

    const getPosts = ora(`Scrap ${chalk.greenBright(`User ${username} posts..`)}`).start();
    await page.goto(`https://instagram.com/${username}`, { waitUntil: "networkidle0" });

    try {
        const CloseModal = await page.$x(selector.profile.close_modal);
        await CloseModal[0].click();
    } catch (err) {
        log()
    }

    await new Promise(y => setTimeout(y, 1000));
    await autoScroll(page);

    try {
        const [noPost] = await page.$x(selector.user_get_post.no_post);
        let noPostText = await page.evaluate(name => name.innerText, noPost)

        log(noPostText)

        if(noPostText == 'No Posts Yet'){
            await getPosts.fail('No Post Found!')
            return
        }
    } catch {}
    
    try{
        const [private] = await page.$x(selector.user_get_post.private);
        let privateText = await page.evaluate(name => name.innerText, private) 

        if(privateText == 'This Account is Private') {
            await getPosts.fail('This Account is Private!')
            return
        }
    } catch {}

    const Images = await page.$$eval(selector.user_posts.image, imgs => imgs.map(img => img.getAttribute('src')));

    const UrlPost = await page.$$eval(selector.user_posts.url, urls => urls.map(url => `https://instagram.com/${url.getAttribute('href')}`));
    
    await fs.writeFileSync(`./src/user_post/${username}.json`,JSON.stringify({
        Images,
        UrlPost
    }, null, 4), 'utf8')

    await getPosts.succeed('Scrap Success!')
    
    log({
        "msg": 'Scrap User posts Success!',
        "path": `./src/user_post/${username}.json`
    })
}

exports.follow_user = async (page) => {
    const follow = () => {
        return new Promise(async (resolve, reject) => {
            await clear_console()
            const { username } = await prompts(
                {
                    type: 'text',
                    name: 'username',
                    message: 'Input username : '
                },
            )
            const run = ora(`${chalk.greenBright('Processing...')}`).start();
            await page.goto(`https://instagram.com/${username}`, { waitUntil: "networkidle0" });
            
            try {
                const [follow_btn] = await page.$x(selector.follow_user.follow_btn);
                await follow_btn.click()
            } catch{
                const [follow_btn] = await page.$x(selector.follow_user.follow_back);
                await follow_btn.click()
            }
            
            run.succeed(`Succes Followed ${username}!`)
    
            const quit = await prompts([
                {
                    type: 'confirm',
                    name: 'confirm',
                    message: 'Continue follow Other user? (Y/N)',
                }
            ]);
            
            if(quit.confirm){
                await clear_console();
                resolve(follow());
            } else {
                resolve()
            }
        })
    }

    await follow()
}


exports.unfollow_user = async (page) => {
    await clear_console()
    const run = ora(`${chalk.greenBright('Processing..')}`).start();
    await page.goto('https://instagram.com', { waitUntil: "networkidle0" });

    try {
        const CloseModal = await page.$x(selector.profile.close_modal);
        await CloseModal[0].click();
    } catch (error) {
        
    }

    await new Promise(y => setTimeout(y, 1000));
    const ProfileMenu = await page.$x(selector.profile.profileMenu);
    await ProfileMenu[0].click();
    await new Promise(y => setTimeout(y, 2000));

    const unfollFunc = () => {
        return new Promise(async (resolve, reject) => {
            await run.start()
            const [followerBtn] = await page.$x('//*[@id="react-root"]/section/main/div/header/section/ul/li[3]/a');
            await followerBtn.click();
            await new Promise(y => setTimeout(y, 2000));
            const lenFollow = await page.$$eval(selector.unfollow_user.unfollow_list, urls => urls.map(async url => url.innerText))

            await new Promise(y => setTimeout(y, 2000));
            await page.$$eval(selector.unfollow_user.unfollow_list, urls => urls.map(async url => {
                await url.click()
            }))
            
            await new Promise(y => setTimeout(y, 4000));
            await page.$$eval(selector.unfollow_user.unfoll_btn, urls => urls.map(async url => {
                await url.click()
            }))

            await new Promise(y => setTimeout(y, 2000));
            run.succeed(`Complete Unfollow ${lenFollow.length} User`)
            await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });

            const quit = await prompts([
                {
                    type: 'confirm',
                    name: 'confirm',
                    message: 'Continue Unfollow user? (Y/N)',
                }
            ]);
            
            if(quit.confirm){
                await clear_console();
                resolve(unfollFunc());
            } else {
                resolve()
            }
        })
    }

    await unfollFunc()
}