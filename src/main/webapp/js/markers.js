var map;
var draw;
var vectorLayer;
var vectorSource;
var select;
var modify;
var featuresArray = new Array();
var testMarker;
var style;
var coordArray = new Array();
var interaction;                                    
var innerInteraction;   //interaction который срабатывает при наведении на элемент при выбранном "Удаление"
var revisionTests = new Array(); // массив для сравнения ревизий при изменении элемента

function markersInit(){
    
    proj4.defs("EPSG:3395","+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs");
    ol.proj.get('EPSG:3395').setExtent(
        [-20037508.342789244, -20037508.342789244, 20037508.342789244, 20037508.342789244]
    );
    
    getFromServer()          //получение элементов из базы и добавление их на карту
    
    var typeSelect = document.getElementById('type');       
    
    vectorSource = new ol.source.Vector({});        // source на котором хранятся все элементы
    
    style = new ol.style.Style({                    // стиль для отображения элементов
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: '#ffcc33',
                width: 4
            }),
            image: new ol.style.Icon({
                anchor: [0.5, 1],
                scale: 0.05,
                src: 'image/marker.png'
            })
        });
        
        var selstyle = new ol.style.Style({        // стиль для отображения элементов при наведении
            fill: new ol.style.Fill({
                color: 'rgba(0, 0, 255, 0.5)'
            }),
            stroke: new ol.style.Stroke({
                color: '#0000ff',
                width: 4
            }),
            image: new ol.style.Icon({
                anchor: [0.5, 1],
                scale: 0.05,
                src: 'image/selmarker.png'
            })
        });
        
    vectorLayer = new ol.layer.Vector({                 // вектор элементов
        source: vectorSource,
        style: style
    });
    
    draw = new ol.interaction.Draw({                    // interaction которая активна при первом запуске
        source: vectorSource,
        type: typeSelect.value
      });
    draw.on('drawend', function(evt){                   // обработчик нажатия
        var feature = evt.feature;
        //var p = feature.getGeometry();
        evt.feature.setId(new Date().getTime());
        createJSON(typeSelect.value, feature);
    });
    
    interaction = draw;                                 // для того чтобы можно было удалять текущий interaction при смене действия
     
    map = new ol.Map({                                  // инициализация карты
        interactions: ol.interaction.defaults().extend([interaction]),
        target: 'OLmap',
        layers: [
            new ol.layer.Tile({
                title: "OSM",
                type: "base",
                source: new ol.source.OSM()
            }),
            new ol.layer.Tile({
                title: "Яндекс",
                type: "base",
                opacity: 0.9,
                visible: true,
     
                source: new ol.source.XYZ({
                    url: 'http://vec0{1-4}.maps.yandex.net/tiles?l=map&x={x}&y={y}&z={z}',
                    projection: 'EPSG:3395'
                })
            }),
            vectorLayer
        ],
        
        view: new ol.View({                             //центрирование и зум
            center: ol.proj.fromLonLat([39.2266, 51.6553]),
            zoom: 14
        })
    });
    
    var layerSwitcher = new ol.control.LayerSwitcher({
        tipLabel: 'Légende' // Optional label for button
    });
    map.addControl(layerSwitcher);
    
    typeSelect.onchange = function() {
        map.removeInteraction(interaction);
        switch (typeSelect.value){
            case "Point":
                if(innerInteraction !== null){          //для того чтобы не смешивались два интерактива
                    map.removeInteraction(innerInteraction)
                }
                drawCreate("Point");
                break;
                
            case "LineString":
                if(innerInteraction !== null){
                    map.removeInteraction(innerInteraction)
                }
                drawCreate("LineString");
                break;
                
            case "Polygon":
                if(innerInteraction !== null){
                    map.removeInteraction(innerInteraction)
                }
                drawCreate("Polygon");
                break;
                
            case "Modify":
                if(innerInteraction !== null){
                    map.removeInteraction(innerInteraction)
                }
                interaction = new ol.interaction.Modify({
                    features: new ol.Collection(vectorSource.getFeatures())
                });
                revisionTests = [];             
                for (var i = 0; i < vectorSource.getFeatures().length; i++){
                    revisionTests.push(2);
                }
                
                interaction.on('modifyend', function(e) {
                    var features = e.features.getArray();
                    console.log(features.length);
                    //сравниваем текущие значения ревизий с предыдущими, если изменяются - вызываем update в базе
                    for (var i = 0; i < features.length; i++) {
                        var rev = features[i].getRevision();
                        if (rev > revisionTests[i]) {
                            revisionTests[i] = rev;
                            console.log(features[i])
                            updateSend(features[i].getGeometry().getType(), features[i])
                        }
                    }
                });
                map.addInteraction(interaction);
                break;
                
            case "Select":
                if(innerInteraction != null){  
                        map.removeInteraction(innerInteraction)
                    }
                interaction = new ol.interaction.Select({      // основной интерактив обрабатывает наведение на элемент
                    style: selstyle,
                    condition: ol.events.condition.pointerMove
                });
                interaction.on("select",function(evt){
                   if(innerInteraction != null){
                        map.removeInteraction(innerInteraction)
                    }
                    innerInteraction = new ol.interaction.Select({ // внитренний интерактив обрабатывает нажатие на наведенный элемент
                        style: null
                    })
                    if(innerInteraction != null){
                        map.removeInteraction(innerInteraction)
                    }
                    innerInteraction.on("select",function(event){
                        var id = event.selected[0].a;
                        deleteFeature(id);
                        vectorSource.removeFeature(event.selected[0])
                    });
                    map.addInteraction(innerInteraction);
                })
                map.addInteraction(interaction);
                break;
        }
};
}
function drawCreate(type){   //создание интерактива выбранного типа
    draw = new ol.interaction.Draw({
        source: vectorSource,
        type: type
    })
    
    draw.on('drawend', function(evt){
        var feature = evt.feature;
        evt.feature.setId(new Date().getTime());
        createJSON(type, feature)
    });
    interaction = draw;
    map.addInteraction(interaction);
}

