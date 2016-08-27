export default class Mouse extends THREE.Vector2{
    constructor(props){
        super(props)
        this.x = undefined
        this.y = undefined
        window.addEventListener( "click", this.onMouseClick.bind(this), false )

    }
    onMouseClick( event ) {
    	// calculate mouse position in normalized device coordinates
    	// (-1 to +1) for both components
        this.x = ( event.clientX / window.innerWidth ) * 2 - 1
        this.y = - ( event.clientY / window.innerHeight ) * 2 + 1
    }
}
