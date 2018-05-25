'use strict'

const db = require('./')
const debug = require('debug')('platziverse:db:setup')
const inquirer = require('inquirer')
const chalk = require('chalk')
const prompt = inquirer.createPromptModule()
async function setup () {
  if (process.argv[2] !== '--yes') {
    const answer = await prompt([
      {
        type: 'confirm',
        name: 'setup',
        message: 'This will destroy your database ¿Are you sure?'
      }
    ])

    if (!answer.setup) {
      return console.log('Nothing happened :)!!')
    }
  }
  const config = {
    database: process.env.DB_NAME || 'platziverse',
    username: process.env.DB_USER || 'platzi',
    password: process.env.DB_PASS || 'platzi',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: s => debug(s),
    setup: true,
    operatorsAliases: false
  }

  await db(config).catch(handleFatalError)

  console.log('Success!')
  process.exit(0)
}

function handleFatalError (err) {
  console.error(`${chalk.red('[fatal error]')} - ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

setup()
