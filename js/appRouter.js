 /*
 * Copyright (C) 2015 Marcin Bychawski
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the BSD license.  See the LICENSE file for details.
 */
window.AppRouter = ( function() {
    'use strict';
    var container = $('#main-container');

    return Backbone.Router.extend({
        routes: {
            ''             : 'home',
            'settings'     : 'settings',
            's1Init'       : 's1Init',
            's2RateWords'  : 's2RateWords',
            's3Search'     : 's3Search',
            's4Extend'     : 's4Extend'
        },

        views : {
            home     : null,
            header   : null,
            settings : null,
            s1Init   : null,
            s2RateWords : null,
            s3Search : null,
            s4Extend : null
        },

        initialize : function() {
            this.views.header = new Views.Header();
            $('#header').append( this.views.header.el );

            Backbone.history.start();
        },

        home : function() {
            if( this.views.home === null ) {
                this.views.home = new Views.Home();
            }

            this.switchView( this.views.home );
        },

        settings : function() {
            if( this.views.settings === null ) {
                this.views.settings = new Views.Settings();
            }

            this.switchView( this.views.settings );
        },

        s1Init : function() {
            if( this.views.s1Init === null ) {
                this.views.s1Init = new Views.S1Init();
            }

            this.switchView( this.views.s1Init );
        },

        s2RateWords : function() {
            if( this.views.s2RateWords === null ) {
                this.views.s2RateWords = new Views.S2RateWords();
            }

            this.switchView( this.views.s2RateWords );
        },

        s3Search : function() {
            if( this.views.s3Search === null ) {
                this.views.s3Search = new Views.S3Search();
            }

            this.switchView( this.views.s3Search );
        },

        s4Extend : function() {
            if( this.views.s4Extend === null ) {
                this.views.s4Extend = new Views.S4Extend();
            }

            this.switchView( this.views.s4Extend );
        },

        switchView : function( view ) {
            container.children().detach();
            container.append( view.el );
            view.trigger('switchedOn');
            this.views.header.updateHeader( view );
        }
    });
})();