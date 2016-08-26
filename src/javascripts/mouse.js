export default class Mouse extend THREE.Vector2{
    constructor(props){
        super(props)
        window.addEventListener( 'mousemove', this.onMouseMove.bind(this), false );

    }
    onMouseMove( event ) {
    	// calculate mouse position in normalized device coordinates
    	// (-1 to +1) for both components
    	this.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    	this.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    }
}
