'use strict';

module.exports = function(Sequelize, models, extras) {
  const fields = {
    hostname: {
      type: Sequelize.TEXT,
    },
    process_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
        isInt: true,
      },
    },
    public_ip: {
      type: Sequelize.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        isIP: true,
      },
    },
    active: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      validate: {
        notEmpty: true,
      },
    },
    normal_exit: {
      type: Sequelize.BOOLEAN,
    },
    message: {
      type: Sequelize.TEXT,
    },
    error_message: {
      type: Sequelize.TEXT,
    },
    job: {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: {},
      validate: {
        notEmpty: true,
      },
    },
  };

  return {
    fields,
  };
};
