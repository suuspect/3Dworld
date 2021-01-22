import * as THREE from './node_modules/three/build/three.module.js'
import * as CANNON from './node_modules/cannon-es/dist/cannon-es.js'
import { PointerLockControls } from './customPackage/controls/PointerLockControls.js'
import CannonDebugRenderer from './customPackage/CannonDebugRenderer.js';
import {GLTFLoader} from './customPackage/loader/GLTFLoader.js'
import { threeToCannon } from './node_modules/three-to-cannon/index.js';
//import threex.domevents from '/customPackage/domevents/threex.domevents.js';
//var ImageToHeightmap = require'/node_modules/image-to-heightmap/src/image-to-heightmap.js'

// import { Scene } from '/node_modules/three/build/three.module.js'
// import { World } from '/node_modules/cannon-es/dist/cannon-es.js'
//import {cannonDebugger} from '/node_modules/cannon-es-debugger/dist/cannon-es-debugger.js'

var height_scale = 3;
//1sp person login stuff
var blocker = document.getElementById('blocker')
var instructions = document.getElementById('instructions')



pointerLock();

var plane2;
var sphereShape,sphereBody,world,physicsMaterial,walls = [],balls = [],ballMeshes = [],boxes = [],boxMeshes = [],
voxels,groundBody,groundBody2,groundBodyMesh,cannonDebugRenderer;

var camera, scene, renderer,time;
var geometry, material, mesh,controls,light;
//OLDCODE
var torusGeo, torusMaterial, shaderMaterial, uniforms, buffGeo, torus;

time = Date.now()
var img = new Image();
img.src = "textures/Heightmap.png";
//img.onload = img.src = "textures/Heightmap.png";
var imgHeightmp = new Image;

//export default function renderWireframes(scene: Scene, bodies: Body[], options: DebugOptions): void


initCannon();
init();
addGround();
animate();

