/* eslint-disable no-unused-expressions */

'use strict';

var expect = require('chai').expect,
	sinon = require('sinon');

var AnalyticsService = require('./analytics-service');

describe('Analytics Service', function() {
	var mockGaTrackingId = 'UA-1234-3',
		baseUrl = 'http://test-analytics/beacons',
		beaconBaseUrlWithTid = baseUrl + '/' + mockGaTrackingId,

		analyticsService = new AnalyticsService(mockGaTrackingId, {
			beaconBaseUrl: baseUrl
		});

	it('constructor should work',
	function() {
		expect(function() {
			var x = new AnalyticsService();
			expect(x.trackingId()).empty;
		}).not.throw;

		expect(function() {
			var x = new AnalyticsService(mockGaTrackingId);
			expect(x.trackingId()).equal(mockGaTrackingId);
		}).not.throw;
	});

	describe('beaconEventUrl', function() {
		it('Supplying empty value for category should throw error',
		function() {
			expect(function() {
				analyticsService.beaconEventUrl('');
			}).throw(Error);
		});

		it('Supplying no value for action should throw error',
		function() {
			expect(function() {
				analyticsService.beaconEventUrl('category');
			}).throw(Error);
		});

		it('Supplying empty value for action should throw error',
		function() {
			expect(function() {
				analyticsService.beaconEventUrl('category', '');
			}).throw(Error);
		});

		it('Valid category and action should work',
		function() {
			expect(analyticsService.beaconEventUrl('emails', 'opened'))
			.equal(beaconBaseUrlWithTid + '?c=emails&a=opened');
		});

		it('Valid category, action, and numeric userId',
		function() {
			expect(analyticsService.beaconEventUrl('emails', 'opened', null, null, 123))
			.equal(beaconBaseUrlWithTid + '?c=emails&a=opened&u=123');
		});

		it('Valid category, action, and string userId',
		function() {
			expect(analyticsService.beaconEventUrl('emails', 'opened', null, null, 'bob'))
			.equal(beaconBaseUrlWithTid + '?c=emails&a=opened&u=bob');
		});

		it('Valid category, action, label, userId',
		function() {
			expect(analyticsService.beaconEventUrl('emails', 'opened', 'invite', null, 'bob'))
			.equal(beaconBaseUrlWithTid + '?c=emails&a=opened&l=invite&u=bob');
		});

		it('Valid category, action, label, value, userId',
		function() {
			expect(analyticsService.beaconEventUrl('emails', 'opened', 'invite', 3, 'bob'))
			.equal(beaconBaseUrlWithTid + '?c=emails&a=opened&l=invite&v=3&u=bob');
		});

		it('Valid category, action, empty label, value, userId',
		function() {
			expect(analyticsService.beaconEventUrl('emails', 'opened', null, 5, 'bob'))
			.equal(beaconBaseUrlWithTid + '?c=emails&a=opened&v=5&u=bob');
		});

		it('Non-digit value should not work',
		function() {
			expect(function() {
				analyticsService.beaconEventUrl('emails', 'opened', null, '3abc');
			}).throw(Error);
		});

		it('Should return nothing if no tracking id defined',
		function() {
			var x = new AnalyticsService();
			expect(x.beaconEventUrl('users', 'registered')).empty;
		});

		it('Should return nothing if no beaconBaseUrl is defined',
		function() {
			var x = new AnalyticsService('UA-98765-3');
			expect(x.beaconEventUrl('users', 'registered')).empty;
		});
	});

	describe('sendEvent', function() {
		it('should throw error if missing category',
		function() {
			expect(function() {
				analyticsService.sendEvent();
			}).throw(Error);
		});

		it('should throw error if empty category',
		function() {
			expect(function() {
				analyticsService.sendEvent('');
			}).throw(Error);
		});

		it('should throw error if missing action',
		function() {
			expect(function() {
				analyticsService.sendEvent('survey');
			}).throw(Error);
		});

		it('should throw error if empty action',
		function() {
			expect(function() {
				analyticsService.sendEvent('survey', '');
			}).throw(Error);
		});

		it('should throw error if invalid value',
		function() {
			expect(function() {
				analyticsService.sendEvent('survey', 'action', null, 'string');
			}).throw(Error);
		});
	});

	describe('sendEvent (stubbed visitor, null tracking id)',
	function() {
		var visitor = analyticsService.visitor(),
			eventStub,
			sendStub;

		beforeEach(function() {
			analyticsService.setTrackingId(null);
			eventStub = sinon.stub(visitor, 'event');
			sendStub = sinon.stub(visitor, 'send');
		});

		afterEach(function() {
			analyticsService.setTrackingId(mockGaTrackingId);
			eventStub.restore();
			sendStub.restore();
		});

		it('should not call event or send if null tracking id',
		function() {
			analyticsService.sendEvent('clients', 'test action');
			expect(eventStub.callCount).equal(0);
			expect(sendStub.callCount).equal(0);
		});
	});

	describe('sendEvent (stubbed visitor)', function() {
		var visitor = analyticsService.visitor(),
			eventStub,
			sendStub;

		beforeEach(function() {
			eventStub = sinon.stub(visitor, 'event');
			sendStub = sinon.stub(visitor, 'send');
		});

		afterEach(function() {
			eventStub.restore();
			sendStub.restore();
		});

		it('valid category and action should work',
		function() {
			analyticsService.sendEvent('clients', 'logged in');

			expect(eventStub.calledOnce).true;
			expect(sendStub.calledOnce).true;
			expect(eventStub.calledBefore(sendStub)).true;

			var eventArgs = eventStub.args[0];
			expect(eventArgs[0]).equal('clients');
			expect(eventArgs[1]).equal('logged in');
			expect(eventArgs[2]).undefined;
			expect(eventArgs[3]).undefined;
			expect(eventArgs[4]).undefined;
		});

		it('valid category, action, label should work',
		function() {
			analyticsService.sendEvent('clients', 'logged in', 'anonymous');

			expect(eventStub.calledOnce).true;
			expect(sendStub.calledOnce).true;
			expect(eventStub.calledBefore(sendStub)).true;

			var eventArgs = eventStub.args[0];
			expect(eventArgs[0]).equal('clients');
			expect(eventArgs[1]).equal('logged in');
			expect(eventArgs[2]).equal('anonymous');
			expect(eventArgs[3]).undefined;
			expect(eventArgs[4]).undefined;
		});

		it('valid category, action, label, value should work',
		function() {
			analyticsService.sendEvent('clients', 'logged in', 'anonymous', 10);

			expect(eventStub.calledOnce).true;
			expect(sendStub.calledOnce).true;
			expect(eventStub.calledBefore(sendStub)).true;

			var eventArgs = eventStub.args[0];
			expect(eventArgs[0]).equal('clients');
			expect(eventArgs[1]).equal('logged in');
			expect(eventArgs[2]).equal('anonymous');
			expect(eventArgs[3]).equal(10);
			expect(eventArgs[4]).undefined;
		});

		it('valid category, action, label, value, userId should work',
		function() {
			analyticsService.sendEvent('clients', 'logged in', 'anonymous', 10, 'abcdef');

			expect(eventStub.calledOnce).true;
			expect(sendStub.calledOnce).true;
			expect(eventStub.calledBefore(sendStub)).true;

			var eventArgs = eventStub.args[0];
			expect(eventArgs[0]).equal('clients');
			expect(eventArgs[1]).equal('logged in');
			expect(eventArgs[2]).equal('anonymous');
			expect(eventArgs[3]).equal(10);
			expect(eventArgs[4]).a('object');
			expect(eventArgs[4]).hasOwnProperty('uid');
			expect(eventArgs[4].uid).equal('abcdef');
		});
	});

	describe('sendEventTo', function() {
		it('sendEventTo invalid tracking id should fail',
		function() {
			var originalTrackingId = analyticsService.trackingId();

			expect(function() {
				analyticsService.sendEventTo('bad-tracking-id');
			}).throw(Error);

			expect(analyticsService.trackingId()).equal(originalTrackingId);
		});
	});
});
