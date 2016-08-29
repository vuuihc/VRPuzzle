
import Mouse from "./mouse.js"

export default class Game {
    constructor() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        })
        this.renderer.setPixelRatio(window.devicePixelRatio)

        // Append the canvas element created by the renderer to document body element.
        document.body.appendChild(this.renderer.domElement)

        // Create a three.js scene.
        this.scene = new THREE.Scene()

        // Create a three.js camera.
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000)

        // Apply VR headset positional data to camera.
        this.controls = new THREE.VRControls(this.camera)
            // this.camera.position.y = 5
            //站立姿态
        this.controls.userHeight = 10
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
        this.skybox.position.y = this.boxSize / 2
        this.scene.add(this.skybox)

        //   var panelGeometry = new THREE.PlaneGeometry(2, 1)
        //   var panel = new THREE.Mesh(panelGeometry,material)
        //   panel.position.set(0,2.5,-1.999)
        // // Add cube mesh to your three.js scene
        //   this.scene.add(panel)
        this.placePieces()

        // For high end VR devices like Vive and Oculus, take into account the stage
        // parameters provided.
        //在高端的设备上，要考虑到设备提供的场景信息的更新。
        this.setupStage()
    }
    placePieces() {

        this.columnNumber = 4
        this.pieceNumber = this.columnNumber * this.columnNumber
        this.scaledWidth = 16
        this.scaledHeight = 9
        this.freePieceNumber = this.pieceNumber * 1 / 2
        this.freePieceList = []
        this.planeWidth = this.scaledWidth / this.columnNumber
        this.planeHeight = this.scaledHeight / this.columnNumber
        this.selectedMesh = null //the last clicked meshId
        this.holdMap = {}
            // load an image
        let imageObj = new Image()
        imageObj.src = require("../../public/images/puzzles/cartoon (1).jpg")
        let canvas = document.createElement("canvas")
        let context = canvas.getContext("2d")
        let ws = (canvas.width / 1.5) / imageObj.width
        let hs = (canvas.height / 1.5) / imageObj.height
        this.scale = Math.min(ws, hs)
        this.pieceWidth = imageObj.width / this.columnNumber
        this.pieceHeight = imageObj.height / this.columnNumber
            // console.log(this.pieceWidth,this.pieceHeight)
        let self = this
        imageObj.onload = function() {
            for (let i = 0, index = 0, texture, material, mesh; i < self.columnNumber; i++) {
                for (let j = 0; j < self.columnNumber; j++, index++) {
                    // context.clearRect(0,0,canvas.width,canvas.height)
                    // canvas contents will be used for a texture
                    canvas = document.createElement("canvas")
                    context = canvas.getContext("2d")
                    texture = new THREE.Texture(canvas)
                        // after the image is loaded, this function executes
                        // console.log(canvas.width,canvas.height)
                        // console.log(this.img.src)
                        // context.scale(self.scale,self.scale)
                    context.drawImage(imageObj, i * self.pieceWidth, j * self.pieceHeight, self.pieceWidth, self.pieceHeight, 0, 0, canvas.width, canvas.height)
                    if (texture) // checks if texture exists
                        texture.needsUpdate = true

                    material = new THREE.MeshBasicMaterial({
                        map: texture,
                        side: THREE.DoubleSide
                    })
                    material.transparent = false

                    mesh = new THREE.Mesh(
                        new THREE.PlaneGeometry(self.planeWidth, self.planeHeight),
                        material
                    )
                    let random = Math.random()
                    if (random < self.freePieceNumber / (self.columnNumber * self.columnNumber - index) && self.freePieceNumber > 0) {
                        let x = -self.boxSize / 2 + self.planeWidth / 2 + Math.random() * (self.boxSize - self.planeWidth)
                        let z = -self.boxSize / 2 + self.planeHeight / 2 + Math.random() * (self.boxSize - self.planeHeight)
                        mesh.rotation.x = Math.PI / 2
                        mesh.position.set(Math.round(x), 0.5, Math.round(z))
                        let blankMesh = mesh.clone()
                        self.holdMap[mesh.id] = blankMesh
                        console.log(blankMesh.rotation === mesh.rotation)
                        blankMesh.rotation.x = 0
                        blankMesh.material = new THREE.MeshBasicMaterial({
                            color: 0x808080,
                            side: THREE.DoubleSide
                        })
                        blankMesh.position.set(i*self.planeWidth - self.scaledWidth / 2 + self.planeWidth / 2, self.scaledHeight - self.planeHeight / 2 - j * self.planeHeight, -9.99)
                        self.scene.add(blankMesh)
                        self.freePieceNumber--
                            self.freePieceList.push(mesh.id)
                    } else {
                        mesh.position.set(i * self.planeWidth - self.scaledWidth / 2 + self.planeWidth / 2, self.scaledHeight - self.planeHeight / 2 - j * self.planeHeight, -9.99)
                    }
                    // mesh.position.set(0, 2,-9)
                    self.meshList.push(mesh)
                    self.scene.add(mesh)
                        // console.log(typeof this.scene)
                }
            }
        }
        console.log(this.holdMap)
    }
    render(timestamp) {
        // var delta = Math.min(timestamp - this.lastRender, 500)
        this.lastRender = timestamp
            //处理鼠标点击
        this.raycaster.setFromCamera(this.mouse, this.camera)
        let intersects = this.raycaster.intersectObjects(this.scene.children)
        this.mouse.x = this.mouse.y = undefined
        if (intersects.length > 0) {
            let clickFlag = false
            for (let mesh of this.meshList) {
                // console.log(this.freePieceList)
                // console.log(`${mesh.id} in ${this.freePieceList},${mesh.id in this.freePieceList}`)
                if ((this.freePieceList.indexOf(mesh.id) > -1)) {
                    // mesh.material.color.set(0xff0000)
                    if(mesh.id == intersects[0].object.id){
                        mesh.rotation.x = 0
                        this.selectedMesh = mesh
                        clickFlag = true
                    }else{
                        mesh.rotation.x = Math.PI / 2
                    }
                } else {
                    mesh.rotation.x = 0
                }
            }
            if(this.selectedMesh && this.holdMap[this.selectedMesh.id].id == intersects[0].object.id){
                let t = intersects[0].object.position
                this.selectedMesh.position.set(t.x,t.y,t.z)
                this.selectedMesh.rotation.x = 0
                this.holdMap[this.selectedMesh.id].position.z -= 1
                this.freePieceList.splice(this.freePieceList.indexOf(this.selectedMesh.id),1)
            }
            if(!clickFlag){
                this.selectedMesh = null
            }
        }
        // console.log(this.selectedId)
        //   立方体的旋转
        //   this.cube.rotation.y += delta * 0.0006;

        // Update VR headset position and apply to camera.
        //更新获取HMD的信息
        this.controls.update()


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
        this.skybox.position.y = this.boxSize / 2
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
