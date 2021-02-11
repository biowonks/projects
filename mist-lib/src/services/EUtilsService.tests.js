// Vendor
const nock = require('nock');

// Local
const EUtilsService = require('./EUtilsService');

describe('EUtilsService', () => {
  const basePath = 'https://facts.com';
  const uri = '/you-need-bacteria.html';
  const url = basePath + uri;
  let service;
  let clock;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
    service = new EUtilsService();
  });

  afterEach(() => {
    clock.restore();
    nock.cleanAll();
  });

  it('should return result if immediately successful', async () => {
    const response = 'ok';
    const urlNock = nock(basePath)
      .get(uri)
      .reply(200, response);

    const promise = service.fetch(url).then((result) => {
      expect(result).equal(response);
      urlNock.done();
    });

    clock.tick(500);

    return promise;
  });
});
