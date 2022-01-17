import { Controller } from "@hotwired/stimulus"
import { Howl, Howler } from "howler"

var sounds = []
var sounds_id = []
const sound_paths = ['/sounds/0-3k.webm','/sounds/100-5k.webm','/sounds/200-1k.webm','/sounds/300-700.webm','/sounds/300-700_delay.webm']
var n_ready_sounds = 0
var ready = false;

const volumes_map = [ 
  [ 1, 0.1, 0.05, 0.05, 0.05 ],
  [ 1, 0.25, 0.15, 0.1, 0.1 ],
  [ 1, 0.65, 0.5, 0.25, 0.25 ],
  [ 0.95, 0.95, 0.85, 0.8, 0.8 ],
  [ 0.75, 0.1, 0.25, 0.15, 0.15 ],
  [ 0.3, 1, 0.05, 0.05, 0.05 ]
]

export default class extends Controller {
  connect() {
    start_sounds()
  }
  disconnect() {
    Howler.stop()
  }

  move(event) {
    if(ready){
      var rgb = obtain_rgb(event)
      var hsv = rgbToHsv(rgb[0], rgb[1], rgb[2])
      change_text(rgb,hsv)
      var volumes = calculate_volume(hsv)
      change_volume(volumes)
    } else{
      console.log("sounds not ready")
    }
  }

  exit(event) {
    change_volume([0.2, 0.2, 0.2, 0.2, 0.2])
    change_text([0,0,0],[0,0,0])
  }
}

function change_volume(new_volumes){
  sounds.forEach(function (sound, index) { 
    let old_volume = sound.volume(sounds_id[index])
    sound.fade(old_volume, new_volumes[index], 500, sounds_id[index])
  } )
}

/**
 * hsv -> hue, saturation, value
 * based on saturation, this function changes global volume
 * saturation-0.50 * 2
 * 
 * based on value, this function changes single tracks volume
 * using volumes_map
 */
function calculate_volume(hsv){
  var global_volume = (hsv[1]/2)+ 0.5
  var new_volumes = []
  if(hsv[2]<0.17){
    new_volumes = volumes_map[0].map((num) =>{return num*global_volume})
  } else if(hsv[2]<0.34){
    new_volumes = volumes_map[1].map((num) =>{return num*global_volume})
  } else if(hsv[2]<0.50){
    new_volumes = volumes_map[2].map((num) =>{return num*global_volume})
  } else if(hsv[2]<0.66){
    new_volumes = volumes_map[3].map((num) =>{return num*global_volume})
  } else if(hsv[2]<0.83){
    new_volumes = volumes_map[4].map((num) =>{return num*global_volume})
  } else {
    new_volumes = volumes_map[5].map((num) =>{return num*global_volume})
  }
  return new_volumes
}

function obtain_rgb(event){
  var img = document.getElementById('art');
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);

    var pos = findPos(document.getElementById('art'));
    var x = event.pageX - pos.x;
    var y = event.pageY - pos.y;
    return canvas.getContext('2d').getImageData(x, y, 1, 1).data;
}

function start_sounds() {
  sound_paths.forEach( function (path,index) {
    sounds[index] = new Howl({
      src: [path],
      loop: true,
      volume: 0.2,
      onload: function () {
        n_ready_sounds ++
        if (n_ready_sounds >= 5) {
          sounds_id = sounds.map((sound) => { sound.play() })
          ready = true;
        }
      }
    })
  })
}

function change_text(rgb,hsv) {
  document.getElementById('r-input').value = rgb[0]
  document.getElementById('g-input').value = rgb[1]
  document.getElementById('b-input').value = rgb[2]
  
  document.getElementById('h-input').value = Math.round(hsv[0]*100)
  document.getElementById('s-input').value = Math.round(hsv[1]*100)
  document.getElementById('v-input').value = Math.round(hsv[2]*100)
}

// utility functions
function findPos(obj) {
  var curleft = 0, curtop = 0;
  if (obj.offsetParent) {
      do {
          curleft += obj.offsetLeft;
          curtop += obj.offsetTop;
      } while (obj = obj.offsetParent);
      return { x: curleft, y: curtop };
  }
  return undefined;
}

function rgbToHsv(r, g, b) {
  r /= 255, g /= 255, b /= 255;

  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, v = max;
  var d = max - min;
  s = max == 0 ? 0 : d / max;

  if (max == min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }
  return [ h, s, v ];
}