console.log("heyaa I am working :)");
function initCannon(){
    //img.src = "textures/Heightmap.png";
      world = new CANNON.World();
      world.quatNormalizeSkip = 0;
      world.quatNormalizeFast = false;

      var solver = new CANNON.GSSolver();

      world.defaultContactMaterial.contactEquationStiffness = 1e9;
      world.defaultContactMaterial.contactEquationRelaxation = 4;

      solver.iterations = 7;
      solver.tolerance = 0.1;
      var split = true;
      if (split) world.solver = new CANNON.SplitSolver(solver);
      else world.solver = solver;

      world.gravity.set(0, -10, 0);
      world.broadphase = new CANNON.NaiveBroadphase();
      world.broadphase.useBoundingBoxes = true;

      // Create a slippery material (friction coefficient = 0.0)
      physicsMaterial = new CANNON.Material('slipperyMaterial');
      var physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial, physicsMaterial, {
        friction: 0.0,
        restitution: 0.3,
      });
      // We must add the contact materials to the world
      world.addContactMaterial(physicsContactMaterial);

      var nx = 50,
        ny = 8,
        nz = 50,
        sx = 0.5,
        sy = 0.5,
        sz = 0.5;

      // Create a sphere
      var mass = 5, radius = 1.3;
      sphereShape = new CANNON.Sphere(radius);
      sphereBody = new CANNON.Body({ mass: mass, material: physicsMaterial });
      sphereBody.addShape(sphereShape);
      sphereBody.position.set(nx * sx * 0.5, ny * sy + radius * 2, nz * sz * 0.5);
      sphereBody.linearDamping = 0.9;
      world.addBody(sphereBody);

      var sphereChickShape = new CANNON.Sphere(5);
      var chickCircleBody = new CANNON.Body({ mass: 0, material: physicsMaterial });
      chickCircleBody.addShape(sphereChickShape);
      chickCircleBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
      chickCircleBody.position.set(85, 32, 5);
      world.addBody(chickCircleBody);
      //var quatChick = new CANNON.Quaternion(0, 0, 0, 0);
      //sphereChickShape.quaternion.set(n1, 0, 0, 0);

      // Create a plane
      var groundShape = new CANNON.Plane();
      groundBody = new CANNON.Body({ mass: 0, material: physicsMaterial });
      groundBody.addShape(groundShape);
      groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
      groundBody.position.set(0, 0, 0);
      world.addBody(groundBody);

      //box shapes:
      var chassisShape = new CANNON.Box(new CANNON.Vec3(1, 1, 3.2));
      var chassisBody = new CANNON.Body({mass: 0});
      chassisBody.addShape(chassisShape);
      //chassisBody.position.set(0, 0, 0);
      chassisBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
      chassisBody.position.set(20, 4, -40);
      chassisBody.angularVelocity.set(0, 0, 0); // initial velocity
      world.addBody(chassisBody);

      var chickShape = new CANNON.Box(new CANNON.Vec3(3, 1, 4));
      var chickBody = new CANNON.Body({mass: 0});
      chickBody.addShape(chickShape);
      //chickBody.addShape(sphereChickShape);
      chickBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
      chickBody.position.set(85, 23.5, 5);
      chickBody.angularVelocity.set(0, 0, 0); // initial velocity
      world.addBody(chickBody);
      //model2.position.set(85,23.5,5);
      //chicken Pos

      // Physics
      var body = new CANNON.Body({ mass: 0 });
      var matrix = [];
      var sizeX = 102, sizeY = 102;

      //console.log(normPixels);
      var terrain = getTerrainPixelData();
      var matrixNew = fromImage(img,img.width,img.height,0,25);

      //console.log("lengthHeight = "+ geometry.vertices.length);
      console.log("lengthMatrix = "+matrix.length);

      // var geometry = new THREE.PlaneGeometry(24*img.width/img.height, 24, img.width-1, img.height-1);
      // var trimeshShape = new CANNON.Trimesh(vertices,  indices);
      var shape = new CANNON.Heightfield(matrixNew, { elementSize: 2.0 });
      var quat = new CANNON.Quaternion(0, 0, 0, 0);
      //var quat = new CANNON.Quaternion(-0.5, 0, 0, 0.5);
      //var quat = new CANNON.Quaternion(0, 0, 0, 0);
      //var quat = new CANNON.Quaternion(24*img.width/img.height, 24, img.width-1, img.height-1);
      //var q = new THREE.Quaternion();
      //console.log("length: " + terrain.length + ", vertices length: " + geometry.vertices.length);
      quat.setFromAxisAngle( new THREE.Vector3(-1,0,0), 90 * Math.PI / 180 );
      quat.normalize();
      body.addShape(shape, new CANNON.Vec3, quat);
      body.position.set(0,0,100);
      //body.rotation.x(90);

      //model4.position.set(100,12,0);
      //body.scale.set(-5,-5,-5);
      //console.log("vertices Length+ "+body.vertices.length);
      world.addBody(body);
      // bodies.push(body);
}

function init() {

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000)
  camera.position.z = 1;


  // class ColorGUIHelper {
  //   constructor(object, prop) {
  //     this.object = object;
  //     this.prop = prop;
  //   }
  //   get value() {
  //     return `#${this.object[this.prop].getHexString()}`;
  //   }
  //   set value(hexString) {
  //     this.object[this.prop].set(hexString);
  //   }
  // }


  //var game = this;
  var white = "rgb(255,255,255)";
  scene = new THREE.Scene(white);

  scene.background = new THREE.Color(white);

  light = new THREE.PointLight(0xc4c4cc4, 10);
  light.position.set(30, 1, 20);
  scene.add(light);
  var ambient = new THREE.AmbientLight(0xffffff, 0.6)
  ambient.position.set(100, 400, 20);
  scene.add(ambient)

  scene.fog = new THREE.Fog(white, 2, 20000);

  skybox();
  objectLoader();
  modelLoader();

  //controls
  //controls = new PointerLockControls(camera, sphereBody);
  //var cannonDebugRenderer = new CannonDebugRenderer( scene, world );

  controls = new PointerLockControls(camera, sphereBody)

  cannonDebugRenderer = new CannonDebugRenderer( scene, world );

  scene.add(controls.getObject())


  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

}

