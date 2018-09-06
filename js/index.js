/* MIT License. Copyright (c) 2018 Rouzbeh Hz */

var colors = [ '#FFAE42', '#C5E384', '#FCE883', '#CDA4DE', '#FC6C85', '#FF43A4', '#A2ADD0', '#FFFFFF', '#8F509D', '#FFA089', '#F75394', '#324AB2', '#926EAE', '#FFFF66', '#77DDE7', '#DEAA88', '#17806D', '#DBD7D2', '#FC89AC', '#EBC7DF', '#18A7B5', '#FAA76C', '#FD5E53', '#FFCF48', '#ECEABE', '#80DAEB', '#CDC5C2', '#FB7EFD', '#45CEA2', '#8A795D', '#A5694F', '#9FE2BF', '#76FF7A', '#FC2847', '#FF9BAA', '#7851A9', '#1FCECB', '#C0448F', '#FF5349', '#EE204D', '#E3256B', '#FF48D0', '#714B23', '#D68A59', '#FF496C', '#FE4EDA', '#9D81BA', '#7442C8', '#8E4585', '#F78FA7', '#FC74FD', '#158078', '#FDDDE6', '#C5D0E6', '#FFCFAB', '#1CA9C9', '#FF6E4A', '#414A4C', '#E6A8D7', '#F8D568', '#FF2B2B', '#FF7538', '#BAB86C', '#FFA343', '#1974D2', '#C54B8C', '#30BA8F', '#1A4876', '#FDBCB4', '#EF98AA', '#C8385A', '#FF8243', '#979AAA', '#EDD19C', '#CD4A4C', '#AAF0D1', '#F664AF', '#FFBD88', '#FFF44F', '#FCB4D5', '#FEFE22', '#3BB08F', '#CA3767', '#5D76CB', '#B2EC5D', '#FF1DCE', '#F0E891', '#1164B4', '#1CAC78', '#95918C', '#A8E4A0', '#FCD975', '#E7C697', '#CC6666', '#C364C5', '#6DAE81', '#71BC78', '#CEFF1D', '#6E5160', '#EFCDB8', '#2B6CC4', '#FDDB6D', '#FFBCD9', '#9ACEEB', '#DD9475', '#BC5D58', '#1DACD6', '#DD4492', '#FFAACC', '#1CD3A2', '#FFFF99', '#B0B7C6', '#EA7E5D', '#FF7F49', '#B4674D', '#CB4154', '#DE5D83', '#7366BD', '#0D98BA', '#6699CC', '#A2A2D0', '#1F75FE', '#ACE5EE', '#000000', '#FD7C6E', '#9F8170', '#FAE7B5', '#FFA474', '#87A96B', '#78DBE2', '#FDD9B5', '#CD9575', '#EFDECD' ];

// Get images
function pad(num, size){ return ('000' + num).substr(-size); }
function loadImages(){
  var colorMap = {};
  for (var i=0; i<colors.length; i++){
    let imgNum = pad(i+1 , 4);
    img = 'blocks/crayon-circles/' + imgNum + '.png';
    colorMap[colors[i]] = img;
  }
  return colorMap;
}
mapBlocks = loadImages();

// Find points
function points(){
  var pointArray = [];
  var r, g, b, c;
  for (var i=0; i<colors.length; i++){
    c = colors[i];
    r = parseInt("0x"+c.substr(1,2));
    g = parseInt("0x"+c.substr(3,2));
    b = parseInt("0x"+c.substr(5,2));
    pointArray.push([r, g, b, c]);
  }
  return pointArray;
}
blockInts = points();

// For a given RGB color, find the closest match Block.
function closestBlock(color) {
  var distance = 200;
  var c, d, p;
  for (var i=0; i<blockInts.length; i++){
    p = blockInts[i];
    d = Math.sqrt( Math.pow((color[0]-p[0]), 2) + Math.pow((color[1]-p[1]), 2) + Math.pow((color[2]-p[2]), 2) );
    if (d < distance){
      distance = d;
      c = p[3];
    }
  }
  return mapBlocks[c];
}

// Create a new Block Mosaic.
function BlockMosaic(dataURI) {
  let img = this.img = new Image();
  this.dataURI = dataURI;
  img.addEventListener( 'load', this.imageLoaded.bind( this ) );
  img.src = this.dataURI;
}

