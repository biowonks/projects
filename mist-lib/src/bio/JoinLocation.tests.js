/* eslint-disable no-magic-numbers, no-new */
'use strict';

// Local
const JoinLocation = require('./JoinLocation'),
  ComplementLocation = require('./ComplementLocation'),
  Location = require('./Location'),
  LocationPoint = require('./LocationPoint'),
  Seq = require('core-lib/bio/Seq');

describe('JoinLocation', function() {
  describe('transcriptFrom', function() {
    let seq = new Seq('ATCGNXATCG'),
      //                 |   |    |
      //                 1   5    10
      circularSeq = new Seq(seq.sequence()).setCircular();

    describe('linear sequence', function() {
      it('1..3', function() {
        let location = new Location(new LocationPoint(1), new LocationPoint(3)),
          x = new JoinLocation([location]),
          result = x.transcriptFrom(seq);

        expect(result).instanceof(Seq);
        expect(result.sequence()).equal('ATC');
      });

      it('1..3,8..10', function() {
        let location1 = new Location(new LocationPoint(1), new LocationPoint(3)),
          location2 = new Location(new LocationPoint(8), new LocationPoint(10)),
          x = new JoinLocation([location1, location2]),
          result = x.transcriptFrom(seq);

        expect(result.sequence()).equal('ATCTCG');
      });

      it('1..2,complement(4..5),8..10', function() {
        let location1 = new Location(new LocationPoint(1), new LocationPoint(2)),
          location2 = new ComplementLocation(new Location(new LocationPoint(4), new LocationPoint(5))),
          location3 = new Location(new LocationPoint(8), new LocationPoint(10)),
          x = new JoinLocation([location1, location2, location3]),
          result = x.transcriptFrom(seq);

        expect(result.sequence()).equal('ATNCTCG');
      });

      it('(overlap) 1..3,2..4', function() {
        let location1 = new Location(new LocationPoint(1), new LocationPoint(3)),
          location2 = new Location(new LocationPoint(2), new LocationPoint(4)),
          x = new JoinLocation([location1, location2]),
          result = x.transcriptFrom(seq);

        expect(result.sequence()).equal('ATCTCG');
      });
    });

    describe('circular sequence', function() {
      it('complement(9..1),4..6', function() {
        let location1 = new ComplementLocation(new Location(new LocationPoint(9), new LocationPoint(1))),
          location2 = new Location(new LocationPoint(4), new LocationPoint(6)),
          x = new JoinLocation([location1, location2]),
          result = x.transcriptFrom(circularSeq);

        expect(result.sequence()).equal('TCGGNX');
      });
    });
  });
});
