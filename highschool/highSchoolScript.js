var map;

  function init(){
    //initiate variables
	var bins = {};
	var title = '';
	
    // initiate leaflet map
    map = new L.Map('map', { 
      center: [ 39.990909,-75.130606],
      zoom: 11
    })
	
	bins_nabe = {
          "#3182BD": "40.1 to 100%",
          "#9ECAE1": "20.1 to 40%",
          "#DEEBF7": "0 to 20%"
        };
	bins_charter = {
          "#3182BD": "25 to 100%",
          "#9ECAE1": "15.1 to 25%",
          "#DEEBF7": "0 to 15%"
        };

	bins_specAdmit = {
          "#3182BD": "25 to 100%",
          "#9ECAE1": "15.1 to 25%",
          "#DEEBF7": "0 to 15%"
        };
		
	bins_cityWide = {
          "#3182BD": "15 to 100%",
          "#9ECAE1": "10.1 to 15%",
          "#DEEBF7": "0 to 10%"
        };
	
	var title_nabe = 'Attending Neighborhood School'; 
	var title_charter = 'Attending Charter School';
	var title_specAdmit = 'Attending Special Admission School';
	var title_cityWide = 'Attending Citywide Admission School';
	
    L.tileLayer('https://dnv9my2eseobd.cloudfront.net/v3/cartodb.map-4xtxp73f/{z}/{x}/{y}.png', {
      attribution: 'MapBox'
    }).addTo(map);
    
	var layerUrl_schools = 'http://manetomapping.cartodb.com/api/v1/viz/19592/viz.json';
	var layerUrl_HSCatch = 'http://manetomapping.cartodb.com/api/v1/viz/19503/viz.json';

	//add the schools layer
    var layerOptions_schools = {
             query: "SELECT * FROM {{table_name}} WHERE action = 'Close'",
              //tile_style: "#{{table_name}}{marker-fill: #F84F40; marker-width: 8; marker-line-color: white; marker-line-width: 2; marker-clip: false; marker-allow-overlap: true;} "
			  tile_style: "#philadelphiaschools201201 [instit_typ = 'District'] {[mapnik-geometry-type=point] {marker-fill: #FFFF99;marker-opacity: 0; marker-width: 12; marker-line-opacity: 0; marker-placement: point;marker-type: ellipse;marker-allow-overlap: true;}}#philadelphiaschools201201 [instit_typ = 'Charter'] {[mapnik-geometry-type=point] { marker-fill: #386CB0; marker-opacity: 0; marker-width: 12;marker-line-opacity: 0; marker-placement: point;marker-type: ellipse;marker-allow-overlap: true;}}#schoolclosings [expanded_seats = ''] [instit_typ = 'Charter' ] {[mapnik-geometry-type=point] {marker-fill: #386CB0;marker-opacity: .3;marker-width: 12;marker-line-opacity: 0;marker-placement: point; marker-type: ellipse;marker-allow-overlap: true;}}"
	}

	var layerOptions_HSCatch = {
			  tile_style: "#newsworks_hscatchment{line-color: #FFF;line-opacity: .5;line-width: .5; polygon-fill: #BFC7CB; polygon-opacity: 0.8;}"
	}
	
    var layers = [];

	//add polygons first
	cartodb.createLayer(map, layerUrl_HSCatch, layerOptions_HSCatch)
     .on('done', function(layer) {
      map.addLayer(layer);
      layers.push(layer);
    }).on('error', function() {
      //log the error
    });
	
	//add points on top
    cartodb.createLayer(map, layerUrl_schools, layerOptions_schools)
     .on('done', function(layer) {
      map.addLayer(layer);
      layers.push(layer);
    }).on('error', function() {
      //log the error
    });
	

	
	// pushing the button function
    $('.button').click(function(){
      $('.button').removeClass('selected'); $(this).addClass('selected');
      LayerActions[$(this).attr('id')]();
    })	

	

	function legendClear(){
		$("#legend").empty();
	};
	
	function CartoDBLegend(bins,title){
	  legendClear();
	  $ = cartodb.$;
      var mapL = $('#legend');
      var title = $('<span>').html(title);
      var holder = $('<div>').attr('class', 'title');
          holder.append(title);
          mapL.append(holder);
      for (i in bins) {
        var key = $('<span>').attr('class', 'circle'); // can take 'box', 'line', or 'circle' type here for customizing your legend
            key.css('background', i);
        var val = $('<span>').attr('class', 'value');
            val.html(bins[i]);
        var row = $('<div>').attr('class', 'row');
            row.append(key);
            row.append(val);
        mapL.append(row)
      }
    }
	
   var LayerActions = {
      none: function(){
          layers[1].setQuery("SELECT * FROM philadelphiaschools201201");
		  layers[1].setCartoCSS("#philadelphiaschools201201 {[mapnik-geometry-type=point] {marker-fill: #FFFF99;marker-opacity: 0; marker-line-opacity: 0; }} ");
          return true;
        },
      close: function(){
          layers[1].setQuery("SELECT * FROM philadelphiaschools201201 WHERE action IS NOT NULL AND facil_type = 'School' AND grade_leve ='High School'");
		  layers[1].setCartoCSS("#philadelphiaschools201201 {[mapnik-geometry-type=point] {marker-fill: #FFFF99;marker-opacity: 1; marker-width: 6; marker-line-opacity: 0; marker-placement: point;marker-type: ellipse;marker-allow-overlap: true;}} ");
          return true;
        },
	  pcharter: function(){
          layers[0].setCartoCSS("#newsworks_hscatchment{line-color: #FFF;line-opacity:.5;line-width: .5;polygon-opacity: 0.8;}#newsworks_hscatchment [ pcharter <= 100] {polygon-fill: #3182BD;}#newsworks_hscatchment [ pcharter <= 25] {polygon-fill:#9ECAE1;} #newsworks_hscatchment [ pcharter <= 15] {polygon-fill: #DEEBF7;}");
          layers[1].setQuery("SELECT * FROM philadelphiaschools201201 WHERE instit_typ = 'Charter' AND grade_leve = 'High School' AND facil_type = 'School' AND active = 'y'");
		  layers[1].setCartoCSS("#philadelphiaschools201201 {[mapnik-geometry-type=point] {marker-fill: #FFFF99;marker-opacity: 1; marker-width: 6; marker-line-opacity: 0; marker-placement: point;marker-type: ellipse;marker-allow-overlap: true;}} ");
		  CartoDBLegend(bins_charter,title_charter);
		  return true;
        },
	  pneighborhood: function(){
		  layers[0].setCartoCSS("#newsworks_hscatchment{line-color: #FFF;line-opacity: .5;line-width: .5;polygon-opacity: 0.8;}#newsworks_hscatchment [ p_innabe <= 100] {polygon-fill: #3182BD;} #newsworks_hscatchment [ p_innabe <= 40] {polygon-fill: #9ECAE1;} #newsworks_hscatchment [ p_innabe <= 20] {polygon-fill: #DEEBF7;}");
          //layers[1].setQuery("SELECT * FROM philadelphiaschools201201 WHERE (instit_typ = 'District' or instit_typ = 'Renaissance') AND grade_leve = 'High School' AND facil_type = 'School' AND active = 'y'");
		  layers[1].setCartoCSS("#philadelphiaschools201201 {[mapnik-geometry-type=point] {marker-fill: #FFFF99;marker-opacity: 0; marker-line-opacity: 0; }} ");
		  CartoDBLegend(bins_nabe,title_nabe);
		  return true;
        },
	  pSpecAdmit: function(){
		  layers[0].setCartoCSS("#newsworks_hscatchment{line-color: #FFF;line-opacity: .5;line-width: .5;polygon-opacity: 0.8;}#newsworks_hscatchment [ pspecadmit <= 100] {polygon-fill: #3182BD;}#newsworks_hscatchment [ pspecadmit <= 25] {polygon-fill: #9ECAE1;}#newsworks_hscatchment [ pspecadmit <= 15] {polygon-fill: #DEEBF7;}");
          layers[1].setQuery("SELECT * FROM philadelphiaschools201201 WHERE type = 'Special Admission' AND grade_leve = 'High School' AND facil_type = 'School' AND active = 'y'");
		  layers[1].setCartoCSS("#philadelphiaschools201201 {[mapnik-geometry-type=point] {marker-fill: #FFFF99;marker-opacity: 1; marker-width: 6; marker-line-opacity: 0; marker-placement: point;marker-type: ellipse;marker-allow-overlap: true;}} ");
		  CartoDBLegend(bins_specAdmit,title_specAdmit);
		  return true;
        },		
	  pCitywide: function(){
		  layers[0].setCartoCSS("#newsworks_hscatchment{line-color: #FFF;line-opacity: .5;line-width: .5;polygon-opacity: 0.8;}#newsworks_hscatchment [ pcitymiltcte <= 100] {polygon-fill: #3182BD;}#newsworks_hscatchment [ pcitymiltcte <= 10] {polygon-fill: #9ECAE1;}#newsworks_hscatchment [ pcitymiltcte <= 5] {polygon-fill: #DEEBF7;}");
          layers[1].setQuery("SELECT * FROM philadelphiaschools201201 WHERE type = 'Citywide Admission' AND grade_leve = 'High School' AND facil_type = 'School' AND active = 'y'");
		  layers[1].setCartoCSS("#philadelphiaschools201201 {[mapnik-geometry-type=point] {marker-fill: #FFFF99;marker-opacity: 1; marker-width: 6; marker-line-opacity: 0; marker-placement: point;marker-type: ellipse;marker-allow-overlap: true;}} ");
		  CartoDBLegend(bins_cityWide,title_cityWide);
		  return true;
        }	
    }	


	
	
  }