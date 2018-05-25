'use strict'

const db = require('../')
const debug = require('debug')('platziverse:db:example')
const chalk = require('chalk')

async function run () {
  const config = {
    database: process.env.DB_NAME || 'platziverse',
    username: process.env.DB_USER || 'platzi',
    password: process.env.DB_PASS || 'platzi',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: s => debug(s),
    operatorsAliases: false
  }

  let {Agent, Metric} = await db(config).catch(handleError)
  let newAgent = await Agent.createOrUpdate({
    uuid: 'xxx',
    username: 'Test',
    name: 'test',
    hostname: 'test',
    pid: 1,
    connected: true
  }).catch(handleError)

  let newMetric = await Metric.create(newAgent.uuid, {
    type: 'memory',
    value: '15%'
  }).catch(handleError)
  let newMetric2 = await Metric.create(newAgent.uuid, {
    type: 'cpu',
    value: '30%'
  }).catch(handleError)

  let agents = await Agent.findAll().catch(handleError)
  let metrics = await Metric.findByTypeAgentUuid('memory', newAgent.uuid).catch(handleError)

  console.log(newAgent)
  console.log(newMetric)
  console.log(newMetric2)
  console.log(agents)
  console.log(metrics)

  process.exit(0)
}

function handleError (error) {
  console.error(`${chalk.red('[fatal]')}- ${error.message}`)
  console.error(error.stack)
  process.exit(1)
}

run()
