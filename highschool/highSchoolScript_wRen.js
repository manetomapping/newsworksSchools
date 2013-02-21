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
          "#2E3F8A": "High (40.7 to 100%)",
		  "#4A60C3": "Above average (30.7 to 40.6%)",
		  "#8A98D8": "Below average (20.7 to 30.6%)",
		   "#CAD0ED": "Low (0 to 20.6%)"
        };
	bins_charter = {
           "#2E3F8A": "High (32.9 to 100%)",
		   "#4A60C3": "Above average (26.4 to 32.8%)",
		   "#8A98D8": "Below average (20.0 to 26.3%)",
		   "#CAD0ED": "Low (0 to 19.9%)",

        };

	bins_specAdmit = {
	      "#2E3F8A": "High (26.8 to 100%)",
		  "#4A60C3": "Above average (18.4 to 26.7%)",
		  "#8A98D8": "Below average (10.0 to 18.3%)",
		  "#CAD0ED": "Low (0 to 9.9%)",

        };
		
	bins_cityWide = {
          "#2E3F8A": "High (14.4 to 100%)",
		  "#4A60C3": "Above average (11.2 to 14.3%)",
		  "#8A98D8": "Below average (8.1 to 11.1%)",
		  "#CAD0ED": "Low (0 to 8.0%)",
		  
          
          
		  
        };
	
	var title_nabe = 'Percent of students attending their own NEIGHBORHOOD HIGH SCHOOL'; 
	var title_charter = 'Percent of students attending a CHARTER HIGH SCHOOL';
	var title_specAdmit = 'Percent of students attending a MAGNET HIGH SCHOOL';
	var title_cityWide = 'Percent of students attending a CITYWIDE, VO-TECH, OR MILITARY HIGH SCHOOL';
	
    L.tileLayer('https://dnv9my2eseobd.cloudfront.net/v3/cartodb.map-4xtxp73f/{z}/{x}/{y}.png', {
      attribution: 'MapBox'
    }).addTo(map);
    
	var layerUrl_schools = 'http://manetomapping.cartodb.com/api/v1/viz/19592/viz.json';
	var layerUrl_HSCatch = 'http://manetomapping.cartodb.com/api/v1/viz/19503/viz.json';

	//add the schools layer
    var layerOptions_schools = {
             query: "SELECT * FROM {{table_name}} WHERE action = 'Close'",
              //tile_style: "#{{table_name}}{marker-fill: #F84F40; marker-width: 8; marker-line-color: white; marker-line-width: 2; marker-clip: false; marker-allow-overlap: true;} "
			  tile_style: "#philadelphiaschools201201 [instit_typ = 'District'] {[mapnik-geometry-type=point] {marker-fill: #FFFF99;marker-opacity: 0; marker-width: 12; marker-line-opacity: 0; marker-placement: point;marker-type: ellipse;marker-allow-overlap: true;}}#philadelphiaschools201201 [instit_typ = 'Charter'] {[mapnik-geometry-type=point] { marker-fill: #386CB0; marker-opacity: 0; marker-width: 12;marker-line-opacity: 0; marker-placement: point;marker-type: ellipse;marker-allow-overlap: true;}}#schoolclosings [expanded_seats = ''] [instit_typ = 'Charter' ] {[mapnik-geometry-type=point] {marker-fill: #386CB0;marker-opacity: .3;marker-width: 12;marker-line-opacity: 0;marker-placement: point; marker-type: ellipse;marker-allow-overlap: true;}}"
	}

	var layerOptions_HSCatch = {
			  query: 'SELECT total as "Total public school students in attendance zone", p_innabe as "% attending own NEIGHBORHOOD HIGH SCHOOL", pcharterall as "% attending a CHARTER", pspecadmit as "% attending a MAGNET HIGH SCHOOL",pcitymiltcte as "% attending a CITYWIDE, VO-TECH, OR MILITARY HIGH SCHOOL", * FROM newsworks_hscatchment',
			  tile_style: "#newsworks_hscatchment{line-color: #FFF;line-opacity: 0.7;line-width: 0.5;polygon-opacity: 0.8;}#newsworks_hscatchment [ p_innabe <= 100] {polygon-fill: #2E3F8A;}#newsworks_hscatchment [ p_innabe <= 40.7] {polygon-fill: #4A60C3;} #newsworks_hscatchment [ p_innabe <= 30.7] {polygon-fill: #8A98D8;}#newsworks_hscatchment [ p_innabe <= 20.7]{polygon-fill: #CAD0ED;}"
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
        var key = $('<span>').attr('class', 'box'); // can take 'box', 'line', or 'circle' type here for customizing your legend
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
		  layers[1].setCartoCSS("#philadelphiaschools201201 {[mapnik-geometry-type=point] {marker-fill: #FF0000;marker-opacity: 0; marker-line-opacity: 0; }} ");
          return true;
        },
      close: function(){
          layers[1].setQuery("SELECT * FROM philadelphiaschools201201 WHERE action IS NOT NULL AND facil_type = 'School' AND grade_leve ='High School'");
		  layers[1].setCartoCSS("#philadelphiaschools201201 {[mapnik-geometry-type=point] {marker-fill: #FF0000;marker-opacity: 1; marker-width: 4; marker-line-opacity: 0; marker-placement: point;marker-type: ellipse;marker-allow-overlap: true;}} ");
          return true;
        },
	  pcharter: function(){
          layers[0].setCartoCSS("#newsworks_hscatchment{line-color: #FFF;line-opacity: 0.7;line-width: 0.5;polygon-opacity: 0.8;}#newsworks_hscatchment [ pcharterall <= 100] {polygon-fill: #2E3F8A;}#newsworks_hscatchment [ pcharterall <= 32.9] {polygon-fill: #4A60C3;}#newsworks_hscatchment [ pcharterall <= 26.4] {polygon-fill: #8A98D8;}#newsworks_hscatchment [ pcharterall <= 20.0]  {polygon-fill: #CAD0ED;}");
          layers[1].setQuery("SELECT * FROM philadelphiaschools201201 WHERE instit_typ = 'Charter' AND grade_leve = 'High School' AND facil_type = 'School' AND active = 'y'");
		 layers[1].setCartoCSS("#philadelphiaschools201201 {[mapnik-geometry-type=point] {marker-fill: #FFFFFF;marker-opacity: .7; marker-width: 4; marker-line-opacity: 0; marker-placement: point;marker-type: ellipse;marker-allow-overlap: true;}} ");
		  CartoDBLegend(bins_charter,title_charter);
		  return true;
        },
	  pneighborhood: function(){
		  layers[0].setCartoCSS("#newsworks_hscatchment{line-color: #FFF;line-opacity: 0.7;line-width: 0.5;polygon-opacity: 0.8;}#newsworks_hscatchment [ p_innabe <= 100] {polygon-fill: #2E3F8A;}#newsworks_hscatchment [ p_innabe <= 40.7] {polygon-fill: #4A60C3;} #newsworks_hscatchment [ p_innabe <= 30.7] {polygon-fill: #8A98D8;}#newsworks_hscatchment [ p_innabe <= 20.7]{polygon-fill: #CAD0ED;}");
          layers[1].setQuery("SELECT * FROM philadelphiaschools201201 WHERE instit_typ = 'District' AND grade_leve = 'High School' AND facil_type = 'School' AND active = 'y' AND type IS NULL ");
		  layers[1].setCartoCSS("#philadelphiaschools201201 {[mapnik-geometry-type=point] {marker-fill: #FFFFFF;marker-opacity: .7; marker-width: 4; marker-line-opacity: 0; marker-placement: point;marker-type: ellipse;marker-allow-overlap: true;}} ");
		  CartoDBLegend(bins_nabe,title_nabe);
		  return true;
        },
	  pSpecAdmit: function(){
		  layers[0].setCartoCSS("#newsworks_hscatchment{line-color: #FFF;line-opacity: 0.7;line-width: 0.5;polygon-opacity: 0.8;}#newsworks_hscatchment [ pspecadmit <= 100]{polygon-fill: #2E3F8A;}#newsworks_hscatchment [ pspecadmit <= 26.8] {polygon-fill: #4A60C3;}#newsworks_hscatchment [ pspecadmit <= 18.4] {polygon-fill: #8A98D8;}#newsworks_hscatchment [ pspecadmit <= 10.0] {polygon-fill: #CAD0ED;polygon-opacity: 0.9;}");
          layers[1].setQuery("SELECT * FROM philadelphiaschools201201 WHERE type = 'Special Admission' AND (grade_leve = 'High School' OR grade_leve = 'Middle/High' )AND facil_type = 'School' AND active = 'y'");
		  layers[1].setCartoCSS("#philadelphiaschools201201 {[mapnik-geometry-type=point] {marker-fill: #FFFFFF;marker-opacity: .7; marker-width: 4; marker-line-opacity: 0; marker-placement: point;marker-type: ellipse;marker-allow-overlap: true;}} ");
		  CartoDBLegend(bins_specAdmit,title_specAdmit);
		  return true;
        },		
	  pCitywide: function(){
		  layers[0].setCartoCSS("#newsworks_hscatchment{line-color: #FFF;line-opacity: 0.7;line-width: 0.5;polygon-opacity: 0.8;}#newsworks_hscatchment [ pcitymiltcte <= 100] {polygon-fill: #2E3F8A;}#newsworks_hscatchment [ pcitymiltcte <= 14.4] {polygon-fill: #4A60C3;}#newsworks_hscatchment [ pcitymiltcte <= 11.2] {polygon-fill: #8A98D8;}#newsworks_hscatchment [ pcitymiltcte <= 8.1] {polygon-fill: #CAD0ED;}");
          layers[1].setQuery("SELECT * FROM philadelphiaschools201201 WHERE type = 'Citywide Admission' AND grade_leve = 'High School' AND facil_type = 'School' AND active = 'y'");
		  layers[1].setCartoCSS("#philadelphiaschools201201 {[mapnik-geometry-type=point] {marker-fill: #FFFFFF;marker-opacity: .7; marker-width: 4; marker-line-opacity: 0; marker-placement: point;marker-type: ellipse;marker-allow-overlap: true;}} ");
		  CartoDBLegend(bins_cityWide,title_cityWide);
		  return true;
        }	
    }	


	
	
  }