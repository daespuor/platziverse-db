'use strict'

let single = {
  id: 1,
  agentId: 1,
  type: 'CPU',
  value: '70%',
  createdAt: new Date(),
  updatedAt: new Date()
}
function extend (obj, values) {
  let m = Object.assign({}, obj)
  return Object.assign(m, values)
}
let newMetric = {
  id: 5,
  type: 'ancho banda',
  value: '25%',
  createdAt: new Date(),
  updatedAt: new Date()
}
let metrics = [
  single,
  extend(single, {id: 2, agentId: 2, type: 'wifi', value: '30%'}),
  extend(single, {id: 3, agentId: 2, value: '30%'}),
  extend(single, {id: 4, agentId: 3, type: 'ancho banda', value: '50%'})
]
module.exports = {
  single,
  all: metrics,
  newMetric,
  findByAgentId: a => metrics.filter(m => m.agentId === a),
  findByTypeAgentId: (t, id) => metrics.filter(m => m.agentId === id && m.type === t)
}
