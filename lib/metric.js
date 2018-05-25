'use strict'

module.exports = function setupMetric (MetricModel, AgentModel) {
  async function create (uuid, metric) {
    let agent = await AgentModel.findOne({
      where: {
        uuid
      }
    })
    if (agent) {
      const single = await MetricModel.create(Object.assign(metric, {agentId: agent.id}))
      return single.toJSON()
    }
  }
  function findByAgentUuid (uuid) {
    return MetricModel.findAll({
      attributes: ['type'],
      group: ['type'],
      include: [{
        model: AgentModel,
        attributes: [],
        where: {
          uuid
        }
      }],
      raw: true
    })
  }

  function findByTypeAgentUuid (type, uuid) {
    return MetricModel.findAll({
      attributes: ['id', 'type', 'value', 'createdAt', 'updatedAt'],
      include: [{
        model: AgentModel,
        attributes: [],
        where: {
          uuid
        }
      }],
      where: {
        type
      },
      raw: true
    })
  }
  return {
    create,
    findByAgentUuid,
    findByTypeAgentUuid
  }
}