function createJSON(type, feature){       //Создает JSON и отправляет его на сервер
    var coords = {
        type : type,
        id: feature.a,
        coord: feature.getGeometry().B
    }
    var str = JSON.stringify(coords);
    $.ajax({
        url: 'MarkersServlet',
        type: 'POST',
        data: str,
        success: function (featureFromServer) {}
    })
}

function getFromServer(){      // получение элементов из базы данных  и добавление на слой
    
    $.ajax({
        url: 'GetDataServlet',
        type: 'POST',
        success: function (data) {
            var tmpFeature;
            fromServer = data.split('/');
            for (var i = 0; i< fromServer.length-1; i++){
                tmpFeature = JSON.parse(fromServer[i]);
                addFeatureFromDB(tmpFeature.type, tmpFeature.coord, tmpFeature.id)
            }
        }
    })
}

function addFeatureFromDB(type, coords, id){    //добавление элементов из базы на слой
    var addingFeature;
    
    switch (type){
        case "Point":
            addingFeature = new ol.Feature({
                style: style.image,
                geometry: new ol.geom.Point(coords)
            });
            addingFeature.setId(id);
            vectorSource.addFeature(addingFeature)
            break;
        case "LineString":
            coordArray.length = 0;
            
            for(var i = 0; i <= coords.length-2; i=i+2){  // для линии нужен массив точек. точка - массив из широты и долготы
                var tmpArray = new Array();
                tmpArray.push(coords[i]);
                tmpArray.push(coords[i+1]);
                coordArray.push(tmpArray);
            }
            addingFeature = new ol.Feature({
                style: style.stroke,
                geometry: new ol.geom.LineString(coordArray)
            }); 
            addingFeature.setId(id);
            vectorSource.addFeature(addingFeature);
            break;
        case "Polygon":
             coordArray.length = 0;
            
            for(var i = 0; i <= coords.length-2; i=i+2){ //для полигона нужен LineString запакованный в массив 
                var tmpArray = new Array();
                tmpArray.push(coords[i]);
                tmpArray.push(coords[i+1]);
                coordArray.push(tmpArray);
            }
            var polyArray = new Array();
            polyArray.push(coordArray);
            addingFeature = new ol.Feature({
                style: style.fill,
                geometry: new ol.geom.Polygon(polyArray)
            }); 
            addingFeature.setId(id);
            vectorSource.addFeature(addingFeature);
            break;
    }
}

function deleteFeature(id){    // отправляет на сервер запрос на удаление из базы
    
    $.ajax({
        url: "DeleteFeatureServlet",
        type: "POST",
        data: String(id),
        succes: function(data){}
    })
}

function updateSend(type, feature){   // отправляет на сервер запрос на обновление элемента базы
    var coords = {
        type : type,
        id: feature.a,
        coord: feature.getGeometry().B
    }
    var str = JSON.stringify(coords);
    $.ajax({
        url: 'UpdateServlet',
        type: 'POST',
        data: str,
        success: function (featureFromServer) {}
    })
}