function skybox(){

  let materialArray = [];
  let texture_ft = new THREE.TextureLoader().load('skybox/blizz_ft.jpg');
  let texture_bk = new THREE.TextureLoader().load('skybox/blizz_bk.jpg');
  let texture_up = new THREE.TextureLoader().load('skybox/blizz_up.jpg');
  let texture_dn = new THREE.TextureLoader().load('skybox/blizz_dn.jpg');
  let texture_rt = new THREE.TextureLoader().load('skybox/blizz_rt.jpg');
  let texture_lf = new THREE.TextureLoader().load('skybox/blizz_lf.jpg');

  materialArray.push(new THREE.MeshBasicMaterial({map: texture_ft}));
  materialArray.push(new THREE.MeshBasicMaterial({map: texture_bk}));
  materialArray.push(new THREE.MeshBasicMaterial({map: texture_up}));
  materialArray.push(new THREE.MeshBasicMaterial({map: texture_dn}));
  materialArray.push(new THREE.MeshBasicMaterial({map: texture_rt}));
  materialArray.push(new THREE.MeshBasicMaterial({map: texture_lf}));

  for (var i = 0; i < 6; i++) {
    materialArray[i].side = THREE.BackSide;
  }

  let skyboxGeo = new THREE.BoxGeometry(10000,10000,10000);
  let skybox = new THREE.Mesh(skyboxGeo,materialArray);

  scene.add(skybox);
}

function objectLoader(){

  var geometry = new THREE.PlaneGeometry(10, 10, 10);
  var material = new THREE.MeshBasicMaterial({color: 0xff0000, side: THREE.DoubleSide});
  var plane = new THREE.Mesh(geometry, material);
  plane.rotation.x = Math.PI/2;
  scene.add(plane);

  //a little box
  geometry = new THREE.BoxGeometry( 0.5, 0.5, 0.5 );
  material = new THREE.MeshNormalMaterial();
  mesh = new THREE.Mesh( geometry, material );
  scene.add( mesh );

   //img.onload = function () {
       //get height data from img
       //var data = getHeightData(img,0.5);
       // plane
      var geometry2 = new THREE.PlaneGeometry(10,10,9,9);
      //var texture = new THREE.TextureLoader().load ('textures/IslandDM3.jpg');
      let text1 = new THREE.TextureLoader().load('textures/island2.png');
      var material = new THREE.MeshLambertMaterial( { map: text1 , side: THREE.DoubleSide} );
      plane2 = new THREE.Mesh( geometry2, material );
      plane2.rotation.x = Math.PI/2;
      plane2.position.set(0, 5, 0);

      const resolution = 257;

      var matrix = [];
      for (var j = 0; j < resolution; j++) {
        matrix.push(new Float32Array(resolution));
      }

}


function modelLoader(){

  let model1, model2, model3, model4,model5, model6;

  //add names and locations of models here #SUUS
  let p1 = loadModel('letter-balloons/balloons.gltf').then(result => {  model1 = result.scene.children[0]; });
  let p2 = loadModel('models/space/scene.gltf').then(result => {  model2 = result.scene.children[0]; });
  let p3 = loadModel('models/stump/tree-stump.gltf').then(result => {  model3 = result.scene.children[0]; });
  let p4 = loadModel('models/island.glb').then(result => {  model4 = result.scene.children[0]; });
  let p5 = loadModel('models/islandCollisionMap.glb').then(result => {  model5 = result.scene.children[0]; });
  let p6 = loadModel('models/letter-balloons/balloons.gltf').then(result => {  model6 = result.scene.children[0]; });


  function loadModel(url) {
    return new Promise(resolve => {
      new GLTFLoader().load(url, resolve);
      });
  }

  Promise.all([p1,p2,p3,p4,p5, p6]).then(() => {
     //do something to the model1
    //  model1.position.set(60,0.1,-100);
    //  var scaleSizeModel1 = 3;
    //  model1.scale.set(scaleSizeModel1,scaleSizeModel1,scaleSizeModel1);
    //    var textureLoader = new THREE.TextureLoader();
    //    var texture = textureLoader.load('textures/godzilla.jpg');
    //    var normTexture = textureLoader.load('textures/godzilla_normalmap.png');
    //    var material = new THREE.MeshBasicMaterial();
    //    //bot = gltf.scene.children[0];
    //    material.metalness = 0;
    //    material.map = texture;
    //    material.bumpMap = normTexture;
    //    //model1.castShadow = true;
    //    model1.traverse( function ( model1 ) {
    //      if ( model1 instanceof THREE.Mesh ) {
    //           model1.material = material;
    //      }
    //    } );


    var scaleSizeModel1 = 35;
    model1.scale.set(scaleSizeModel1,scaleSizeModel1,scaleSizeModel1);
    model1.position.set(20,-9,25);
    //model1.rotation.x = Math.PI/2;

    var scaleSizeModel2 = 4000;
    model2.scale.set(scaleSizeModel2,scaleSizeModel2,scaleSizeModel2);
    model2.position.set(10,50,0);
    //model2.rotation.x = Math.PI/2;

    var scaleSizeModel3 = 3;
    model3.scale.set(scaleSizeModel3,scaleSizeModel3,scaleSizeModel3);
    model3.position.set(100,0,-0);
    //model3.rotation.x = Math.PI/2;

    var scaleSizeModel4 = 400;
    model4.scale.set(scaleSizeModel4,scaleSizeModel4,scaleSizeModel4);
    model4.position.set(50,-10,0);
    model4.rotation.x = Math.PI/2;
    //add amount of model mods here here #SUUS
    //model3.position.set(0,50,0);
    //add model to the scene

    var scaleSizeModel6 = 9;
    model6.scale.set(scaleSizeModel6,scaleSizeModel6,scaleSizeModel6);
    model6.position.set(80,100,0);
    //model6.rotation.x = Math.PI/2;


    //add models 2 scene here #SUUS
    scene.add(model1);
    scene.add(model2);
    scene.add(model3);
    scene.add(model4);
    scene.add(model5);
    scene.add(model6);
    //continue the process
  });

}


