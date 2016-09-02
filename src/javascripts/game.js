
import Mouse from "./mouse.js"
import swal from "sweetalert"

export default class Game {
    constructor() {
        // Create a three.js scene.
        this.scene = new THREE.Scene()

        // Create a three.js camera.
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000)

        this.camera.position.set(0,10,0)
        this.controls = new THREE.DeviceOrientationControls( this.camera );

        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.domElement.style.position = 'absolute';
		this.renderer.domElement.style.top = 0;
		document.body.appendChild(this.renderer.domElement);

        // raycaster
        this.raycaster = new THREE.Raycaster()
        this.mouse = new Mouse()
            //bind this
        this.onTextureLoaded = this.onTextureLoaded.bind(this)
        this.onResize = this.onResize.bind(this)
        this.render = this.render.bind(this)
        this.placePieces = this.placePieces.bind(this)
            //
        this.meshList = []
        this.logFlag = true
            // Add a repeating grid as a skybox.
        this.boxSize = 30
        // this.loader = new THREE.TextureLoader()
        // this.loader.load("public/images/box.png", this.onTextureLoaded)
        // let texture = new THREE.Texture()
        this.onTextureLoaded()
        window.addEventListener("resize", this.onResize, true)
        // window.addEventListener("vrdisplaypresentchange", this.onResize, true)
        this.lastRender = 0
        this.display = null
    }
    onTextureLoaded() {
        // texture.wrapS = THREE.RepeatWrapping
        // texture.wrapT = THREE.RepeatWrapping
        // texture.repeat.set(this.boxSize, this.boxSize)

        let geometry = new THREE.BoxGeometry(this.boxSize, this.boxSize, this.boxSize)
        let material = new THREE.MeshBasicMaterial({ color: 0xff00ff, side: THREE.BackSide, wireframe: true } )

        // Align the skybox to the floor (which is at y=0).
        this.skybox = new THREE.Mesh(geometry, material)
        this.skybox.position.y = this.boxSize / 2
        this.scene.add(this.skybox)
        this.placePieces()
        this.placeSphere()
    }
    placeSphere(){
        var geometry = new THREE.SphereGeometry( 50, 16, 8 );
        geometry.scale(-1,1,1)
		// geometry.scale( - 1, 1, 1 );
        // var sphere = require("../../public/images/sphere (2).jpg")
        var loader = new THREE.TextureLoader()
        var self = this
        loader.load("public/images/sphere (2).jpg",function(texture){
            var material = new THREE.MeshBasicMaterial( {
    			map: texture
    		} );

    		var mesh = new THREE.Mesh( geometry, material );
            // console.log(mesh)
            mesh.position.set(0,0,10)
    		self.scene.add( mesh );
        })
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
        this.meshCanvasMap = {}
        // this.
            // load an image
        let imageObj = new Image()
        imageObj.src = require("../../public/images/puzzles/cartoon (5).jpg")
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
                    canvas = document.createElement("canvas")
                    context = canvas.getContext("2d")
                    texture = new THREE.Texture(canvas)
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
                        blankMesh.rotation.x = 0
                        blankMesh.material = new THREE.MeshBasicMaterial({
                            color: 0x808080,
                            side: THREE.DoubleSide
                        })
                        blankMesh.position.set(i*self.planeWidth - self.scaledWidth / 2 + self.planeWidth / 2, 5 + self.scaledHeight - self.planeHeight / 2 - j * self.planeHeight, -9.99)
                        self.scene.add(blankMesh)
                        self.freePieceNumber--
                        self.freePieceList.push(mesh.id)
                        self.meshCanvasMap[mesh.id] = canvas
                    } else {
                        mesh.position.set(i * self.planeWidth - self.scaledWidth / 2 + self.planeWidth / 2, 5 + self.scaledHeight - self.planeHeight / 2 - j * self.planeHeight, -9.99)
                    }
                    // mesh.position.set(0, 2,-9)
                    self.meshList.push(mesh)
                    self.scene.add(mesh)
                        // console.log(typeof this.scene)
                }
            }
        }
        // swal({
        //     title: "提示",
        //     text: "把屏幕中央的小手对准地上的图片，点击按钮捡起，再把图片对准原图位置，点击贴上",
        //     confirmButtonText: "好的"
        // })
    }
    render(timestamp) {
        // var delta = Math.min(timestamp - this.lastRender, 500)
        this.lastRender = timestamp
            //处理鼠标点击
        this.raycaster.setFromCamera(this.mouse, this.camera)
        let intersects = this.raycaster.intersectObjects(this.scene.children)
        this.mouse.x = this.mouse.y = undefined
        if (intersects.length > 0) {
            // console.log(intersects)
            let clickFlag = false
            for (let mesh of this.meshList) {

                if (this.freePieceList.indexOf(mesh.id) > -1 && mesh.id == intersects[0].object.id) {
                    // mesh.material.color.set(0xff0000)
                    if(this.selectedMesh!==null){
                        this.clearCanvas()
                        this.selectedMesh.visible = true
                    }
                    this.selectedMesh = mesh
                    this.mouse.pickBtn.innerHTML = "贴上"
                    clickFlag = true

                    mesh.visible = false
                    document.getElementById("pin").appendChild(this.meshCanvasMap[mesh.id])
                }
            }
            if(this.selectedMesh && this.holdMap[this.selectedMesh.id].id == intersects[0].object.id){
                let t = intersects[0].object.position
                this.selectedMesh.position.set(t.x,t.y,t.z)
                this.selectedMesh.rotation.set(0,0,0)
                this.holdMap[this.selectedMesh.id].position.z -= 1
                this.selectedMesh.visible = true
                this.mouse.pickBtn.innerHTML = "捡起"
                //在未拼成图片列表中取出当前项
                this.freePieceList.splice(this.freePieceList.indexOf(this.selectedMesh.id),1)
                //清楚当前选取的图像
                this.clearCanvas()
                this.selectedMesh = null
                if(this.freePieceList.length == 0){
                    swal({
                        title:"恭喜！",
                        text: "成功拼完了一张图，可是我也不会给你流量",
                        confirmButtonText: "好的"
                    })
                }
            }
            if(this.selectedMesh && !clickFlag){
                this.mouse.pickBtn.innerHTML = "捡起"
                this.selectedMesh.visible = true
                this.clearCanvas()
                this.selectedMesh = null
            }
        }

        this.controls.update()
        this.renderer.render(this.scene,this.camera)

        requestAnimationFrame(this.render)
    }
    onResize(e) {
        this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize( window.innerWidth, window.innerHeight );
    }
    clearCanvas(){
        let canvas = document.querySelector("#pin canvas")
        let pin = document.getElementById("pin")
        while(canvas!=null){
            pin.removeChild(canvas)
            canvas = document.querySelector("#pin canvas")
        }
    }
}
