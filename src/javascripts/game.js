import Mouse from "./mouse.js"

export default class Game{
    constructor(){
        this.renderer = new THREE.WebGLRenderer({antialias: true})
        this.renderer.setPixelRatio(window.devicePixelRatio)

        // Append the canvas element created by the renderer to document body element.
        document.body.appendChild(this.renderer.domElement)

        // Create a three.js scene.
        this.scene = new THREE.Scene()

        // Create a three.js camera.
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000)

        // Apply VR headset positional data to camera.
        this.controls = new THREE.VRControls(this.camera)
        //站立姿态
        this.controls.standing = true
        this.effect = new THREE.VREffect(this.renderer)
        this.effect.setSize(window.innerWidth, window.innerHeight)

        // Create a VR manager helper to enter and exit VR mode.
        //按钮和全屏模式管理
        var params = {
            hideButton: false, // Default: false.
            isUndistorted: false // Default: false.
        }
        this.manager = new WebVRManager(this.renderer, this.effect, params)

        // raycaster
        this.raycaster = new THREE.Raycaster()
        this.mouse = new Mouse()
        //bind this
        this.onTextureLoaded = this.onTextureLoaded.bind(this)
        this.onResize = this.onResize.bind(this)
        this.render = this.render.bind(this)
        this.setupStage = this.setupStage.bind(this)
        this.setStageDimensions = this.setStageDimensions.bind(this)
        this.placePieces = this.placePieces.bind(this)
        //
        this.meshList = []
        this.logFlag = true
        // Add a repeating grid as a skybox.
        this.boxSize = 20
        this.loader = new THREE.TextureLoader()
        this.loader.load("public/images/box.png", this.onTextureLoaded)
        window.addEventListener("resize", this.onResize, true)
        window.addEventListener("vrdisplaypresentchange", this.onResize, true)
        this.lastRender = 0
        this.display = null
    }
    onTextureLoaded(texture) {
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        texture.repeat.set(this.boxSize, this.boxSize)

        let geometry = new THREE.BoxGeometry(this.boxSize, this.boxSize, this.boxSize)
        let material = new THREE.MeshBasicMaterial({
            map: texture,
            color: "rgba(255,255,255,1)",
            side: THREE.BackSide
        })

      // Align the skybox to the floor (which is at y=0).
        this.skybox = new THREE.Mesh(geometry, material)
        this.skybox.position.y = this.boxSize/2
        this.scene.add(this.skybox)

        var panelGeometry = new THREE.PlaneGeometry(2, 1)
        var panel = new THREE.Mesh(panelGeometry,material)
        panel.position.set(0,2.5,-1.999)
      // Add cube mesh to your three.js scene
        this.scene.add(panel)
        this.placePieces()

      // For high end VR devices like Vive and Oculus, take into account the stage
      // parameters provided.
      //在高端的设备上，要考虑到设备提供的场景信息的更新。
        this.setupStage()
    }
    placePieces(){

        this.columnNumber = 4

        var canvas1 = document.createElement("canvas")
        var context1 = canvas1.getContext("2d")
        context1.font = "Bold 40px Arial"
        context1.fillStyle = "rgba(255,255,255,0.95)"
        context1.fillText("Hello, world!", 50, 50)

        // canvas contents will be used for a texture
        var texture1 = new THREE.Texture(canvas1)
        texture1.needsUpdate = true

        var material1 = new THREE.MeshBasicMaterial( {map: texture1, side:THREE.DoubleSide } )
        // material1.transparent = true;
        var mesh1 = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 5),
            material1
          )
        mesh1.position.set(0,2,9)
        this.scene.add( mesh1 )

        // load an image
        let imageObj = new Image()
        imageObj.src = require("../../public/images/puzzles/cartoon (1).jpg")
        // this.columnNumber = 2
        let canvas = document.createElement("canvas")
        let context = canvas.getContext("2d")
        let ws = (canvas.width/1.5)/imageObj.width
        let hs = (canvas.height/1.5)/imageObj.height
        this.scale = Math.min(ws,hs)
        this.pieceWidth = imageObj.width/this.columnNumber
        this.pieceHeight = imageObj.height/this.columnNumber
        // console.log(this.pieceWidth,this.pieceHeight)
        let texture,material,mesh,self = this
        imageObj.onload = function(){
            for(let i = 0; i<self.columnNumber;i++){
                for(let j = 0; j<self.columnNumber; j++){
                    // context.clearRect(0,0,canvas.width,canvas.height)
                    // canvas contents will be used for a texture
                    canvas = document.createElement("canvas")
                    context = canvas.getContext("2d")
                    texture = new THREE.Texture(canvas)
                    // after the image is loaded, this function executes
                    // console.log(canvas.width,canvas.height)
                    // console.log(this.img.src)
                    context.scale(self.scale,this.scale)
                    context.drawImage(imageObj, i*self.pieceWidth,j*self.pieceHeight,self.pieceWidth,self.pieceHeight,0,0,canvas.width,canvas.height)
                    if ( texture ) // checks if texture exists
                        texture.needsUpdate = true

                    material = new THREE.MeshBasicMaterial( {map: texture, side:THREE.DoubleSide} )
                    material.transparent = false

                    mesh = new THREE.Mesh(
                        new THREE.PlaneGeometry(3, 3),
                        material
                    )
                    mesh.position.set(i*3, 3*self.columnNumber-j*3,-9)
                    self.meshList.push(mesh)
                    self.scene.add( mesh )
                    // console.log(typeof this.scene)
                }
            }
        }
    }
    render(timestamp){
        // var delta = Math.min(timestamp - this.lastRender, 500)
        this.lastRender = timestamp
        //处理鼠标点击
        this.raycaster.setFromCamera(this.mouse,this.camera)
        // console.log(this.mouse.x,this.mouse.y)
        let intersects = this.raycaster.intersectObjects( this.scene.children )
        // for ( var i = 0; i < intersects.length; i++ ) {
        //     // if(intersects[ i ].object.id in this.meshList)
        //     // intersects[ i ].object.material.color.set( 0xff0000 )
        //     console.log(intersects[i])
        // }
        this.mouse.x = this.mouse.y = undefined
        // console.log(this.meshList)
        // let intersectList = intersects.map(_=>_.object)
        // if(this.logFlag && intersectList.length!==0){
        //     console.log(intersectList)
        // }
        if(intersects.length>0){
            for(let mesh of this.meshList){
                if(mesh.id == intersects[0].object.id){
                    // mesh.material.color.set(0xff0000)
                    mesh.position.z = -7
                }else{
                    mesh.position.z = -9
                    // mesh.material.color.set(0xffffff)
                }
            }
        }
        //   立方体的旋转
        //   this.cube.rotation.y += delta * 0.0006;

          // Update VR headset position and apply to camera.
          //更新获取HMD的信息
        this.controls.update()
        // console.log(this.meshList.length)
        // if(this.meshList.length!==0){
            // this.meshList[0].rotation.y += 0.2
            // this.meshList[3].rotation.y += 0.2
            // this.meshList[0].rotation.y += 0.2
        // }

          // Render the scene through the manager.
          //进行camera更新和场景绘制
        this.manager.render(this.scene, this.camera, timestamp)
          // renderer.render(scene,camera)

        requestAnimationFrame(this.render)
    }
    onResize(e) {
        this.effect.setSize(window.innerWidth, window.innerHeight)
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
    }
    setStageDimensions(stage) {
      // Make the skybox fit the stage.
        var material = this.skybox.material
        this.scene.remove(this.skybox)

      // Size the skybox according to the size of the actual stage.
        var geometry = new THREE.BoxGeometry(stage.sizeX, this.boxSize, stage.sizeZ)
        this.skybox = new THREE.Mesh(geometry, material)

      // Place it on the floor.
        this.skybox.position.y = this.boxSize/2
        this.scene.add(this.skybox)

      // Place the cube in the middle of the scene, at user height.
    //   cube.position.set(0, controls.userHeight, 0);
    }
    setupStage() {
        const self = this
        navigator.getVRDisplays().then(function(displays) {
            if (displays.length > 0) {
                self.display = displays[0]
                if (self.display.stageParameters) {
                    self.setStageDimensions(self.display.stageParameters)
                }
            }
        })
    }
}
