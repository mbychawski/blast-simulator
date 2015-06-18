 /*
 * Copyright (C) 2015 Marcin Bychawski
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the BSD license.  See the LICENSE file for details.
 */
window.Views = window.Views || {};
window.Views.S3Search = (function() {
    'use strict';
    return Backbone.View.extend({
        tagName    : 'div',

        events : {
        },

        characterWidth : 20,
        wordsList : null,
        sequenceList : null,

        rendered : false,

        initialize : function(options) {
            var self = this;
            this.on('switchedOn', function() {
                if( blast.runStage(3) || !this.rendered ) {
                    self.render();
                    this.rendered = true;
                }
            });

            this.on('navButtonClick', function( id ) {
                switch ( id[0] ) {
                    case 'prev-stage-btn' : app.navigate('s2RateWords', {trigger: true});    break;
                    case 'reset-btn'      : this.render();                              break;
                    case 'next-btn'       : this.step();                                break;
                    case 'end-btn'        : this.goToEnd();                             break;
                    case 'next-stage-btn' : app.navigate('s4Extend', {trigger: true});  break;
                }
            });
        },

        render : function() {
            var self = this;

            this.$el.html( templates.s3Search( blast ) );

            window.scrollTo(0,0);

            this.wordsList = this.$el.find('#wordsList');
            this.sequenceList = this.$el.find('#sequenceList');


            _.each( blast.words, function( word ) {
                self.appendWord( word );
            });

            _.each( blast.seqBase, function( sequence ) {
                self.appendSequence( sequence );
            });

            this.currentWord = 0;
            this.currentMatch = 0;
            this.currentMatches = [];

            return this;
        },

        currentWord   : 0,
        currentMatch : 0,
        currentMatches : [],
        step : function( ) {
            var self = this;
            if( this.currentWord < blast.words.length ) {
                var word = blast.words[ this.currentWord ],
                    $wordListItem = this.$el.find('.word-list-item[word-id=' + word.id + ']'),
                    $wordMatches = $wordListItem.find('.word-matches'),
                    $word = $wordListItem.find('.word');

                if( this.currentMatch < word.matches.length ) {
                    var match = word.matches[ this.currentMatch ];
                    this.currentMatches.push( "S" + match.sequence.id + "[" + match.position + "]");
                    this.animateWindow( match.sequence.id, match.position );
                    $word.velocity({backgroundColor : '#C0CAAD', backgroundColorAlpha: 0.5})
                         .velocity('reverse');
                    $wordMatches.text( this.currentMatches.join('; ') );
                }


                this.currentMatch++;
                if( this.currentMatch >= word.matches.length ){
                    if( word.matches.length === 0 )
                        $wordListItem.velocity({opacity : 0.3});

                    this.currentMatch = 0;
                    this.currentMatches = [];
                    this.currentWord++;
                }
            }
        },

        appendWord : function( word ) {
            var newWord = $( templates['s3Search-word-list-item']( word ) );
            this.wordsList.append( newWord );
        },

        appendSequence : function( sequence ) {
            var newSequence = $( templates['s3Search-sequence-list-item']( sequence ) );
            this.sequenceList.append( newSequence );
            newSequence.find('.sequence').blast({delimiter: 'character'});
        },

        animateWindow : function(sequenceId, position) {
            var self = this;
            var $seqWindow = this.$el.find('.sequence-scroller[sequence-id='+ sequenceId +']>.window'),
                $seqScroller = this.$el.find('.sequence-scroller[sequence-id='+ sequenceId +']');

            return $seqWindow.velocity({width: this.characterWidth * blast.L + 4, opacity: 1})
                      .velocity({left: (this.characterWidth * position + 28)}, function() {
                            if( $seqScroller.width() < (self.characterWidth * position + 50) ){
                                $seqScroller[0].scrollLeft = self.characterWidth * position ;
                            }
                            else {
                                $seqScroller[0].scrollLeft = 0;
                            }
                      })
                      .velocity({backgroundColor : '#C0CAAD', backgroundColorAlpha: 0.5})
                      .velocity({opacity: 0})
                      .velocity({left: 0});
        },

        goToEnd : function() {
            for( this.currentWord; this.currentWord < blast.words.length; this.currentWord++ ) {
                var word = blast.words[ this.currentWord ],
                    $wordListItem = this.$el.find('.word-list-item[word-id=' + word.id + ']'),
                    $wordMatches = $wordListItem.find('.word-matches'),
                    matches = [];
                _.each(word.matches, function(match) {
                    matches.push( "S" + match.sequence.id + "[" + match.position + "]");
                });
                if( word.matches.length === 0 )
                    $wordListItem.velocity({opacity : 0.3});
                $wordMatches.text( matches.join('; ') );
            }
        }
    });
})();