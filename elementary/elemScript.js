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
          "#AE017E": "High (74.7 - 100%)",
          "#F768A1": "Above Average (62.8 - 74.6%)",
          "#FBB4B9": "Below Average (51.2 to 62.7%)",
          "#FEEBE2": "Low (0 to 51.1%)"
        };
	bins_charter = {
          "#AE017E": "High (29.6 - 100%)",
          "#F768A1": "Above Average (21.2 - 29.5%)",
          "#FBB4B9": "Below Average (12.9 - 21.1%)",
          "#FEEBE2": "Low (0 - 12.8%)"
        };
	
	
	var title_nabe = '% of students attending their own<br>NEIGHBORHOOD SCHOOL'; 
	var title_charter = '% of students attending a<br>CHARTER SCHOOL';
	
    L.tileLayer('https://dnv9my2eseobd.cloudfront.net/v3/cartodb.map-4xtxp73f/{z}/{x}/{y}.png', {
      attribution: 'MapBox'
    }).addTo(map);
    
	var layerUrl_schools = 'http://manetomapping.cartodb.com/api/v1/viz/19592/viz.json';
	var layerUrl_elemCatch = 'http://manetomapping.cartodb.com/api/v1/viz/19364/viz.json';

	//add the schools layer
    var layerOptions_schools = {
             query: "SELECT * FROM {{table_name}} WHERE action = 'Close'",
              //tile_style: "#{{table_name}}{marker-fill: #F84F40; marker-width: 8; marker-line-color: white; marker-line-width: 2; marker-clip: false; marker-allow-overlap: true;} "
			  tile_style: "#philadelphiaschools201201 [instit_typ = 'District'] {[mapnik-geometry-type=point] {marker-fill: #FFFF99;marker-opacity: 0; marker-width: 12; marker-line-opacity: 0; marker-placement: point;marker-type: ellipse;marker-allow-overlap: true;}}#philadelphiaschools201201 [instit_typ = 'Charter'] {[mapnik-geometry-type=point] { marker-fill: #386CB0; marker-opacity: 0; marker-width: 12;marker-line-opacity: 0; marker-placement: point;marker-type: ellipse;marker-allow-overlap: true;}}#schoolclosings [expanded_seats = ''] [instit_typ = 'Charter' ] {[mapnik-geometry-type=point] {marker-fill: #386CB0;marker-opacity: .3;marker-width: 12;marker-line-opacity: 0;marker-placement: point; marker-type: ellipse;marker-allow-overlap: true;}}"
	}

	var layerOptions_elemCatch = {
			  query: "SELECT * FROM {{table_name}}",
			  tile_style: "#newsworks_elemcatch{line-color: #FFF;line-opacity: .5;line-width: .5; polygon-fill: #BFC7CB; polygon-opacity: 0.8;}"
	}
	
    var layers = [];

	//add polygons first
	cartodb.createLayer(map, layerUrl_elemCatch, layerOptions_elemCatch)
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
        var key = $('<span>').attr('class', 'box'); // can take 'box', 'line', or 'circle' type here for customizing your ledgend
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
		  layers[1].setCartoCSS("#philadelphiaschools201201 {[mapnik-geometry-type=point] {marker-fill: #FF0000;marker-opacity: 0; marker-line-opacity: 0; }} ");
          return true;
        },
      close: function(){
          layers[1].setQuery("SELECT * FROM philadelphiaschools201201 WHERE action IS NOT NULL AND facil_type = 'School' AND grade_leve ='Elementary School'");
		  layers[1].setCartoCSS("#philadelphiaschools201201 {[mapnik-geometry-type=point] {marker-fill: #FF0000;marker-opacity: 1; marker-width: 6; marker-line-opacity: 0; marker-placement: point;marker-type: ellipse;marker-allow-overlap: true;}} ");
          return true;
        },
	  pcharter: function(){
          layers[0].setCartoCSS("#newsworks_elemcatch{line-color: #FFF;line-opacity:.8;line-width: .5;polygon-opacity: 0.9;}#newsworks_elemcatch [ pcharterall <= 100] {polygon-fill: #AE017E;}#newsworks_elemcatch [ pcharterall <= 29.6] {polygon-fill:#F768A1;}  #newsworks_elemcatch [ pcharterall <= 21.3] {polygon-fill: #FBB4B9;}#newsworks_elemcatch [ pcharterall <= 12.9] {polygon-fill: #FEEBE2;}");
          layers[1].setQuery("SELECT * FROM philadelphiaschools201201 WHERE instit_typ = 'Charter' AND(grade_leve = 'Elementary School' or grade_leve = 'Elem/Middle') AND facil_type = 'School' AND active = 'y'");
		  CartoDBLegend(bins_charter,title_charter);
		  return true;
        },
	  pneighborhood: function(){
		  layers[0].setCartoCSS("#newsworks_elemcatch{line-color: #FFF;line-opacity: .8;line-width: .5;polygon-opacity: 0.9;}#newsworks_elemcatch [ pinnabe <= 100] {polygon-fill: #AE017E;}#newsworks_elemcatch [ pinnabe <= 74.6] {polygon-fill: #F768A1;}#newsworks_elemcatch [ pinnabe <= 62.9] {polygon-fill: #FBB4B9;} #newsworks_elemcatch [ pinnabe <= 51.1] {polygon-fill: #FEEBE2;}");
          
		  CartoDBLegend(bins_nabe,title_nabe);
		  return true;
        }		
    }	


	
	
  }