// After the image is loaded, create the layout.
BlockMosaic.prototype.imageLoaded = function() {
  let margin = 150,
      createSample,
      samples,
      ratio,
      done;

  let userQ = document.querySelector('input[name="userQuality"]:checked').value;
  let rotateBlocks = document.querySelector('input[name="rotateBlocks"]:checked').value;
  console.log(userQ)
  console.log(rotateBlocks)
  // Set user settings
  // Quality
  if ( userQ == 'insaneQ' ) {
    this.blockN = 2;
    this.blockW = 10;
    this.blockH = 10;
    this.numQ = 1.25;
  }
  else if ( userQ == 'highQ' ) {
    this.blockN = 2;
    this.blockW = 10;
    this.blockH = 10;
    this.numQ = 1;
  }
  else if ( userQ == 'averageQ' ) {
    this.blockN = 3;
    this.blockW = 15;
    this.blockH = 15;
    this.numQ = 1;
  }
  else {
    this.blockN = 3;
    this.blockW = 15;
    this.blockH = 15;
    this.numQ = 1;
  }

  // If the image is too big, make the dimensions smaller.
  ratio = ( window.innerWidth * this.numQ ) / ( this.img.width + margin  );
  this.img.height *= ratio;
  this.img.width *= ratio;

  // A canvas element for extracting image pixel color data.
  this.extractionCanvas = document.createElement('canvas');
  const _tec = this.extractionCanvas;
  _tec.width = this.img.width;
  _tec.height = this.img.height;
  this.extractionCanvasContext = _tec.getContext('2d');
  const _t_ecc = this.extractionCanvasContext;
  _t_ecc.drawImage(this.img, 0, 0, _tec.width, _tec.height );

  // A canvas element that will be drawn to with Block.
  this.targetCanvas = document.createElement('canvas');
  const _tc = this.targetCanvas;
  _tc.width = _tec.width + (margin * 2) - 5 ;
  _tc.height = _tec.height + (margin * 2) - 5 ;

  this.targetCanvasContext = _tc.getContext('2d');
  const _t_cc = this.targetCanvasContext;

  // Fill a background.
  _t_cc.fillStyle = '#ffffff';
  _t_cc.fillRect( 0, 0, _tc.width, _tc.height );

  // Append image to DIV#holder
  document.getElementById('holder').prepend( _tc );
  createSample = poissonDiscSampler(_tc.width, _tc.height, this.blockN);
  samples = [];

  // Create an array of samples
  while (true) {
    const s = createSample();
    // If the sample limit is reached, break
    if (!s) break;
    // If samples are out of view, ignore and continue
    if ( s[0] < margin || s[1] < margin ) { continue; }
    if ( s[0] > _tc.width - margin || s[1] > _tc.height - margin ) { continue; }
    samples.push(s);
  }

  let blockRendered = 0;
  // Find the correct block for each point
  samples.forEach(function(sample){
    let imageData, sums, i, red, green, blue, closest;
    // Get image pixel data.
    imageData = _t_ecc.getImageData(Math.round( sample[0] - margin ), Math.round( sample[1] - margin ), 1, 1);
    sums = { red: 0, green: 0, blue: 0 };
    for ( i = 0; i < imageData.data.length; i++ ) {
      switch ( i % 4 ) {
        case 0: sums.red += imageData.data[i]; break;
        case 1: sums.green += imageData.data[i]; break;
        case 2: sums.blue += imageData.data[i]; break;
      }
    }
    red = sums.red / ( imageData.data.length / 4 );
    green = sums.green / ( imageData.data.length / 4 );
    blue = sums.blue / ( imageData.data.length / 4 );
    closest = closestBlock( [ red, green, blue ] );
    blockImage = new Image();
    blockImage.src = closest;
    blockImage.setAttribute('data-x', sample[0]);
    blockImage.setAttribute('data-y', sample[1]);
    // Draw image on canvas depending on quality level
    blockImage.onload = (function(event){
      let image = event.target;
      _t_cc.save();
      _t_cc.translate( image.getAttribute('data-x'), image.getAttribute('data-y') );
      if ( rotateBlocks == 'true' ) { 
        _t_cc.rotate( Math.ceil( Math.random() * 60 ));
      }
      _t_cc.drawImage( image, -15, -15, this.blockW, this.blockH );
      _t_cc.restore();
      blockRendered++;
      if ( blockRendered === samples.length ) {
        // FINISH RENDER!
        console.log(done);
      }
    }).bind(this);
  }, this );
};

function dataURItoBlob(dataURI) {
  let binary = atob(dataURI.split(',')[1]);
  let array = [];
  for(var i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
}

// Drag and drop file for upload
let target = document.documentElement,
  body = document.body,
  fileInput = document.getElementById('userImg');
target.addEventListener('dragover', (e) => { e.preventDefault(); body.classList.add('dragging'); });
target.addEventListener('dragleave', () => { body.classList.remove('dragging'); });
target.addEventListener('drop', (e) => {
  e.preventDefault(); body.classList.remove('dragging');
  fileInput.files = e.dataTransfer.files;
});

// Check file type
function checkExtension() {
  let fileName = document.getElementById("userImg").value.split(".").pop().toUpperCase();
  const acceptedExtensions = [ 'JPG', 'JPEG' ]
  if ( acceptedExtensions.includes(fileName) ){ return true; }  
  else { alert("Please upload a valid image file!"); return false; }
}

// Init BlockMosiac
document.addEventListener('DOMContentLoaded', function(event) {
  let inputEl = document.getElementById('userImg');
  document.getElementById('userImg').addEventListener('change', function() {
    let fileCheck = checkExtension();
    // When a valid file is uploaded, initialize render
    if ( fileCheck == true ) {
      console.log("Running render..");
      let file = inputEl.files[0];
      let reader = new FileReader();
      reader.onloadend = function () { new BlockMosaic(reader.result); };
      reader.readAsDataURL(file);
    }
  });
});