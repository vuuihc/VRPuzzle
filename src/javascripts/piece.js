export default class Piece {
    constructor(img,x,y,width,height,canvas){
        this.img = img
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.canvas = canvas
        this.canvas.width = 400
        this.canvas.height = 300
        this.context = this.canvas.getContext("2d")
    }
    draw(){
        console.log(this.img,this.x,this.y,this.width,this.height,0,0,this.canvas.width,this.canvas.height)
        // this.context.drawImage(this.img,this.x,this.y,this.width,this.height,0,0,this.canvas.width,this.canvas.height)
        this.context.fillStyle = "rgba(255,255,255,1)"
        this.context.fillRect(0,0,400,300)
    }
}
