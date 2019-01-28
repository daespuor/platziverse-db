'use strict'

const setupDatabase = require('../lib/db')
const Sequelize = require('Sequelize')

module.exports = function setupMetricType (config) {
  const sequelize = setupDatabase(config)
  return sequelize.define('type', {
    value: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    }
  })
}
