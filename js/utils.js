 /*
 * Copyright (C) 2015 Marcin Bychawski
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the BSD license.  See the LICENSE file for details.
 */
window.utils = (function() {
    'use strict';
    var templates = {};

    function loadTemplates( paths ) {
        var deferred = new $.Deferred(),
            deferreds = [];

        if(typeof paths === "string")
            paths = [paths];

        _.each(paths, function(path) {
            var def = new $.Deferred();

            $.get(path, null, function( data ) {
                var $templates = $(data).filter('[type="text/x-template"]');
                $templates.each( function() {
                    var $this = $(this);
                    templates[ $this.attr('id') ] = _.template( $this.html() );
                });
                def.resolve();
            });

            deferreds.push( def );
        });

        $.when.apply(null, deferreds).done(function() {
            deferred.resolve( templates );
        });

        return deferred.promise();
    }

    //Nucleotide to index
    function ntoi( nucleotide ) {
        return {
            'A' : 0,
            'C' : 1,
            'G' : 2,
            'T' : 3
        }[nucleotide];
    }

    function iton( nucleotide ) {
        return {
            0 : 'A' ,
            1 : 'C' ,
            2 : 'G' ,
            3 : 'T'
        }[nucleotide];
    }

    return {
        loadTemplates : loadTemplates,
        templates : templates,
        ntoi : ntoi,
        iton : iton
    }
})();