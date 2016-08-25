import Piece from "./piece.js"

export default class Game{
    constructor(){
        this.renderer = new THREE.WebGLRenderer({antialias: true})
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // Append the canvas element created by the renderer to document body element.
        document.body.appendChild(this.renderer.domElement);

        // Create a three.js scene.
        this.scene = new THREE.Scene();

        // Create a three.js camera.
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);

        // Apply VR headset positional data to camera.
        this.controls = new THREE.VRControls(this.camera);
        //站立姿态
        this.controls.standing = true;
        this.effect = new THREE.VREffect(this.renderer);
        this.effect.setSize(window.innerWidth, window.innerHeight);

        // Create a VR manager helper to enter and exit VR mode.
        //按钮和全屏模式管理
        var params = {
          hideButton: false, // Default: false.
          isUndistorted: false // Default: false.
        };
        this.manager = new WebVRManager(this.renderer, this.effect, params);

        //bind this
        this.onTextureLoaded = this.onTextureLoaded.bind(this)
        this.onResize = this.onResize.bind(this)
        this.render = this.render.bind(this)
        this.setupStage = this.setupStage.bind(this)
        this.setStageDimensions = this.setStageDimensions.bind(this)
        this.placePieces = this.placePieces.bind(this)
        //

        // Add a repeating grid as a skybox.
        this.boxSize = 20;
        this.loader = new THREE.TextureLoader();
        this.loader.load('public/images/box.png', this.onTextureLoaded);
        window.addEventListener('resize', this.onResize, true);
        window.addEventListener('vrdisplaypresentchange', this.onResize, true);
        this.lastRender = 0
        this.display = null
    }
    onTextureLoaded(texture) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(this.boxSize, this.boxSize);

      let geometry = new THREE.BoxGeometry(this.boxSize, this.boxSize, this.boxSize);
      let material = new THREE.MeshBasicMaterial({
        map: texture,
        color: "rgba(255,255,255,1)",
        side: THREE.BackSide
      });

      // Align the skybox to the floor (which is at y=0).
      this.skybox = new THREE.Mesh(geometry, material);
      this.skybox.position.y = this.boxSize/2;
      this.scene.add(this.skybox);

      var panelGeometry = new THREE.PlaneGeometry(2, 1);
      var panel = new THREE.Mesh(panelGeometry,material);
      panel.position.set(0,2.5,-1.999)
      // Add cube mesh to your three.js scene
      this.scene.add(panel);
      this.placePieces()

      // For high end VR devices like Vive and Oculus, take into account the stage
      // parameters provided.
      //在高端的设备上，要考虑到设备提供的场景信息的更新。
      this.setupStage();
    }
    placePieces(){
        this.img = document.getElementById("img1")
        this.imgWidth = this.img.width
        this.imgHeight = this.img.height
        this.columnNumber = 4
        this.pieceWidth = this.pieceHeight = this.imgWidth/this.columnNumber
        this.rowNumber = this.imgHeight/this.pieceWidth
        this.canvas = document.createElement("canvas")
        // this.piece = new Piece(this.img,0,0,this.pieceWidth,this.pieceHeight,this.canvas)
        this.canvas.width = 400
        this.canvas.height = 300
        let context = this.canvas.getContext("2d")
        // context.drawImage(this.img,360,360)
        context.fillStyle = "rgba(255,255,255,1)"
        context.fillRect(0,0,400,300)
        // document.body.appendChild(this.canvas)
        console.log(this.canvas)
        let cubeGeometry = new THREE.BoxGeometry(0.5,0.5,0.5);
        let newMaterial = new THREE.MeshLambertMaterial()
        let newTexture = new THREE.Texture(this.canvas)
        // let texture = THREE.ImageUtils.loadTexture( "../../public/images/puzzles/cartoon (1).jpg" )
        newTexture.needsUpdate = true
        newMaterial.map = newTexture
        // newMaterial.map.needUpdate = true
        let panel = new THREE.Mesh(cubeGeometry,newMaterial);
        panel.position.set(0,this.controls.userHeight,-1.9)
        // Add cube mesh to your three.js scene
        // this.scene.add(panel);

        var canvas1 = document.createElement('canvas');
    	var context1 = canvas1.getContext('2d');
    	context1.font = "Bold 40px Arial";
    	context1.fillStyle = "rgba(255,255,255,0.95)";
        context1.fillText('Hello, world!', 50, 50);

    	// canvas contents will be used for a texture
    	var texture1 = new THREE.Texture(canvas1)
    	texture1.needsUpdate = true;

        var material1 = new THREE.MeshBasicMaterial( {map: texture1, side:THREE.DoubleSide } );
        // material1.transparent = true;
        var mesh1 = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 5),
            material1
          );
    	mesh1.position.set(0,2,-9);
    	this.scene.add( mesh1 );

        var canvas2 = document.createElement('canvas');
    	var context2 = canvas2.getContext('2d');
    	// canvas contents will be used for a texture
    	var texture2 = new THREE.Texture(canvas2);

    	// load an image
    	var imageObj = new Image();
    	imageObj.src = "../../public/images/puzzles/cartoon (1).jpg";
    	// after the image is loaded, this function executes
    	imageObj.onload = function()
    	{
    		context2.drawImage(imageObj, 50, 50);
    		if ( texture2 ) // checks if texture exists
    			texture2.needsUpdate = true;
    	};

        var material2 = new THREE.MeshBasicMaterial( {map: texture2, side:THREE.DoubleSide} );
        material2.transparent = true;


        console.log(canvas2.width, canvas2.height)
        var mesh2 = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 10),
            material2
          );
    	mesh2.position.set(0,4,9.9);
    	this.scene.add( mesh2 );

    }
    render(timestamp){
          var delta = Math.min(timestamp - this.lastRender, 500);
          this.lastRender = timestamp;

          //立方体的旋转
        //   this.cube.rotation.y += delta * 0.0006;

          // Update VR headset position and apply to camera.
          //更新获取HMD的信息
          this.controls.update();


          // Render the scene through the manager.
          //进行camera更新和场景绘制
          this.manager.render(this.scene, this.camera, timestamp);
          // renderer.render(scene,camera)

          requestAnimationFrame(this.render);
    }
    onResize(e) {
      this.effect.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    }
    setStageDimensions(stage) {
      // Make the skybox fit the stage.
      var material = this.skybox.material;
      this.scene.remove(this.skybox);

      // Size the skybox according to the size of the actual stage.
      var geometry = new THREE.BoxGeometry(stage.sizeX, this.boxSize, stage.sizeZ);
      this.skybox = new THREE.Mesh(geometry, material);

      // Place it on the floor.
      this.skybox.position.y = this.boxSize/2;
      this.scene.add(this.skybox);

      // Place the cube in the middle of the scene, at user height.
    //   cube.position.set(0, controls.userHeight, 0);
    }
    setupStage() {
        const self = this
      navigator.getVRDisplays().then(function(displays) {
        if (displays.length > 0) {
          self.display = displays[0];
          if (self.display.stageParameters) {
            setStageDimensions(self.display.stageParameters);
          }
        }
      });
    }
}
