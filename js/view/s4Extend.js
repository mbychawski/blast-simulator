 /*
 * Copyright (C) 2015 Marcin Bychawski
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the BSD license.  See the LICENSE file for details.
 */
window.Views = window.Views || {};
window.Views.S4Extend = (function() {
    'use strict';
    return Backbone.View.extend({
        tagName    : 'div',

        events : {
        },

        characterWidth : 20,
        matchesList : null,

        rendered : false,

        initialize : function(options) {
            var self = this;
            this.on('switchedOn', function() {
                if( blast.runStage(4) || !this.rendered ) {
                    self.render();
                    this.rendered = true;
                }
            });

            this.on('navButtonClick', function( id ) {
                switch ( id[0] ) {
                    case 'prev-stage-btn' : app.navigate('s3Search', {trigger: true});  break;
                    case 'reset-btn'      : this.render();                              break;
                    case 'next-btn'       : this.step();                                break;
                    case 'end-btn'        : this.goToEnd();                             break;
                    case 'next-stage-btn' : this.blastResult();  break;
                }
            });
        },

        render : function() {
            var self = this;

            this.$el.html( templates.s4Extend( blast ) );

            window.scrollTo(0,0);

            this.matchesList = this.$el.find('#matches-list');

            _.each(blast.words, function( word ) {
                self.matchesList.append("<h4>Słowo #" + word.id + "</h4>");
                _.each(word.matches, function( match ) {
                    self.appendMatchGroup( word, match );
                });
            });

            this.currentWord = 0;
            this.currentMatch = 0;
            this.currentSize = 0;
            this.matchGroupsToHide = [];
            this.currentRating = (function magic(arr){ arr.push('-'); if( arr.length == blast.L - 2 ) return arr.join(' '); else return magic(arr);})([]);

            return this;
        },

        highlightMatrix : function( char1, char2 ) {
            char1 = char1.toUpperCase();
            char2 = char2.toUpperCase();
            var cell = this.$el.find("[mtx-row=" + char1 + "][mtx-cell=" + char2 + "]");
            cell.velocity({backgroundColor : '#C0CAAD'}).velocity('reverse');
        },

        updateRating : function(word, match, ratingStr, step) {
            var $matchGroup = this.$el.find(".match-group[match-id=" + match.id + "]"),
                $rating = $matchGroup.find('.rating'),
                self = this,
                left = Math.max( match.position - step, match.position - word.inSeqPosition, 0);

                left *= this.characterWidth;

                $rating.text( ratingStr );
                $rating.blast();
                $rating.css( {left: left} );
        },

        currentWord  : 0,
        currentMatch : 0,
        currentSize  : 0,
        currentRating : '',
        step : function( ) {
            var self = this;
            if( this.currentWord < blast.words.length ) {
                var word = blast.words[ this.currentWord ];

                if( this.currentMatch < word.matches.length ) {
                    var match = word.matches[ this.currentMatch ];

                    var iL = match.position - this.currentSize,
                        iR = match.position + blast.L - 1 + this.currentSize;

                    if( this.currentSize == 0) {
                        this.currentRating = word.rating + ' ' + this.currentRating + ' ' + word.rating
                        this.updateRating(word, match, this.currentRating, this.currentSize);
                        this.animateWindow(word, match, this.currentSize);
                        this.currentSize++;
                    }
                    else if( match.extendSteps[iL] !== undefined || match.extendSteps[iR] !== undefined ){

                        this.animateWindow(word, match, this.currentSize);

                        if( match.extendSteps[iL] != undefined ){
                            this.currentRating = match.extendResult[iL] + ' ' + this.currentRating;
                            this.highlightMatrix( match.extendSteps[iL][0], match.extendSteps[iL][1] );
                        }

                        if( match.extendSteps[iR] != undefined ){
                            this.currentRating = this.currentRating  + ' ' + match.extendResult[iR];
                            this.highlightMatrix( match.extendSteps[iR][0], match.extendSteps[iR][1] );
                        }

                        this.updateRating(word, match, this.currentRating, this.currentSize);


                        this.currentSize++;
                    }
                }

                var iL = match.position - this.currentSize,
                    iR = match.position + blast.L - 1 + this.currentSize;

                if( match.extendSteps[iL] === undefined && match.extendSteps[iR] === undefined && this.currentSize > 0 ){
                    if( match.extendMaxRating < blast.C )
                        this.$el.find(".match-group[match-id=" + match.id + "]").velocity({opacity: 0.4});
                    this.currentMatch++;
                    this.currentSize = 0;
                    this.currentRating = (function magic(arr){ arr.push('-'); if( arr.length == blast.L - 2 ) return arr.join(' '); else return magic(arr);})([]);
                }

                if( this.currentMatch >= word.matches.length ) {
                    this.currentWord++;
                    this.currentMatch = 0;
                }
            }
        },

        appendMatchGroup : function( word, match ) {
            var newMatchGroup = $( templates['s4Extend-match-group']({
                querySeq : blast.querySeq,
                word : word,
                match : match
            }) );

            this.matchesList.append( newMatchGroup );

            newMatchGroup.find('.match-item-1, .match-item-2').blast({delimiter: 'character'});
            var gt = (word.inSeqPosition > 0) ? ':gt('+ (word.inSeqPosition - 1) +')' : '';
            newMatchGroup.find('.match-item-1>span'+ gt +':lt('+ blast.L +')').velocity({backgroundColor: '#C0CAAD'});
            var left = (match.position - word.inSeqPosition) * this.characterWidth;
            newMatchGroup.find('.match-item-1').velocity({left: left});

        },

        animateWindow : function(word, match, size) {
            var $matchGroup = this.$el.find(".match-group[match-id=" + match.id + "]"),
                $window = $matchGroup.find('.window'),
                $seq1   = $matchGroup.find('.match-item-1'),
                $seq2   = $matchGroup.find('.match-item-2'),
                self = this,
                left = Math.max( match.position - size, match.position - word.inSeqPosition, 0),
                right = Math.min( match.position + blast.L + size, match.position - word.inSeqPosition + blast.querySeq.str.length, match.sequence.str.length ),
                width = right - left;

                left *= this.characterWidth;
                width *= this.characterWidth;

                $window.velocity({opacity: 1, left: left, width: width});
        },

        matchGroupsToHide : [],
        goToEnd : function() {
            var self = this;
            _.each( blast.words, function( word ) {
                _.each( word.matches, function( match ) {
                    var size = 0,
                        iL = match.position,
                        iR = match.position + blast.L - 1,
                        ratingStr = word.rating + ' ' + (function magic(arr){ arr.push('-'); if( arr.length == blast.L - 2 ) return arr.join(' '); else return magic(arr);})([]) + ' ' + word.rating;

                    for(; match.extendSteps[iL] !== undefined || match.extendSteps[iR] !== undefined || size == 0; size++, iL--, iR++) {
                        if( match.extendSteps[iL] != undefined ){
                            ratingStr = match.extendResult[iL] + ' ' + ratingStr;
                        }
                        if( match.extendSteps[iR] != undefined ){
                            ratingStr = ratingStr  + ' ' + match.extendResult[iR];
                        }
                    }

                    self.animateWindow(word, match, size - 1);
                    self.updateRating (word, match, ratingStr, size - 1);
                    if( match.extendMaxRating < blast.C ) {
                        var matchGroup = self.$el.find(".match-group[match-id=" + match.id + "]");
                        matchGroup.velocity({opacity: 0.4});
                        self.matchGroupsToHide.push( matchGroup );
                    }
                });
            });
        },

        blastResult : function() {
            _.each( this.matchGroupsToHide, function( matchGroup ) {
                matchGroup.hide();
            });
        }
    });
})();