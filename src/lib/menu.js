// ------------CLI----------------
const prompts = require('prompts');
const signale = require('signale')
const envinfo = require('envinfo')
const figlet = require('figlet');
const chalk = require('chalk');
// ------------====----------------
const log = console.log

exports.menu = async () => {
    log(
        chalk.bold.blueBright(
            figlet.textSync('IG-RUN!', {
                font: 'Modular',
                horizontalLayout: 'default',
                verticalLayout: 'default',
                width: 100,
                whitespaceBreak: true
            })
        )
    );
    log(chalk.blueBright("=".repeat(55)))
    log(chalk`
        {green #1}: {yellow Auto reply}
        {green #2}: {yellow Send Message}
        {green #3}: {yellow Get Profile Detail}
        {green #4}: {yellow Get Post}
        {green #5}: {yellow Edit Profile}
        {green #6}: {yellow Capture Message}
        {green #7}: {yellow Get Inbox List}
        {green #8}: {yellow Get user post}
        {green #9}: {yellow Follow User}
        {green #10}: {yellow Unfollow My followers}
        {green #11}: {yellow Exit}
    `);

    const select = await prompts({
        type: 'number',
        name: 'select',
        message: 'Select Instagram bot > [ex: 1 ↵]',
        validate: (value) => value > 11 ? false : true,
        choices: [1, 2, 3, 4, 5, 6, 7, 8, 9 , 10, 11]
    })

    return select
}