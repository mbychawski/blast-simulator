 /*
 * Copyright (C) 2015 Marcin Bychawski
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the BSD license.  See the LICENSE file for details.
 */
window.Views = window.Views || {};
window.Views.S1Init = (function() {
    'use strict';
    return Backbone.View.extend({
        tagName    : 'div',

        events : {
        },

        querySeqWindow : null,
        characterWidth : 20,
        wordsList : null,

        rendered : false,

        initialize : function(options) {
            var self = this;
            this.on('switchedOn', function() {
                if( blast.runStage(1) || !this.rendered ) {
                    self.render();
                    this.rendered = true;
                }
            });

            this.on('navButtonClick', function( id ) {
                switch ( id[0] ) {
                    case 'prev-stage-btn' : app.navigate('settings', {trigger: true});     break;
                    case 'reset-btn'      : this.render();                                 break;
                    case 'next-btn'       : this.step();                                   break;
                    case 'end-btn'        : this.goToEnd();                                break;
                    case 'next-stage-btn' : app.navigate('s2RateWords', {trigger: true});  break;
                }
            });
        },

        render : function() {
            var self = this;

            this.$el.html( templates.s1Init( blast ) );

            window.scrollTo(0,0);

            this.$el.find('#query-seq').blast({delimiter: 'character'});

            this.querySeqWindow = this.$el.find('#query-seq-window');
            this.wordsList = this.$el.find('#wordsList');

            this.currentWord = -1;

            return this;
        },

        currentWord : -1,

        step : function( ) {
            var self = this;
            if( this.currentWord < (blast.words.length - 1) ) {
                this.currentWord++;
                var anim1;
                if( this.currentWord == 0) {
                    anim1 = this.querySeqWindow.velocity({width: this.characterWidth * blast.L + 2, opacity: 1, left: 30});
                }
                else {
                    anim1 = this.querySeqWindow.velocity({left: "+=" + this.characterWidth});
                }
                anim1.velocity({backgroundColor : '#C0CAAD', backgroundColorAlpha: 0.5}, function() {
                    self.appendWord( blast.words[self.currentWord]);
                }).velocity('reverse');
            }
            else {
                this.querySeqWindow.velocity({opacity: 0});
            }
        },

        appendWord : function( word ) {
            var newWord = $( templates['s1Init-word-list-item']( word ) );
            this.wordsList.append( newWord );
        },

        goToEnd : function() {
            for( ++this.currentWord; this.currentWord < blast.words.length; this.currentWord++ ) {
                this.appendWord( blast.words[ this.currentWord ]);
            }

            this.querySeqWindow.velocity({opacity: 0});
        }
    });
})();