 /*
 * Copyright (C) 2015 Marcin Bychawski
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the BSD license.  See the LICENSE file for details.
 */
(function() {
    ///////////////////////////////////////////////////////////////////
    /// BLAST MAIN
    ///////////////////////////////////////////////////////////////////
    window.blast = {
        L           : null,
        T           : null,
        C           : null,
        matrix      : null,
        querySeq    : null,
        seqBase     : [],

        words         : null,
        rejectedWords : null,

        stepsInfo : {},

        lastStage : 0,

        init : function() {
            this.loadDefault();
        },

        loadDefault : function( what ) {
            var self = this;

            if( what == 'params' || !what ) {
                this.L = defaultData.L;
                this.T = defaultData.T;
                this.C = defaultData.C;
            }
            if( what == 'matrix' || !what ) {
                this.matrix = defaultData.matrix;
            }
            if( what == 'seqBase' || !what ) {
                this.seqBase = [];
                defaultData.seqBase.forEach( function( seq ) {
                    self.seqBase.push( new Sequence( seq ) );
                });
                this.querySeq = new Sequence( defaultData.querySeq );
            }

            this.lastStage = 0;
        },

        randomQuerySeq : function( length ) {
            var newSeq = generateRandomSeq( length );
            this.querySeq.str = newSeq;
            this.lastStage = 0;
            return newSeq;
        },

        addRandomSeqToDB : function( length, count) {
            var ret = [];
            for( var i = 0; i < count; i++ ) {
                var newSeq = new Sequence( generateRandomSeq( length ) );
                ret.push( newSeq );
                this.seqBase.push( newSeq );
            }
            this.lastStage = 0;
            return ret;
        },

        removeSeq : function( seqId ) {
            this.seqBase = _.reject(this.seqBase, function(seq) { return seq.id == seqId; });
            this.lastStage = 0;
        },

        update : function( values ) {
            var self = this;

            this.L      = values.L || this.L;
            this.T      = values.T || this.T;
            this.C      = values.C || this.C;
            this.matrix = values.matrix || this.matrix;

            this.querySeq.str = values.querySeq;

            _.each( values.seqBase, function(value, key) {
                _.findWhere( self.seqBase, {id: +key} ).str = value;
            });

            this.lastStage = 0;
        },

        s1Init : function() {
            wordGlobalId = 0;
            this.words = this.querySeq.splitIntoWords( this.L );
        },

        s2RateWords : function() {
            var self = this;

            _.each( this.words, function( word ) {
                word.rate();
            });

        },

        s3Search : function() {
            var self = this;

            this.rejectedWords = [];
            this.words = _.filter( this.words, function( word ) {
                if( word.rejected ) {
                    self.rejectedWords.push( word );
                    return false;
                }
                return true;
            });


            _.each(this.words, function( word ) {
                word.findMatches( self.seqBase );
            });
        },

        s4Extend : function() {
            var self = this;
            this.words = _.filter( this.words, function( word ) {
                if( word.matches.length == 0 ) {
                    self.rejectedWords.push( word );
                    return false;
                }
                return true;
            });

            _.each( this.words, function( word ) {
                word.extend();
            });
        },

        runStage : function( stageNo ) {
            if( this.lastStage >= stageNo )
                return false;

            for( var i = this.lastStage; i < stageNo; i++ ) {
                this.lastStage = i + 1;
                switch ( i ) {
                    case 0 : this.s1Init(); break;
                    case 1 : this.s2RateWords(); break;
                    case 2 : this.s3Search(); break;
                    case 3 : this.s4Extend(); break;
                }
            }

            return true;
        }
    };

    _.extend(window.blast, Backbone.Events);

    ///////////////////////////////////////////////////////////////////
    /// WORD
    ///////////////////////////////////////////////////////////////////
    var wordGlobalId = 0;
    Word = function( wordStr, inSeqPosition ) {
        this.id = wordGlobalId++;
        this.str            = wordStr;
        this.inSeqPosition  = inSeqPosition;
        this.matches        = [];
        this.rating         = 0;
        this.ratingArr      = [];
        this.rejected       = false;
    };
    var uniqueMatchId = 0;
    Word.prototype = {
        findMatches : function( seqBase ) {
            var self = this;

            _.each(seqBase, function( seq ) {
                var startIndex = 0,
                    index,
                    len = self.str.length;

                while( (index = seq.str.indexOf( self.str, startIndex )) > -1 ) {

                    self.matches.push({
                        id : uniqueMatchId++,
                        sequence: seq,
                        position: index
                    });

                    seq.pushMatch({
                        word: self,
                        position: index
                    });

                    startIndex = index + len;
                }
            });
        },

        rate : function() {
            var steps = [];
            this.rating = 0;

            for( var i = 0; i < this.str.length; i++ ) {
                var index = utils.ntoi( this.str[ i ] );
                this.rating += blast.matrix[index][index];
                this.ratingArr.push( blast.matrix[index][index] );
            }

            if( this.rating < blast.T )
                this.rejected = true;
        },

        extend : function() {
            var self = this;
            _.each( this.matches, function( match ) {
                match.extendResult = [];
                match.extendSteps  = [];
                var seq  = match.sequence.str,
                    qSeq = blast.querySeq.str,
                    iSeq = match.position     + blast.L - 1,
                    iQSeq= self.inSeqPosition + blast.L - 1;

                match.extendResult[ iSeq ] = self.rating;

                 iSeq++;
                iQSeq++;

                for(;iSeq < seq.length && iQSeq < qSeq.length; iSeq++, iQSeq++ ) {
                    var seqChar  =  seq[  iSeq ],
                        qSeqChar = qSeq[ iQSeq ],
                        value = blast.matrix[ utils.ntoi(seqChar) ][ utils.ntoi(qSeqChar) ];
                    match.extendSteps[ iSeq ] = [seqChar, qSeqChar];
                    match.extendResult[ iSeq ] = match.extendResult[ iSeq - 1 ] + value;
                }

                iSeq  = match.position;
                iQSeq = self.inSeqPosition;

                match.extendResult[ iSeq ] = self.rating;

                 iSeq--;
                iQSeq--;

                for(;iSeq >= 0 && iQSeq >= 0; iSeq--, iQSeq-- ) {
                    var seqChar  =  seq[  iSeq ],
                        qSeqChar = qSeq[ iQSeq ],
                        value = blast.matrix[ utils.ntoi(seqChar) ][ utils.ntoi(qSeqChar) ];
                    match.extendSteps[ iSeq ] = [seqChar, qSeqChar];
                    match.extendResult[ iSeq ] = match.extendResult[ iSeq + 1 ] + value;
                }

                match.extendMaxRating = _.max( match.extendResult );
            });
        }
    };

    ///////////////////////////////////////////////////////////////////
    /// SEQUENCE
    ///////////////////////////////////////////////////////////////////
    var sequenceGlobalId = 0;
    Sequence = function( sequenceStr ) {
        this.id = sequenceGlobalId++;
        this.str        = sequenceStr;
        this.matches    = [];
    };

    Sequence.prototype = {
        splitIntoWords : function( L ) {
            var words = [];
            for(var i = 0; i <= this.str.length - L; i++) {
                words.push( new Word( this.str.substr(i, L), i ) );
            }

            return words;
        },

        pushMatch : function( match ) {
            this.matches.push( match );
        }
    };

    /////////////////////////////////////////////////////////////////
    /// HELPERS
    /////////////////////////////////////////////////////////////////
    function generateRandomSeq( length ) {
        var ret = '';
        for( var i = 0; i < length; i++ ){
            ret += utils.iton( Math.floor(Math.random() * 4) );
        }
        return ret;
    }

    var defaultData = {
        L : 7,
        T : 63,
        C : 160,
        matrix : [ // A C G T
            [ 10, -1, -3, -4],
            [ -1,  7, -5, -3],
            [ -3, -5,  9,  0],
            [ -4, -3,  0,  8]
        ],

        querySeq : "AAATATAGCCAGAGATAGCA",
        seqBase: [
            "AGAGAGAAATATGCGACGAAATATAGCCA",
            "AGCAGCACGGCCAGAGATAGAATATACAC",
            "AATATACAAATATAGCCAGAGATAGCAAA",
            "AATAAACAAATATAGGGAGAGATAGCAAA",
            "AATATACAAACATAGCCAAAGGAAGCAAA",
            "AATATACCATAGCCAAAGGAAGCAAACAG",
        ]
    };

    blast.init();
})();