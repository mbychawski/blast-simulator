 /*
 * Copyright (C) 2015 Marcin Bychawski
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the BSD license.  See the LICENSE file for details.
 */
window.Views = window.Views || {};
(function() {
    'use strict';

    window.Views.Home = Backbone.View.extend({
        tagName    : 'div',
        events : {
        },
        initialize : function(options) {
            var self = this;
            this.render();
        },
        render : function() {
            var self = this;

            self.$el.html( templates.home() );

            return this;
        }
    });

    window.Views.Header = Backbone.View.extend({
        tagName    : 'div',
        events : {
            'click button' : 'buttonClick'
        },

        currentView : null,

        initialize : function(options) {
            var self = this;
            this.render();
            this.hide( true );
        },

        render : function() {
            var self = this;
            self.$el.html( templates.header() );
            $('[data-toggle="tooltip"]').tooltip();
            return this;
        },

        updateHeader : function( view ) {
            var self = this;
            this.currentView = view;

            if( view instanceof Views.Home ) {
                this.hide( false );
            }
            else if( view instanceof Views.Settings ) {
                updateTitle('Blast', 'Ustawienia');
            }
            else if( view instanceof Views.S1Init ) {
                updateTitle('Etap 1', 'Podział');
            }
            else if( view instanceof Views.S2RateWords ) {
                updateTitle('Etap 2', 'Ocena słów');
            }
            else if( view instanceof Views.S3Search ) {
                updateTitle('Etap 3', 'Wyszukiwanie');
            }
            else if( view instanceof Views.S4Extend ) {
                updateTitle('Etap 4', 'Rozszerzanie');
            }

            function updateTitle(title, subtitle) {
                self.show();
                self.$el.find('#title').text( title );
                self.$el.find('#subtitle').text( subtitle );
            }
        },

        buttonClick : function( ev ) {
            var id = ev.currentTarget.id;
            if( this.currentView )
                this.currentView.trigger('navButtonClick', [id]);
        },

        hide : function( immediate ) {
            this.$el.velocity({opacity: 0}, (immediate) ? 0 : 300);
        },

        show : function() {
            this.$el.velocity({opacity: 1}, 300);
        }

    });
})();