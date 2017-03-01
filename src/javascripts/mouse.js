export default class Mouse extends THREE.Vector2{
    constructor(props){
        super(props)
        this.x = undefined
        this.y = undefined
        // window.addEventListener( "click", this.onMouseClick.bind(this), false )
        this.pickBtn = document.getElementById("pick-btn")
        this.pickHand = document.getElementById("pick-hand")
        this.pickBtn.addEventListener("click",this.btnOnClick.bind(this),false)
        // window.addEventListener("click",this.onMouseClick.bind(this),false)
    }
    onMouseClick( event ) {
        this.x = ( event.clientX / window.innerWidth ) * 2 - 1
        this.y = - ( event.clientY / window.innerHeight ) * 2 + 1
    }
    btnOnClick( event ) {
        this.x = ( 0.5 ) * 2 - 1
        this.y = - ( 0.4 ) * 2 + 1
    }
}