function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}
var dt = 1 / 60

function animate() {

  requestAnimationFrame(animate)

  cannonDebugRenderer.update();

  if (controls.enabled) {
    world.step(dt)
    //cannonDebugRenderer.update();      // Update the debug renderer
    //CannonDebugRenderer.prototype
    // Update ball positions
    for (var i = 0; i < balls.length; i++) {
      ballMeshes[i].position.copy(balls[i].position)
      ballMeshes[i].quaternion.copy(balls[i].quaternion)
    }
  }

  controls.update(Date.now() - time)
  renderer.render(scene, camera)
  time = Date.now()
}

function pointerLock(){

  var havePointerLock =
    'pointerLockElement' in document ||
    'mozPointerLockElement' in document ||
    'webkitPointerLockElement' in document

    if (havePointerLock) {
      var element = document.body

      var pointerlockchange = function (event) {
        if (
          document.pointerLockElement === element ||
          document.mozPointerLockElement === element ||
          document.webkitPointerLockElement === element
        ) {
          controls.enabled = true

          blocker.style.display = 'none'
        } else {
          controls.enabled = false

          blocker.style.display = '-webkit-box'
          blocker.style.display = '-moz-box'
          blocker.style.display = 'box'

          instructions.style.display = ''
        }
      }

      var pointerlockerror = function (event) {
        instructions.style.display = ''
      }

      document.addEventListener('pointerlockchange', pointerlockchange, false)
      document.addEventListener('mozpointerlockchange', pointerlockchange, false)
      document.addEventListener('webkitpointerlockchange', pointerlockchange, false)

      document.addEventListener('pointerlockerror', pointerlockerror, false)
      document.addEventListener('mozpointerlockerror', pointerlockerror, false)
      document.addEventListener('webkitpointerlockerror', pointerlockerror, false)

      instructions.addEventListener(
        'click',
        function (event) {
          instructions.style.display = 'none'

          // Ask the browser to lock the pointer
          element.requestPointerLock =
            element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock

          if (/Firefox/i.test(navigator.userAgent)) {
            var fullscreenchange = function (event) {
              if (
                document.fullscreenElement === element ||
                document.mozFullscreenElement === element ||
                document.mozFullScreenElement === element
              ) {
                document.removeEventListener('fullscreenchange', fullscreenchange)
                document.removeEventListener('mozfullscreenchange', fullscreenchange)

                element.requestPointerLock()
              }
            }

            document.addEventListener('fullscreenchange', fullscreenchange, false)
            document.addEventListener('mozfullscreenchange', fullscreenchange, false)

            element.requestFullscreen =
            element.requestFullscreen ||
            element.mozRequestFullscreen ||
            element.mozRequestFullScreen ||
            element.webkitRequestFullscreen

            element.requestFullscreen()
          } else {
            element.requestPointerLock()
          }
        },
        false
      )
    } else {
      instructions.innerHTML = "Your browser doesn't seem to support Pointer Lock API"
    }
}
//return array with height data from img
function getTerrainPixelData(){
  //img = document.getElementById("landscape-image");
  img.src = "textures/Heightmap.png";
  //var canvas = document.getElementById("canvas");
  var canvas = document.createElement( 'canvas' );

  canvas.width = img.width;
  canvas.height = img.height;
  canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);

  var data = canvas.getContext('2d').getImageData(0,0, img.width, img.height).data;
  var normPixels = []

  for (var i = 0, n = data.length; i < n; i += 4) {
    // get the average value of R, G and B.
    normPixels.push((data[i] + data[i+1] + data[i+2]) / 3);
  }
  //console.log(normPixels);
  //normPixels = null;
  return normPixels;

}

