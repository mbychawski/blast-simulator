 /*
 * Copyright (C) 2015 Marcin Bychawski
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the BSD license.  See the LICENSE file for details.
 */
window.Views = window.Views || {};
window.Views.S2RateWords = (function() {
    'use strict';
    return Backbone.View.extend({
        tagName    : 'div',

        events : {
        },

        characterWidth : 20,
        wordsList : null,
        rendered : false,

        initialize : function(options) {
            var self = this;
            this.on('switchedOn', function() {
                if( blast.runStage(2) || !this.rendered ) {
                    self.render();
                    this.rendered = true;
                }
            });

            this.on('navButtonClick', function( id ) {
                switch ( id[0] ) {
                    case 'prev-stage-btn' : app.navigate('s1Init', {trigger: true});    break;
                    case 'reset-btn'      : this.render();                              break;
                    case 'next-btn'       : this.step();                                break;
                    case 'end-btn'        : this.goToEnd();                             break;
                    case 'next-stage-btn' : app.navigate('s3Search', {trigger: true});  break;
                }
            });
        },

        render : function() {
            var self = this;

            this.$el.html( templates.s2RateWords( blast ) );

            window.scrollTo(0,0);


            this.wordsList = this.$el.find('#wordsList');

            this.currentWord = 0;

            _.each( blast.words, function( word ) {
                self.appendWord( word );
            });

            this.$el.find('.word').blast({delimiter: 'character'});

            return this;
        },

        currentWord   : 0,
        currentLetter : 0,
        currentRank : [],
        step : function( ) {
            var self = this;
            if( this.currentWord < blast.words.length ) {
                var word = blast.words[ this.currentWord ],
                    $wordListItem = this.$el.find('.word-list-item[word-id=' + word.id + ']'),
                    letter = word.str[ this.currentLetter ],
                    $letter = $wordListItem.find('.word>span:nth-child(' + (+this.currentLetter + 1) + ')'),
                    letterIdx = utils.ntoi( letter ),
                    $wordRank = $wordListItem.find('.word-rank');

                this.currentRank.push( blast.matrix[letterIdx][letterIdx] );

                this.highlightMatrix( letter );
                $letter.velocity({backgroundColor : '#C0CAAD'}).velocity('reverse');

                $wordRank.text( this.currentRank.join(' + ') );

                this.currentLetter++;
                if( this.currentLetter == blast.L ){
                    $wordRank.text( this.currentRank.join(' + ') + ' = ' + word.rating + ((word.rejected) ? ' < T' : ' >= T') );
                    if( word.rejected )
                        $wordListItem.velocity({opacity : 0.3});

                    this.currentLetter = 0;
                    this.currentRank = [];
                    this.currentWord++;
                }
            }
        },

        appendWord : function( word ) {
            var newWord = $( templates['s2RateWords-word-list-item']( word ) );
            this.wordsList.append( newWord );
            newWord.find('.word').blast({delimiter: 'character'});
        },

        highlightMatrix : function( char ) {
            char = char.toUpperCase();
            var cell = this.$el.find("[mtx-row=" + char + "][mtx-cell=" + char + "]");
            cell.velocity({backgroundColor : '#C0CAAD'}).velocity('reverse');
        },

        goToEnd : function() {
            for( this.currentWord; this.currentWord < blast.words.length; this.currentWord++ ) {
                var word = blast.words[ this.currentWord ],
                    $wordListItem = this.$el.find('.word-list-item[word-id=' + word.id + ']'),
                    $wordRank = $wordListItem.find('.word-rank');

                $wordRank.text( word.ratingArr.join(' + ') + ' = ' + word.rating + ((word.rejected) ? ' < T' : ' > T') );
                if( word.rejected )
                    $wordListItem.velocity({opacity : 0.3});
            }
        }
    });
})();