(function($) {

window.dkuInstantSearch = function(hitsPerPage, attributesToRetrieve, mandatoryRefinements) {

  // Client initialization
  var algolia = algoliasearch('5ME78R50J8', '4969f0b607b8e473b498ee2d1d0a982d');

  /*
  ** ------------ VARIABLEs DECLARATION ------------
  */

  // DOM binding
  var $noquery = $('#noquery');
  var $withquery = $('#withquery');
  var $hits = $('#hits');
  var $pagination = $('#pagination');
  var $stats = $('#stats');
  var $q = $('#q');
  var $facets = $('#facets');

  var $hitTemplate = Hogan.compile($('#hit-template').text());
  var $tuleHitTemplate = Hogan.compile($('#tule-hit-template').text());
  var $statsTemplate = Hogan.compile($('#stats-template').text());
  var $paginationTemplate = Hogan.compile($('#pagination-template').text());
  var $facetTemplate = Hogan.compile($('#facet-template').text());

  var lastQueryStr = 0;

  // Helper initialization
  var index = window.dkuAlgoliaIndex;

  // Facets ordered by order of display: here type will be displayed first and manufacture at the end
  // Also includes the refinements initialization & configuration
  function sortByCountDesc(a, b) { return b.count - a.count; }
  var FACETS = [
    { name: 'category', title: 'Category', sortFunction: sortByCountDesc, topListIfRefined: true},
    { name: 'tags', title: 'Tags', sortFunction: sortByCountDesc, topListIfRefined: true}
  ];
  var refinements = {};
  var mandatoryRefinementsMap = {};

  /*
  ** ------------ ALGOLIA HELPERs DECLARATIONs ------------
  */

  // regular search helper
  var helper = algoliasearchHelper(algolia, index, {
    // list of conjunctive facets (link to refine)
    facets: ['tags', 'category'],

    // list of disjunctive facets (checkbox to refine)
    disjunctiveFacets: [],

    // number of results per page
    hitsPerPage: hitsPerPage,

    attributesToHighlight : ["tags", "title", "category"],
    attributesToRetrieve: attributesToRetrieve,
    attributesToSnippet : "content:20"
  });
  helper.on("result", searchCallback);

  // facet search helper
  var facetSearchHelper = algoliasearchHelper(algolia, index, {
    // list of conjunctive facets (link to refine)
    facets: ['tags', 'category'],

    // list of disjunctive facets (checkbox to refine)
    disjunctiveFacets: [],

    // number of results per page
    hitsPerPage: 30,

    attributesToHighlight : ["tags", "title", "category"],
    attributesToRetrieve: attributesToRetrieve,
    attributesToSnippet : "content:20"
  });
  facetSearchHelper.on("result", facetSearchCallback);

  /*
  ** ------------ SEARCH CALLBACKs ------------
  */

  // Callback called on each keystroke, rendering the results
  function searchCallback(content) {
    console.log('searchCallback');

    if (content.query != lastQueryStr) {
      console.info("Ignoring late response:"  + content.query);
      return;
    }

    if ($q.val().length == 0) {
      $withquery.hide();
      $noquery.show();
      $('.list-group-item').removeClass('refined');
      location.replace('#');
    } else {
      var html = '';
      $withquery.show();
      $noquery.hide();

      // stats: render the number of results + processing time
      $stats.html($statsTemplate.render({ query: content.query, nbHits: content.nbHits.numberWithDelimiter(), processingTimeMS: content.processingTimeMS, nbHits_plural: content.nbHits != 1 }));

      // hits: display the `hitsPerPage` results
      html = buildHitHTML(content, $hitTemplate);
      $hits.html(html);

      // facets: display the conjunctive+disjunctive facets
      $facets.html(buildFacetHTML(content, helper, 'toggleRefine'));

      // render pagination
      var pages = [];
      if (content.page > 5) {
        pages.push({ current: false, number: 1 });
        pages.push({ current: false, number: '...', disabled: true });
      }
      for (var p = content.page - 5; p < content.page + 5; ++p) {
        if (p < 0 || p >= content.nbPages) {
          continue;
        }
        pages.push({ current: content.page == p, number: (p + 1) });
      }
      if (content.page + 5 < content.nbPages) {
        pages.push({ current: false, number: '...', disabled: true });
        pages.push({ current: false, number: content.nbPages });
      }
      $pagination.html($paginationTemplate.render({ pages: pages, prev_page: (content.page > 0 ? content.page : false), next_page: (content.page + 1 < content.nbPages ? content.page + 2 : false) }));

      // update URL anchor
      var refinements = computeRefinementsList(content, helper);
      location.replace('#q=' + encodeURIComponent(content.query) + '&page=' + content.page + '&refinements=' + encodeURIComponent(JSON.stringify(refinements)));
    }
    // scroll on top
    window.scrollTo(0, 0);
  }

  function facetSearchCallback(content) {
    console.info("Calback Facet search");
    var html = '';
    var refinements = computeRefinementsList(content, facetSearchHelper);
    if (refinements.length > 0) {
      $withquery.show();
      $noquery.hide();

      // hits: display the `hitsPerPage` results
      html = buildHitHTML(content, $tuleHitTemplate);
      $hits.html(html);

      //$facets.html($('#noquery .filter-column').html());
      $facets.html(buildFacetHTML(content, facetSearchHelper, 'facetSearch'));
      $stats.html('');
      $pagination.html('');

      // update URL anchor
      location.replace('#refinements=' + encodeURIComponent(JSON.stringify(refinements)));      
    } else {
      $withquery.hide();
      $noquery.show();
      location.replace('#');
    }

    // scroll on top
    window.scrollTo(0, 0);
  }

  /*
  ** ------------ SEARCH CALLBACKs HELPERs ------------
  */

  function computeRefinementsList(content, searchHelper) {
    var refinements = [];
    for (var j=0; j<FACETS.length; ++j) { 
      facetConfig = FACETS[j];
      facetResult = content.getFacetByName(facetConfig.name);
      if (facetResult) {
        for (var v in facetResult.data) {
          if (searchHelper.isRefined(facetConfig.name, v)) {
            var r = {};
            r[facetConfig.name] = v;
            refinements.push(r);
          }
        }
      }
    }
    return refinements;
  }

  function buildHitHTML(content, template) {
    html = '';
    for (var i = 0; i < content.hits.length; ++i) {
      var rendered = template.render(content.hits[i]);
      html += rendered;
      window.test = content.hits[i];
    }
    return html;
  }

  function buildFacetHTML(content, searchHelper, onclickMethodName){
    var html = '';
    var facetResult = null;
    var facetConfig = null;
    var isDisjunctive = null; 

    for (var j=0; j<FACETS.length; ++j) {
      facetConfig = FACETS[j];
      facetResult = content.getFacetByName(facetConfig.name);
      isDisjunctive = (content['disjunctiveFacets'][facetConfig.name]) ? true : false;
      
      if (facetResult) {
        // collect all values from `facetResult` to sort them by facetConfig.sortFunction
        var values = [];
        for (var v in facetResult.data) {
          values.push({ label: v, value: v, count: facetResult.data[v], refined: searchHelper.isRefined(facetConfig.name, v) });
        }
        // sort the values
        values.sort(function(a, b) {
          // If topListIfRefined === true: sort by the refined states first (put them on top if they are refined).
          if (facetConfig.topListIfRefined) {
            if (a.refined !== b.refined) {
              if (a.refined) return -1;
              if (b.refined) return 1;
            }
          }

          // then fallback on the standard sort function
          return facetConfig.sortFunction(a,b);
        });

        // render the facet
        html += $facetTemplate.render({
          facet: facetConfig.name,
          title: facetConfig.title,
          values: values.slice(0, 10),
          has_other_values: values.length > 10,
          other_values: values.slice(10),
          disjunctive: isDisjunctive,
          onclickMethodName: onclickMethodName,
          isCategory: facetConfig.name == 'category'
        });      
      }
    }
    return html;
  }

  // Helpers
  Number.prototype.numberWithDelimiter = function(delimiter) {
    var number = this + '', delimiter = delimiter || ',';
    var split = number.split('.');
    split[0] = split[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + delimiter);
    return split.join('.');
  };

  /*
  ** ------------ SEARCH OPERATIONs ------------
  */

  // perform a search
  function search() {
    var params = {
      // retrieve maximum 50 values per facet to display the "more" link
      maxValuesPerFacet: 50
    };
    // if we're sorting by something,
    // make the typo-tolerance more strict
    if (helper.index != index) {
      // disable if not the "default" index (sort by price, etc...)
      helper.state.setTypoTolerance(false);
    }
    // perform the query

    helper.setQuery($q.val());
    lastQueryStr = $q.val(); 
    helper.search();
  }

  // add a refinement to a search
  window.toggleRefine = function(facet, value) {
    // refinining a facet reset the pagination
    helper.setCurrentPage(0);
    console.info("Toggle refine on", facet, value);
    customToggleRefine(helper, facet, value);
    helper.search();
  };

  // perform a facet search
  window.facetSearch = function(facet, value) {
    customToggleRefine(facetSearchHelper, facet, value);
    facetSearchHelper.search();
  }

  function customToggleRefine(helper, facet, value) {
    //can't toggle mandatory refinements
    if (!mandatoryRefinementsMap.facet || !mandatoryRefinementsMap.facet.contains(value)) {
      helper.toggleRefine(facet, value);
    }
  }

  /*
  ** ------------ UI NAVIGATION ------------
  */
    // click binding
  window.showMoreLess = function(link) {
    $(link).closest('ul').find('.show-more').toggle();
  };

  window.gotoPage = function(page) {
    helper.setCurrentPage(+page - 1).search();
  };
  window.sortBy = function(index_suffic, link) {
    $(link).closest('.btn-group').find('.sort-by').text($(link).text());
    // set target index name
    helper.index = index + index_suffic;
    // reset page
    helper.setCurrentPage(0);
    // perform the query
    search();
  };

  /*
  ** ------------ INITIALISATION ------------
  */

  // init: mandatoryRefinements
  if (mandatoryRefinements && mandatoryRefinements.length > 0) {
    mandatoryRefinements.forEach(function(refinement) {
      for (var refine in refinement) {
        helper.toggleRefine(refine, refinement[refine]);
        facetSearchHelper.toggleRefine(refine, refinement[refine]);
        if (!mandatoryRefinementsMap.refine) {
          mandatoryRefinementsMap.refine = [refinement[refine]];
        } else {
          mandatoryRefinementsMap.refine.push(refinement[refine]);
        }
      }
    });
  }

// init: fetch anchor params and init the associated variables
  if(location.hash) {
    //changing location.hash into an object of params
    var params = {}
    var paramsAsArray = location.hash.match(/[#&][a-zA-Z]+=[^&]*/g);
    paramsAsArray.forEach(function(p) {
      if (p.indexOf('=') > 0) {
        var attrName = p.substring(1, p.indexOf('='));
        var attrValue = p.substring(p.indexOf('=') + 1);
        params[attrName] = attrValue;
      }
    });

    //some util method for refinement
    var multipleCustomToggleRefine = function(refinements, helper) {
      refinements = JSON.parse(decodeURIComponent(refinements));
      for (var i = 0; i < refinements.length; ++i) {
        for (var refine in refinements[i]) {
          customToggleRefine(helper, refine, refinements[i][refine]);
        }
      }
    }

    //trying to launch a seach based on what we manage to populate params object with.. 
    if (params.q) {
      //query
      var q = decodeURIComponent(params.q);
      $q.val(q);
      helper.setQuery(q);
      lastQueryStr = q;
      //refinements
      if (params.refinements) {
        multipleCustomToggleRefine(params.refinements, helper);
      }
      //page
      if (params.page && !isNaN(parseInt(params.page))) {
        helper.setCurrentPage(parseInt(params.page));
      }
      helper.search();
    } else if (params.refinements) {
      //refinements
      multipleCustomToggleRefine(params.refinements, facetSearchHelper);
      if (params.page && !isNaN(parseInt(params.page))) {
        facetSearchHelper.setCurrentPage(parseInt(params.page));
      }
      //page
      facetSearchHelper.search();
    }
  }

  // Key listener
  var lastQuery = $q.val();
  $q.on('keyup change', function() {
    if ($q.val() != lastQuery) {
      lastQuery = $q.val();
      // performing a new full-text query reset the pagination and the refinements
      helper.setCurrentPage(0);
      helper.clearRefinements();
      facetSearchHelper.clearRefinements();
      search();
    }
  }).focus();


}

})(jQuery);