function addGround() {

        var terrain = getTerrainPixelData();
        //var geometry = new THREE.PlaneGeometry(2400, 2400*img.width/img.height, img.height-1, img.width-1);
        //var geometry = new THREE.PlaneGeometry(2400*img.width/img.height, 2400, img.width-1, img.height-1);
        var geometry = new THREE.PlaneGeometry(24*img.width/img.height, 24, img.width-1, img.height-1);
        var material = new THREE.MeshLambertMaterial({
          color: 0xccccff,
          wireframe: true
        });

        for (var i = 0, l = geometry.vertices.length; i < l; i++)
        {
          var terrainValue = terrain[i] / 255;
          geometry.vertices[i].z = geometry.vertices[i].z + terrainValue * height_scale ;
        }
        // might as well free up the input data at this point, or I should say let garbage collection know we're done.
        geometry.computeFaceNormals();
        geometry.computeVertexNormals();
        //console.log(geometry);
        let text1 = new THREE.TextureLoader().load('textures/island2.png');
        var material = new THREE.MeshLambertMaterial( { map: text1 , side: THREE.DoubleSide} );
        var plane = new THREE.Mesh(geometry, material);
        //plane.position = new THREE.Vector3(0,0,0);
        // rotate the plane so up is where y is growing..
        //world.addBody(shape);
        var q = new THREE.Quaternion();
        q.setFromAxisAngle( new THREE.Vector3(-1,0,0), 90 * Math.PI / 180 );
        //var material = new THREE.MeshLambertMaterial( { map: text1 , side: THREE.DoubleSide} );
        plane.quaternion.multiplyQuaternions( q, plane.quaternion );
        plane.position.set(100,0,0);
        plane.rotation.z = Math.PI/2;
        //body.position.set(15,0,100);
        plane.scale.set(8.3333,8.3333,8.3333);
        //plane.position.set(0,0,0);
        scene.add(plane)
        terrain = null;
}

function getHeightData(img,scale) {

  if (scale == undefined) scale=1;

    var canvas = document.createElement( 'canvas' );
    canvas.width = img.width;
    canvas.height = img.height;
    var context = canvas.getContext( '2d' );

    var size = img.width * img.height;
    var data = new Float32Array( size );

    context.drawImage(img,0,0);

    for ( var i = 0; i < size; i ++ ) {
        data[i] = 0
    }

    var imgd = context.getImageData(0, 0, img.width, img.height);
    var pix = imgd.data;

    var j=0;
    for (var i = 0; i<pix.length; i +=4) {
        var all = pix[i]+pix[i+1]+pix[i+2];
        data[j++] = all/(12*scale);
    }

    return data;
}

function fromImage ( image, width, depth, minHeight, maxHeight ) {

    width = width|0;
    depth = depth|0;

    var i, j;
    var matrix = [];
    var canvas = document.createElement( 'canvas' ),
        ctx = canvas.getContext( '2d' );
    var imgData, pixel, channels = 4;
    var heightRange = maxHeight - minHeight;
    var heightData;

    canvas.width  = width;
    canvas.height = depth;

    // document.body.appendChild( canvas );

    ctx.drawImage( image, 0, 0, width, depth );
    imgData = ctx.getImageData( 0, 0, width, depth ).data;

    for ( i = 0|0; i < depth; i = ( i + 1 )|0 ) { //row

      matrix.push( [] );

      for ( j = 0|0; j < width; j = ( j + 1 )|0 ) { //col

        pixel = i * depth + j;
        heightData = imgData[ pixel * channels ] / 255 * heightRange + minHeight;
        matrix[ i ].push( heightData );
      }

    }

    return matrix;

  }
