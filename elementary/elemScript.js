var map;


  function init(){
    //initiate variables
	var bins = {};
	var title = '';
	
    // initiate leaflet map
    map = new L.Map('map', { 
      center: [ 40.01,-75.130606],
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

	
	var title_nabe = 'Percent of students attending their own <span style="text-decoration:underline;">neighborhood</span> school'; 
	var title_charter = 'Percent of students attending a <span style="text-decoration:underline;">charter</span> school';

    L.tileLayer('https://dnv9my2eseobd.cloudfront.net/v3/cartodb.map-4xtxp73f/{z}/{x}/{y}.png', {
      attribution: 'Map by <a href="http://www.manetomapping.com">Michelle Schmitt</a> and Todd Vachon for <a href="http://www.newsworks.org">NewsWorks.org</a>'
    }).addTo(map);

	var layerUrl_schools = 'http://manetomapping.cartodb.com/api/v1/viz/19592/viz.json';
	var layerUrl_elemCatch = 'http://manetomapping.cartodb.com/api/v1/viz/19364/viz.json';
	var layerURL_closures = 'http://manetomapping.cartodb.com/api/v1/viz/21843/viz.json';

	//add the schools layer
    var layerOptions_schools = {
             query: "SELECT * FROM philadelphiaschools201201 WHERE instit_typ = 'District' AND grade_leve = 'Elementary School' AND facil_type = 'School' AND active = 'y' AND type IS NULL",
              tile_style: "#philadelphiaschools201201 {[mapnik-geometry-type=point] {marker-fill: #FFFFFF;marker-opacity: .7; marker-width: 8; marker-line-opacity: 0; marker-placement: point;marker-type: ellipse;marker-allow-overlap: true;}} ",
			interactivity: "facil_name",
			infowindow: false,
			cartodb_logo: false		
	}

	var layerOptions_ESCatch = {
			  query: 'SELECT * FROM newsworks_elemcatch',
			  tile_style: "#newsworks_elemcatch{line-color: #FFF;line-opacity: .8;line-width: .5;polygon-opacity: 0.9;}#newsworks_elemcatch [ p_innabe <= 100] {polygon-fill: #AE017E;}#newsworks_elemcatch [ p_innabe <= 74.6] {polygon-fill: #F768A1;}#newsworks_elemcatch [ p_innabe <= 62.9] {polygon-fill: #FBB4B9;} #newsworks_elemcatch [ p_innabe <= 51.1] {polygon-fill: #FEEBE2;}",
			  interactivity: "cartodb_id,name,p_innabe,pcharterall,name,total,managed,psdp_out",
			  cartodb_logo: false
			  }
	
	var layerOptions_closures = {
			query: "SELECT * FROM philadelphiaschools201201_closures where cartodb_id = 0 ",
			tile_style: "#philadelphiaschools201201_closures  {[mapnik-geometry-type=point] {marker-fill: #FF0000;marker-opacity: 1; marker-width: 4; marker-line-opacity: 0; marker-placement: point;marker-type: ellipse;marker-allow-overlap: true;}} ",
			interactivity: "facil_name",
			cartodb_logo: false,
			infowindow: false
			
	}
	
    var layers = [];

	cartodb.createLayer(map, layerUrl_elemCatch, layerOptions_ESCatch)
     .on('done', function(layer) {
	  map.addLayer(layer);
      layers.push(layer);
	 layer
		.on('error', function() {
    })
		.infowindow.set('template', $('#infowindow_template').html())
	});
	CartoDBLegend(bins_nabe,title_nabe);
	
    cartodb.createLayer(map, layerUrl_schools, layerOptions_schools)
     .on('done', function(layer) {
      map.addLayer(layer);
      layers.push(layer);
	 layer
	 .on('error', function() {
	})
	  .on('featureOver', function(e, latlng, pos, data) {
		document.body.style.cursor = "pointer";
		showTooltip(data,pos)
	})
	  .on('featureOut', function(e, latlng, pos, data) {
		document.body.style.cursor = "default";
		hideTooltip();
	})
	
	
	});
	cartodb.createLayer(map, layerURL_closures, layerOptions_closures)
     .on('done', function(layer) {
      map.addLayer(layer);
      layers.push(layer);
	  layer
	  .on('error', function() {
    })
	  .on('featureOver', function(e, latlng, pos, data) {
	// Set popup content
		document.body.style.cursor = "pointer";
		showTooltip_closures(data,pos)
	})
	  .on('featureOut', function(e, latlng, pos, data) {
		document.body.style.cursor = "default";
		hideTooltip_closures();
	})

	 });
	 
	
	$('#c2').click(function() {
		if ($(this).is(':checked')) {
			layers[2].setQuery("SELECT * FROM philadelphiaschools201201_closures  WHERE action IS NOT NULL AND facil_type = 'School' AND grade_leve ='Elementary School'");
			layers[2].setCartoCSS("#philadelphiaschools201201_closures  {[mapnik-geometry-type=point] {marker-fill: #FF0000;marker-opacity: 1; marker-width: 4; marker-line-opacity: 0; marker-placement: point;marker-type: ellipse;marker-allow-overlap: true;}} ");
			return true;
        }
		else{
			layers[2].setQuery("SELECT * FROM philadelphiaschools201201_closures where cartodb_id = 0 ");
			return true;
		}
	});
	

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
	  pcharter: function(){
          layers[0].setCartoCSS("#newsworks_elemcatch{line-color: #FFF;line-opacity:.8;line-width: .5;polygon-opacity: 0.9;}#newsworks_elemcatch [ pcharterall <= 100] {polygon-fill: #AE017E;}#newsworks_elemcatch [ pcharterall <= 29.6] {polygon-fill:#F768A1;}  #newsworks_elemcatch [ pcharterall <= 21.3] {polygon-fill: #FBB4B9;}#newsworks_elemcatch [ pcharterall <= 12.9] {polygon-fill: #FEEBE2;}");
          layers[1].setQuery("SELECT * FROM philadelphiaschools201201 WHERE instit_typ = 'Charter' AND grade_leve = 'High School' AND facil_type = 'School' AND active = 'y'");
		 layers[1].setCartoCSS("#philadelphiaschools201201 {[mapnik-geometry-type=point] {marker-fill: #FFFFFF;marker-opacity: .7; marker-width: 4; marker-line-opacity: 0; marker-placement: point;marker-type: ellipse;marker-allow-overlap: true;}} ");
		  CartoDBLegend(bins_charter,title_charter);
		  return true;
        },
	  pneighborhood: function(){
		  layers[0].setCartoCSS("#newsworks_elemcatch{line-color: #FFF;line-opacity: .8;line-width: .5;polygon-opacity: 0.9;}#newsworks_elemcatch [ p_innabe <= 100] {polygon-fill: #AE017E;}#newsworks_elemcatch [ p_innabe <= 74.6] {polygon-fill: #F768A1;}#newsworks_elemcatch [ p_innabe <= 62.9] {polygon-fill: #FBB4B9;} #newsworks_elemcatch [ p_innabe <= 51.1] {polygon-fill: #FEEBE2;}");
		  layers[1].setCartoCSS("#philadelphiaschools201201 {[mapnik-geometry-type=point] {marker-fill: #FFFFFF;marker-opacity: .7; marker-width: 4; marker-line-opacity: 0; marker-placement: point;marker-type: ellipse;marker-allow-overlap: true;}} ");
		  layers[1].setQuery("SELECT * FROM philadelphiaschools201201 WHERE instit_typ = 'District' AND grade_leve = 'Elementary School' AND facil_type = 'School' AND active = 'y' AND type IS NULL");
		  CartoDBLegend(bins_nabe,title_nabe);
		  return true;
    }	
	}

 function showTooltip(data,point) {
      var html = "";
     
      var name = (data["facil_name"]!="")?data["facil_name"]:"Unknown";
      html += "<p>" + name +"</p>";

           
      $("#tooltip").html(html);
      $("#tooltip").css({left: (point.x + 15) + 'px', top: point.y - ($("#tooltip").height()) + 10 + 'px'})
      $("#tooltip").show();
    }
 
    function hideTooltip() {
      $("#tooltip").hide();
    }

	//show tool tip for closing schools
 function showTooltip_closures(data,point) {
      var html = "";
     
      var name = (data["facil_name"]!="")?data["facil_name"]:"Unknown";
      html += "<p>" + name +"</p>";

           
      $("#tooltip_closures").html(html);
      $("#tooltip_closures").css({left: (point.x + 15) + 'px', top: point.y - ($("#tooltip_closures").height()) + 10 + 'px'})
      $("#tooltip_closures").show();
    }
 
    function hideTooltip_closures() {
      $("#tooltip_closures").hide();
    }

	
  }

	
	
  
