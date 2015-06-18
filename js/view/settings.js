 /*
 * Copyright (C) 2015 Marcin Bychawski
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the BSD license.  See the LICENSE file for details.
 */
window.Views = window.Views || {};
window.Views.Settings = (function() {
    'use strict';
    return Backbone.View.extend({
        tagName    : 'div',
        events : {
            'click #load-default-params-btn' : 'loadDefault',
            'click #load-default-matrix-btn' : 'loadDefault',
            'click #load-default-db-btn' : 'loadDefault',
            'click #random-query-btn' : 'randomQuery',
            'click #add-seq-btn' : 'addSeq',
            'click #random-seq-btn' : 'randomSeq',
            'click .seq-remove-btn' : 'removeSeq',
            'click #clear-seq-btn' : 'removeAllSeq',
            'keypress input.seq' : 'preventNonNucleotid',
            'click #run-btn' : 'runBlast'

        },

        seqDBList : null,

        initialize : function(options) {
            var self = this;

            this.on('switchedOn', function() {
                self.render();
            });

            this.on('navButtonClick', function( id ) {
                switch ( id[0] ) {
                    case 'prev-stage-btn' : app.navigate('', {trigger: true});     break;
                    case 'next-btn'       : this.runBlast();  break;
                    case 'end-btn'        : this.runBlast();  break;
                    case 'next-stage-btn' : this.runBlast();  break;
                }
            });
        },
        render : function() {
            var self = this;

            this.$el.html( templates.settings() );

            this.seqDBList = this.$el.find('#seq-db');

            this.updateAll();

            this.$el.find("input[type=number]").on("keypress", function (evt) {
                if ( (evt.which < 48 || evt.which > 57) && evt.which !== 45)
                    evt.preventDefault();
            });

            return this;
        },

        preventNonNucleotid : function( evt ) {
            if (evt.which !== 97 && evt.which !== 116 && evt.which !== 99 && evt.which !== 103)
                    evt.preventDefault();
        },

        updateAll : function() {
            this.updateParams();
            this.updateMatrix();
            this.updateSeqDB();

        },

        updateParams : function() {
            this.$el.find('.alg-param-input').each(function() {
                var $this = $(this),
                    paramName = $this.attr('param-name');
                if(paramName == 'd')
                    return;
                $this.val( blast[paramName] );
            });
        },

        updateMatrix : function() {
            this.$el.find('#alignment-matrix input').each(function() {
                var $this = $(this),
                    row  = utils.ntoi( $this.attr('mtx-row') ),
                    cell = utils.ntoi( $this.attr('mtx-cell') );
                $this.val( blast.matrix[row][cell] );
            });
        },

        updateSeqDB : function() {
            var self = this;

            this.$el.find('#query-seq').val( blast.querySeq.str );
            this.seqDBList.empty();

            blast.seqBase.forEach(function( seq ) {
                self.apppendSeqDBItem( seq );
            });
        },

        apppendSeqDBItem : function( seq ) {
            this.seqDBList.append( templates['seq-db-item']( seq ) );
        },

        loadDefault : function( ev ) {
            var id = ev.currentTarget.id;
            switch( id ) {
                case 'load-default-params-btn' :
                    blast.loadDefault('params');
                    this.updateParams();
                    break;
                case 'load-default-matrix-btn' :
                    blast.loadDefault('matrix');
                    this.updateMatrix();
                    break;
                case 'load-default-db-btn' :
                    blast.loadDefault('seqBase');
                    this.updateSeqDB();
                    break;
            }
        },

        randomQuery : function() {
            var length = +this.$el.find('#random-query-seq-len').val();
            if( ! length )
                length = 40;
            blast.randomQuerySeq( length )
            this.$el.find('#query-seq').val( blast.querySeq.str );
        },

        addSeq : function() {
            var newSeq = new Sequence('');
            this.apppendSeqDBItem( newSeq );
            blast.seqBase.push( newSeq );
        },

        randomSeq : function() {
            var self = this,
                length = +this.$el.find('#random-seq-len').val(),
                count  = +this.$el.find('#random-seq-cnt').val();

            if( ! length )
                length = 40;
            if( !count )
                count = 1;


            var newSeqs = blast.addRandomSeqToDB(length, count);
            newSeqs.forEach( function(seq) {
                self.apppendSeqDBItem( seq );
            });
        },

        removeSeq : function( ev ) {
            var seqId = ev.currentTarget.getAttribute('seq-id')
            blast.removeSeq( seqId );
            this.$el.find('.seq-db-item[seq-id=' + seqId +']').remove();
        },

        removeAllSeq : function() {
            this.$el.find('.seq-remove-btn').trigger('click');
        },

        runBlast : function() {
            var params = {
                matrix : [[[],[],[],[]],[[],[],[],[]],[[],[],[],[]],[[],[],[],[]]]
            };

            this.$el.find('.alg-param-input').each(function() {
                var $this = $(this),
                    paramName = $this.attr('param-name');
                params[paramName] = +$this.val();
            });

            this.$el.find('#alignment-matrix input').each(function() {
                var $this = $(this),
                    row  = utils.ntoi( $this.attr('mtx-row') ),
                    cell = utils.ntoi( $this.attr('mtx-cell') );
                params.matrix[row][cell] = +$this.val();
            });

            params.querySeq = this.$el.find('#query-seq').val().toUpperCase();

            params.seqBase = {};
            this.$el.find('#seq-db .seq').each( function() {
                params.seqBase[ $(this).attr('seq-id') ] = $(this).val().toUpperCase();
            });

            blast.update( params );

            app.navigate('s1Init', {trigger: true});

        }

    });
})();