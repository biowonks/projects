'use strict';

module.exports = function(Sequelize) {
  function accessionVersion() {
    return {
      type: Sequelize.TEXT,
      allowNull: true,
      validate: {
        notEmpty: true,
        is: /^\w+.*\.\d+$/,
      },
    };
  }

  function accessionWithoutVersion(notMsg = 'accession not permitted to include version suffix') {
    return {
      type: Sequelize.TEXT,
      allowNull: true,
      validate: {
        notEmpty: true,
        not: {
          args: /\.\d+$/,
          msg: notMsg,
        },
      },
    };
  }

  function arrayWithNoEmptyValues(type = Sequelize.TEXT) {
    return {
      // eslint-disable-next-line new-cap
      type: Sequelize.ARRAY(type),
      validate: {
        noEmptyValues: function(value) {
          if (!value)
            return value;

          if (!Array.isArray(value))
            throw new Error('Must be an array');

          for (let val of value) {
            if (!val || /^\s*$/.test(val))
              throw new Error('Each value must not be empty');
          }

          return value;
        },
      },
    };
  }

  function dnaStrand() {
    return {
      type: Sequelize.TEXT,
      validate: {
        isIn: [['+', '-']],
      },
    };
  }

  function requiredDnaStrand() {
    let result = dnaStrand();
    result.allowNull = false;
    return result;
  }

  function positiveInteger() {
    return {
      type: Sequelize.INTEGER,
      allowNull: true,
      validate: {
        notEmpty: true,
        isInt: true,
        min: 1,
      },
    };
  }

  function requiredAccessionWithoutVersion(notMsg) {
    let result = accessionWithoutVersion(notMsg);
    result.allowNull = false;
    return result;
  }

  function requiredAccessionVersion() {
    let result = accessionVersion();
    result.allowNull = false;
    return result;
  }

  function requiredBoolean() {
    return {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    };
  }

  function requiredPercentage() {
    return {
      type: Sequelize.REAL,
      allowNull: false,
      validate: {
        isFloat: true,
        min: 0,
        max: 100,
      },
    };
  }

  function requiredPositiveInteger() {
    let result = positiveInteger();
    result.allowNull = false;
    return result;
  }

  function requiredSequence() {
    return {
      type: Sequelize.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        is: /^[A-Z]+$/,
      },
    };
  }

  function requiredText() {
    return {
      type: Sequelize.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    };
  }

  function seqId() {
    return {
      type: Sequelize.TEXT,
      validate: {
        notEmpty: true,
        is: /^[A-Za-z0-9_-]{22}$/,
      },
    };
  }

  function aseqId() {
    let result = seqId();

    result.description = 'source agnostic, universal identifier derived from the amino acid sequence; foreign identifier to the associated Aseq';
    result.example = 'eALFsiVPvD8jtNe_9Qifig';

    return result;
  }

  function dseqId() {
    let result = seqId();

    result.description = 'source agnostic, universal identifier derived from the DNA sequence; foreign identifier to the associated Dseq';
    result.example = 'YyhYrg42MICY95Yv4msKNA';

    return result;
  }

  function requiredSeqId() {
    let result = seqId();
    result.allowNull = false;
    return result;
  }

  function requiredAseqId() {
    let result = aseqId();
    result.allowNull = false;
    return result;
  }

  function requiredDseqId() {
    let result = dseqId();
    result.allowNull = false;
    return result;
  }

  // ----------------------------------------------------
  let validate = {
    bothNullOrBothNotEmpty: function(field1, field2) {
      return function() {
        let value1 = this.get(field1), // eslint-disable-line no-invalid-this
          value2 = this.get(field2), // eslint-disable-line no-invalid-this
          value1Empty = !value1 || /^\s*$/.test(value1),
          value2Empty = !value2 || /^\s*$/.test(value2);

        if ((value1Empty && !value2Empty) || (!value1Empty && value2Empty))
          throw new Error(`Both ${field1} and ${field2} must be null or both must be not empty`);
      };
    },

    /**
		 * Checks that the length of targetField equals the value in lengthField
		 * @param {String} lengthField
		 * @param {String} targetField
		 * @returns {Function}
		 */
    referencedLength: function(lengthField, targetField) {
      return function() {
        let expectedLength = this.get(lengthField), // eslint-disable-line no-invalid-this
          targetValue = this.get(targetField); // eslint-disable-line no-invalid-this

        if (typeof targetValue !== 'string')
          throw new Error(`${targetField} is not a string`);

        if (targetValue.length !== expectedLength)
          throw new Error(`${targetField} length does not equal the length value in ${lengthField}`);
      };
    },
  };

  return {
    accessionVersion,
    accessionWithoutVersion,
    arrayWithNoEmptyValues,
    dnaStrand,
    requiredDnaStrand,
    requiredAccessionWithoutVersion,
    requiredBoolean,
    positiveInteger,
    seqId,
    aseqId,
    dseqId,
    requiredAccessionVersion,
    requiredPercentage,
    requiredPositiveInteger,
    requiredSequence,
    requiredSeqId,
    requiredAseqId,
    requiredDseqId,
    requiredText,

    validate,
  };
};
