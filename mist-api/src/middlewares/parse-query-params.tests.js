'use strict';

// Local
const errors = require('../lib/errors');
const parseQueryParamsFn = require('./parse-query-params');

const mockApp = {
  get: () => errors,
};

describe('middleware: parseQueryParams', () => {
  let parseQueryParams = null;
  let signature;
  beforeEach(() => {
    parseQueryParams = parseQueryParamsFn(mockApp);
    signature = {
      defaultValue: 5,
      hint: 'hint',
      isValid: (value) => true,
      paramName: 'paramName',
      transform: () => {},
    };
  });

  afterEach(() => {
    parseQueryParams = null;
    signature = null;
  });

  describe('signature errors', () => {
    it('throws error if signatures is not an array', () => {
      expect(() => {
        parseQueryParams();
      }).throw();
    });

    it('throws an error if signature is not an object', () => {
      const valuesThatShouldThrow = [
        null,
        undefined,
        [],
        45,
        'string',
      ];
      valuesThatShouldThrow.forEach((value) => {
        expect(() => {
          parseQueryParams([value]);
        }).throw();
      });
    });

    it('throws if hint is not a string', () => {
      expect(() => {
        signature.hint = [];
        parseQueryParams([signature]);
      }).throw();
    });

    it('throws if isValid is not a function', () => {
      expect(() => {
        signature.isValid = {};
        parseQueryParams([signature]);
      }).throw();
    });

    it('throws if paramName is not present', () => {
      expect(() => {
        delete signature.paramName;
        parseQueryParams([signature]);
      }).throw();
    });

    it('throws if paramName is not a string', () => {
      expect(() => {
        signature.paramName = {};
        parseQueryParams([signature]);
      }).throw();
    });

    it('throws if paramName has leading whitespace', () => {
      expect(() => {
        signature.paramName = ' paramName';
        parseQueryParams([signature]);
      }).throw();
    });

    it('throws if paramName has trailing whitespace', () => {
      expect(() => {
        signature.paramName = 'paramName ';
        parseQueryParams([signature]);
      }).throw();
    });

    it('throws if paramName is empty', () => {
      expect(() => {
        signature.paramName = '';
        parseQueryParams([signature]);
      }).throw();
    });

    it('throws if transform is not a function', () => {
      expect(() => {
        signature.transform = {};
        parseQueryParams([signature]);
      }).throw();
    });
  });

  describe('middleware processing', () => {
    let req;
    let res;
    let next;
    beforeEach(() => {
      req = {
        query: {},
      };
      res = {
        locals: {},
      };
      next = sinon.spy();
    });

    afterEach(() => {
      req = null;
      res = null;
      next = null;
    });

    it('calls next without error if no signatures are defined', () => {
      const signatures = [];
      const middleware = parseQueryParams(signatures);
      middleware(req, res, next);
      expect(next.calledWith(undefined)).true;
    });

    it('assigns default value to res.locals.cleanQuery if param is not in query and signature has defined default value', () => {
      signature.paramName = 'paramName';
      signature.defaultValue = 10;
      const signatures = [signature];
      const middleware = parseQueryParams(signatures);
      middleware(req, res, next);
      expect(res.locals.cleanQuery[signature.paramName]).equal(signature.defaultValue);
      expect(next.calledWith(undefined)).true;
    });

    it('does not assign default value to res.locals.cleanQuery if param is not in query and signature does not have default value', () => {
      signature.paramName = 'paramName';
      delete signature.defaultValue;
      const signatures = [signature];
      const middleware = parseQueryParams(signatures);
      middleware(req, res, next);
      expect(Reflect.has(res.locals.cleanQuery, signature.paramName)).false;
      expect(next.calledWith(undefined)).true;
    });

    it('calls next without error if param is not in query and signature.isValid returns false', () => {
      signature.isValid = () => false;
      const signatures = [signature];
      const middleware = parseQueryParams(signatures);
      middleware(req, res, next);
      expect(next.calledWith(undefined)).true;
    });

    it('calls next with BadRequestError if param is in query and signature.isValid returns false', () => {
      signature.isValid = () => false;
      sinon.spy(signature, 'isValid');
      req.query[signature.paramName] = 'fake bad value';
      const signatures = [signature];
      const middleware = parseQueryParams(signatures);
      middleware(req, res, next);
      expect(signature.isValid.calledWith('fake bad value')).true;
      expect(next.calledOnce).true;
      const error = next.getCall(0).args[0];
      expect(error).instanceof(errors.BadRequestError);
      expect(error.errors[0].message).equal(signature.hint);
    });

    it('applies transform to param value', () => {
      req.query[signature.paramName] = 'fake value';
      signature.transform = (value) => value.toUpperCase();
      sinon.spy(signature, 'transform');
      const signatures = [signature];
      const middleware = parseQueryParams(signatures);
      middleware(req, res, next);
      expect(signature.transform.calledWith('fake value')).true;
      expect(res.locals.cleanQuery[signature.paramName]).equal('FAKE VALUE');
      expect(next.calledWith(undefined)).true;
    });

    describe('multiple signatures', () => {
      let signature1;
      let signature2;
      let signatures;
      beforeEach(() => {
        signature1 = {
          defaultValue: 'biowonks',
          hint: 'who are we?',
          isValid: (value) => value === 'coli',
          paramName: 'name',
          transform: (value) => value.toUpperCase(),
        };
        signature2 = {
          hint: 'hint2',
          isValid: (value) => /^\d+$/.test(value),
          paramName: 'num',
          transform: parseInt,
        };

        signatures = [
          signature1,
          signature2,
        ];
      });

      afterEach(() => {
        signature1 = null;
        signature2 = null;
        signatures = [];
      });

      it('calls next without error when query is empty', () => {
        const middleware = parseQueryParams(signatures);
        middleware(req, res, next);
        expect(next.calledWith(undefined)).true;
        expect(res.locals.cleanQuery).eql({name: 'biowonks'});
      });

      it('calls next without error when query contains valid values', () => {
        req.query.name = 'coli';
        req.query.num = '7';
        const middleware = parseQueryParams(signatures);
        middleware(req, res, next);
        expect(next.calledWith(undefined)).true;
        expect(res.locals.cleanQuery).eql({name: 'COLI', num: 7});
      });

      it('calls next with error if one parameter fails', () => {
        req.query.num = 'coli';
        const middleware = parseQueryParams(signatures);
        middleware(req, res, next);
        expect(next.calledOnce).true;
        const error = next.getCall(0).args[0];
        expect(error).instanceof(errors.BadRequestError);
        expect(error.errors.length).equal(1);
        expect(error.errors[0].path).equal('num');
      });

      it('calls next with error multiple parameter errors', () => {
        req.query.name = 'bad name';
        req.query.num = 'coli';
        const middleware = parseQueryParams(signatures);
        middleware(req, res, next);
        expect(next.calledOnce).true;
        const error = next.getCall(0).args[0];
        expect(error).instanceof(errors.BadRequestError);
        expect(error.errors.length).equal(2);
        const paths = error.errors.map((x) => x.path);
        expect(paths).members(['name', 'num']);
      });
    }); // End multiple signatures
  }); // End middleware processing
});
