'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const metricFixiture = require('./fixitures/metric')
const agentFixiture = require('./fixitures/agent')

let sandbox = null
let db = null
let config = {
  logging: () => {}
}
let AgentStub = null
let MetricStub = null
let newMetric = Object.assign({}, metricFixiture.newMetric)
let singleAgent = Object.assign({}, agentFixiture.single)
let uuid = singleAgent.uuid
let condFind = {
  where: {
    uuid
  }
}
let condAgentUuid = null
let condTypeAgentUuid = null
let type = metricFixiture.single.type

test.beforeEach(async t => {
  sandbox = sinon.createSandbox()
  AgentStub = {
    hasMany: sandbox.spy(),
    findOne: sandbox.stub()
  }
  MetricStub = {
    belongsTo: sandbox.spy(),
    create: sandbox.stub(),
    findAll: sandbox.stub()
  }
  condAgentUuid = {
    attributes: ['type'],
    group: ['type'],
    include: [{
      model: AgentStub,
      attributes: [],
      where: {
        uuid
      }
    }],
    raw: true
  }
  condTypeAgentUuid = {
    attributes: ['id', 'type', 'value', 'createdAt', 'updatedAt'],
    include: [{
      model: AgentStub,
      attributes: [],
      where: {
        uuid
      }
    }],
    where: {
      type
    },
    raw: true
  }
  // Agent Model
  AgentStub.findOne.withArgs(condFind).returns(agentFixiture.single)

  // Metric Model
  MetricStub.create.withArgs(Object.assign(newMetric, {agentId: singleAgent.id})).returns({
    toJSON: () => metricFixiture.newMetric
  })
  MetricStub.findAll.withArgs(condAgentUuid).returns(metricFixiture.findByAgentId(agentFixiture.findByUuid(uuid).id))
  MetricStub.findAll.withArgs(condTypeAgentUuid).returns(metricFixiture.findByTypeAgentId(type, agentFixiture.findByUuid(uuid).id))

  let setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })
  db = await setupDatabase(config)
})

test.afterEach(t => {
  if (sandbox) sandbox.restore()
})

test('Metric exist?', t => {
  t.truthy(db.Metric, 'Metric should be exist!')
})

test.serial('Metric#setup', t => {
  t.true(MetricStub.belongsTo.called, 'BelongsTo should be called')
  t.true(MetricStub.belongsTo.calledOnce, 'BelongsTo should be calledOnce')
  t.true(MetricStub.belongsTo.calledWith(AgentStub), 'BelongsTo should be called with Agent')
  t.true(AgentStub.hasMany.called, 'HasMany should be called')
  t.true(AgentStub.hasMany.calledOnce, 'HasMany should be calledOnce')
  t.true(AgentStub.hasMany.calledWith(MetricStub), 'HasMany should be called with Metrics')
})

test.serial('Metric#create', async t => {
  let metricDB = await db.Metric.create(uuid, newMetric)
  t.true(AgentStub.findOne.calledOnce, 'FindOne should be called once')
  t.true(AgentStub.findOne.calledWith(condFind), 'FindOne should be called with condFind')
  t.true(MetricStub.create.calledOnce, 'Create should be called once')
  t.true(MetricStub.create.calledWith(Object.assign(newMetric, {agentId: singleAgent.id})), 'Create should be called with newMetric')
  t.deepEqual(metricDB, metricFixiture.newMetric, 'Objects should be equals')
})

test.serial('Metric#findByAgentUuid', async t => {
  let metricsDB = await db.Metric.findByAgentUuid(uuid)
  let metricFix = metricFixiture.findByAgentId(agentFixiture.findByUuid(uuid).id)

  t.true(MetricStub.findAll.calledOnce, 'FindAll should be called once')
  t.true(MetricStub.findAll.calledWith(condAgentUuid), 'FindAll should be called with condAgentUuid')
  t.is(metricFix.length, metricsDB.length, 'Objects should be the same length')
  t.deepEqual(metricsDB, metricFix, 'Objects should be the same')
})

test.serial('Metric#findByTypeAgentUuid', async t => {
  let metricsDB = await db.Metric.findByTypeAgentUuid(type, uuid)
  let metricFix = metricFixiture.findByTypeAgentId(type, agentFixiture.findByUuid(uuid).id)

  t.true(MetricStub.findAll.calledOnce, 'FindAll should be called once')
  t.true(MetricStub.findAll.calledWith(condTypeAgentUuid), 'FindAll should be called with condTypeAgentUuid')
  t.is(metricFix.length, metricsDB.length, 'Objects should be the same length')
  t.deepEqual(metricsDB, metricFix, 'Objects should be the same')
})
